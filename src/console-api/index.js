const express = require("express");
const app = (module.exports = express());
const { exec } = require('child_process');
const prisma = require("../prisma");
const { ErrorHandler } = require("../utils/error");
const { requireAuth } = require('../middlewares/auth');
const yup = require("yup");
const instanceService = require('../services/instance.service');

// Middleware
const {
  allowCrossDomain,
  validateRequest,
  jwtRequired,
  passUserFromJWT,
} = require("../middlewares");

app.use(allowCrossDomain);

// Server Status & Control
app.get("/instances/:instance_id/status", [jwtRequired], async (req, res) => {
  const instance = await prisma.instances.findUnique({
    where: { id: req.params.instance_id }
  });
  
  return res.json({
    code: 200,
    data: { status: instance.status }
  });
});

app.post("/instances/:instance_id/command", [
  jwtRequired,
  validateRequest(
    yup.object().shape({
      requestBody: yup.object().shape({
        command: yup.string().required().max(1000)
      }),
      params: yup.object().shape({
        instance_id: yup.string().uuid().required()
      })
    })
  )
], async (req, res) => {
  try {
    // Validate instance exists
    const instance = await prisma.instances.findUnique({
      where: { id: req.params.instance_id }
    });

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "Instance not found"
      });
    }

    // Execute command and get output
    const output = await instanceService.executeCommand(
      req.params.instance_id, 
      req.body.command
    );
    
    // Log successful command execution
    console.log(`Command executed successfully for instance ${req.params.instance_id}:`, {
      command: req.body.command,
      output: output.substring(0, 200) // Log first 200 chars of output
    });
    
    return res.json({
      code: 200,
      data: { output }
    });
  } catch (error) {
    console.error('Command execution failed:', error);
    return res.status(500).json({
      code: 500,
      message: "Command execution failed",
      error: error.message,
      details: error.stack // Include stack trace for debugging
    });
  }
});

app.post("/instances/:instance_id/:action", [
  jwtRequired,
  validateRequest(
    yup.object().shape({
      params: yup.object().shape({
        instance_id: yup.string().required(),
        action: yup.string().required()
      })
    })
  )
], async (req, res) => {
  const { instance_id, action } = req.params;

  switch (action) {
    case 'start':
      await instanceService.startInstance(instance_id);
      break;
    case 'stop':
      await instanceService.stopInstance(instance_id);
      break;
    case 'restart':
      await instanceService.restartInstance(instance_id);
      break;
  }

  return res.json({ code: 200, message: "success" });
});

// Console Logs & Commands
app.get("/instances/:instance_id/logs", [
  jwtRequired,
  validateRequest(
    yup.object().shape({
      query: yup.object().shape({
        limit: yup.number().min(1).max(1000).default(100),
        offset: yup.number().min(0).default(0)
      })
    })
  )
], async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const logs = await instanceService.getInstanceLogs(req.params.instance_id, {
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });
    
    return res.json({
      code: 200,
      data: { 
        logs,
        pagination: {
          limit: parseInt(limit) || 100,
          offset: parseInt(offset) || 0
        }
      }
    });
  } catch (error) {
    throw new ErrorHandler(500, "Failed to fetch logs", [error.message]);
  }
});

// Statistics & Monitoring
app.get("/instances/:instance_id/stats", [jwtRequired], async (req, res) => {
  const stats = await instanceService.getInstanceStats(req.params.instance_id);
  return res.json({
    code: 200,
    data: stats
  });
});

// Backup Management
app.post("/instances/:instance_id/backups", [
  jwtRequired,
  validateRequest(
    yup.object().shape({
      requestBody: yup.object().shape({
        name: yup.string().required(),
        description: yup.string()
      })
    })
  )
], async (req, res) => {
  const { instance_id } = req.params;
  const { name, description } = req.body;

  const backup = await prisma.backups.create({
    data: {
      name,
      description,
      instanceId: instance_id,
      status: 'pending'
    }
  });

  // Execute backup process (implement backup logic here)
  // For example: zip the instance directory

  return res.json({
    code: 200,
    data: { backup }
  });
});

app.get("/instances/:instance_id/backups", [jwtRequired], async (req, res) => {
  const backups = await prisma.backups.findMany({
    where: { instanceId: req.params.instance_id },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({
    code: 200,
    data: { backups }
  });
});

// File Management
app.get("/instances/:instance_id/files", [jwtRequired], async (req, res) => {
  try {
    const instance = await prisma.instances.findUnique({
      where: { id: req.params.instance_id }
    });

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "Instance not found"
      });
    }

    const { readdir, stat } = require('fs/promises');
    const path = require('path');
    
    // Get instance path from database
    const instancePath = await prisma.instancePaths.findUnique({
      where: { instanceId: instance.id }
    });
    
    if (!instancePath) throw new Error('Instance path not found in database');
    const basePath = instancePath.path;
    
    // Sanitize and validate the path
    const requestedPath = req.query.path || '/';
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');
    const directory = path.join(basePath, normalizedPath);

    // Verify the directory exists
    try {
      await stat(directory);
    } catch (error) {
      return res.status(404).json({
        code: 404,
        message: "Directory not found",
        path: normalizedPath
      });
    }

    const files = await readdir(directory);
    const fileStats = await Promise.all(
      files.map(async file => {
        const filePath = path.join(directory, file);
        const stats = await stat(filePath);
        const relativePath = path.relative(basePath, filePath);
        
        return {
          name: file,
          path: relativePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          modified: stats.mtime
        };
      })
    );

    return res.json({
      code: 200,
      data: { files: fileStats }
    });
  } catch (error) {
    console.error('File listing error:', error);
    return res.status(500).json({
      code: 500,
      message: "Failed to read directory",
      error: error.message
    });
  }
});

app.get("/instances/:instance_id/files/content", [jwtRequired], async (req, res) => {
  try {
    const instance = await prisma.instances.findUnique({
      where: { id: req.params.instance_id }
    });

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "Instance not found"
      });
    }

    const instancePath = await prisma.instancePaths.findUnique({
      where: { instanceId: instance.id }
    });
    
    if (!instancePath) {
      throw new Error('Instance path not found in database');
    }

    const { readFile } = require('fs/promises');
    const path = require('path');
    const filePath = path.join(instancePath.path, req.query.path);

    const content = await readFile(filePath, 'utf8');
    return res.json({
      code: 200,
      data: { content }
    });
  } catch (error) {
    throw new ErrorHandler(500, "Failed to read file", [error.message]);
  }
});

app.put("/instances/:instance_id/files/content", [jwtRequired], async (req, res) => {
  try {
    const instance = await prisma.instances.findUnique({
      where: { id: req.params.instance_id }
    });

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "Instance not found"
      });
    }

    const instancePath = await prisma.instancePaths.findUnique({
      where: { instanceId: instance.id }
    });
    
    if (!instancePath) {
      throw new Error('Instance path not found in database');
    }

    const { writeFile } = require('fs/promises');
    const path = require('path');
    const filePath = path.join(instancePath.path, req.body.path);

    await writeFile(filePath, req.body.content, 'utf8');
    return res.json({
      code: 200,
      message: "File saved successfully"
    });
  } catch (error) {
    throw new ErrorHandler(500, "Failed to save file", [error.message]);
  }
});

// Rename the endpoint to match the client's expectation
app.get("/blogs/:blog_id/server", [jwtRequired], async (req, res) => {
  try {
    console.log('Looking for blog instance with BlogId:', req.params.blog_id);
    
    const instance = await prisma.instances.findFirst({
      where: { 
        BlogId: parseInt(req.params.blog_id)
      }
    });

    console.log('Found instance:', instance);

    if (!instance) {
      return res.status(404).json({
        code: 404,
        message: "No server instance found for this blog",
        blogId: req.params.blog_id
      });
    }

    return res.json({
      code: 200,
      data: {
        server_id: instance.id
      }
    });
  } catch (error) {
    console.error('Failed to fetch blog instance:', error);
    return res.status(500).json({
      code: 500,
      message: "Failed to fetch server instance",
      error: error.message
    });
  }
});