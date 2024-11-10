const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const prisma = require('../prisma');
const net = require('net');

async function validateInstanceId(instanceId) {
  if (!instanceId) {
    throw new Error('Instance ID is required');
  }
  const instance = await prisma.instances.findUnique({ 
    where: { id: instanceId } 
  });
  if (!instance) {
    throw new Error('Instance not found');
  }
  return instance;
}

async function getInstancePath(instanceId) {
  const instancePath = await prisma.instancePaths.findUnique({
    where: { instanceId }
  });
  if (!instancePath) {
    throw new Error('Instance path not found');
  }
  return instancePath.path;
}

async function initializeInstance(instanceId) {
  const instance = await validateInstanceId(instanceId);
  const instancePath = await getInstancePath(instanceId);

  // Create instance directory
  await fs.ensureDir(instancePath);

  // Clone template repository
  await new Promise((resolve, reject) => {
    exec(`git clone https://github.com/bloggrs/bloggrs.platform.next.git ${instancePath}`,
      (error) => {
        if (error) reject(error);
        else resolve();
      });
  });

  // Update instance configuration
  const config = {
    blogId: instance.BlogId,
    apiKey: instance.id,
    // Add other configuration as needed
  };

  await fs.writeJson(path.join(instancePath, 'config.json'), config);

  // Create instancePath record
  await prisma.instancePaths.create({
    data: {
      instanceId: instance.id,
      path: instancePath
    }
  });

  // Update instance status
  await prisma.instances.update({
    where: { id: instanceId },
    data: { status: 'ready' }
  });

  return instance;
}

async function findAvailablePort(startPort = 8080) {
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close();
        resolve(true);
      }).on('error', () => {
        resolve(false);
      });
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}

async function startInstance(instanceId) {
  const instance = await validateInstanceId(instanceId);
  const instancePath = await getInstancePath(instanceId);
  const port = await findAvailablePort();
  
  // Ensure .next directory has proper permissions
  const nextDir = path.join(instancePath, '.next');
  await fs.ensureDir(nextDir);
  await fs.chmod(nextDir, 0o777); // Grant full permissions to .next directory
  
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: port,
      // Disable telemetry and tracing to avoid permission issues
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_DISABLE_SOURCEMAPS: '1',
      NEXT_DISABLE_TRACE: '1'
    };

    // Ensure we're in the correct directory and install dependencies first
    exec('npm install && npm run dev', 
      { 
        cwd: instancePath,
        env,
        shell: true
      },
      async (error) => {
        if (error) {
          console.error('Start instance error:', error);
          // Log the error and update instance status
          await appendInstanceLog(instanceId, `Start failed: ${error.message}`);
          await prisma.instances.update({
            where: { id: instanceId },
            data: { status: 'error' }
          });
          reject(error);
        } else {
          await prisma.instances.update({
            where: { id: instanceId },
            data: { 
              status: 'running',
              port: port
            }
          }).then(resolve);
        }
      }
    );
  });
}

async function appendInstanceLog(instanceId, message) {
  const instance = await validateInstanceId(instanceId);
  const instancePath = await getInstancePath(instanceId);
  const logPath = path.join(instancePath, 'logs');
  
  // Ensure logs directory exists
  await fs.ensureDir(logPath);
  
  // Append log with timestamp
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  await fs.appendFile(
    path.join(logPath, 'console.log'),
    logEntry
  );
}

async function executeCommand(instanceId, command) {
  const instance = await validateInstanceId(instanceId);
  const instancePath = await getInstancePath(instanceId);
  
  // Log the command
  await appendInstanceLog(instanceId, `> ${command}`);
  
  try {
    // Parse command and arguments
    const [cmd, ...args] = command.split(' ');

    // Add validation for allowed commands
    const allowedCommands = ['npm', 'node', 'git'];
    if (!allowedCommands.includes(cmd)) {
      return `Command not allowed. Allowed commands: ${allowedCommands.join(', ')}`;
    }

    const output = await new Promise((resolve, reject) => {
      exec(command, { 
        cwd: instancePath,
        env: {
          ...process.env,
          PATH: process.env.PATH,
          NODE_ENV: 'development',
          // Add npm configuration to avoid browserslist warning
          BROWSERSLIST_IGNORE_OLD_DATA: '1'
        },
        timeout: 30000 // 30 second timeout
      }, async (error, stdout, stderr) => {
        // Combine stdout and stderr for more complete output
        const fullOutput = stdout + (stderr ? `\nErrors:\n${stderr}` : '');
        
        if (error && error.code !== 1) { // npm returns exit code 1 for help command
          await appendInstanceLog(instanceId, `Error: ${error.message}`);
          resolve(`Command execution failed:\n${fullOutput}`);
          return;
        }
        
        await appendInstanceLog(instanceId, fullOutput);
        resolve(fullOutput);
      });
    });
    
    return output;
  } catch (error) {
    throw error;
  }
}

async function getInstanceLogs(instanceId, options = { limit: 100, offset: 0 }) {
  const instance = await validateInstanceId(instanceId);
  const instancePath = await getInstancePath(instanceId);
  const logPath = path.join(instancePath, 'logs');
  try {
    const logs = await fs.readdir(logPath);
    const filteredLogs = logs.filter(log => log.startsWith('console.log'));
    const paginatedLogs = filteredLogs.slice(options.offset, options.offset + options.limit);
    const logEntries = await Promise.all(paginatedLogs.map(async (log) => {
      const logPath = path.join(logPath, log);
      const logContent = await fs.readFile(logPath, 'utf8');
      return logContent.split('\n').filter(Boolean);
    }));
    return logEntries.flat();
  } catch (error) {
    return ['No logs available'];
  }
}

async function getInstanceStats(instanceId) {
  const instance = await validateInstanceId(instanceId);
  
  // Get actual stats using system commands
  const stats = {
    cpu: await new Promise((resolve) => {
      exec(`ps -p $(pgrep -f "${instance.name}") -o %cpu`, (error, stdout) => {
        if (error) {
          resolve(0); // Return 0 if process not found or error
          return;
        }
        // Parse CPU percentage from output, skipping header line
        const cpuUsage = parseFloat(stdout.split('\n')[1]);
        resolve(isNaN(cpuUsage) ? 0 : cpuUsage);
      });
    }),
    memory: await new Promise((resolve) => {
      exec(`ps -p $(pgrep -f "${instance.name}") -o rss`, (error, stdout) => {
        if (error) {
          resolve(0);
          return;
        }
        // Convert RSS memory from KB to MB and round to 2 decimal places
        const memoryMB = parseFloat(stdout.split('\n')[1]) / 1024;
        resolve(Math.round(memoryMB * 100) / 100);
      });
    }),
    uptime: await new Promise((resolve) => {
      exec(`ps -p $(pgrep -f "${instance.name}") -o etime`, (error, stdout) => {
        if (error) {
          resolve('0:00');
          return;
        }
        // Return elapsed time in HH:MM format, skipping header
        const uptime = stdout.split('\n')[1].trim();
        resolve(uptime);
      });
    })
  };

  return stats;
}

async function stopInstance(instanceId) {
  const instance = await validateInstanceId(instanceId);
  
  // Execute stop command
  await exec(`pm2 stop ${instance.name}`);
  
  await prisma.instances.update({
    where: { id: instanceId },
    data: { status: 'stopped' }
  });
}

async function restartInstance(instanceId) {
  const instance = await validateInstanceId(instanceId);
  
  // Execute restart command
  await exec(`pm2 restart ${instance.name}`);
  
  await prisma.instances.update({
    where: { id: instanceId },
    data: { status: 'running' }
  });
}

// Add other instance management functions as needed

module.exports = {
  initializeInstance,
  startInstance,
  executeCommand,
  getInstanceLogs,
  getInstanceStats,
  stopInstance,
  restartInstance
}; 