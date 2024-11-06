const { PrismaClient, Prisma } = require('@prisma/client');
const { ErrorHandler } = require('../../utils/error');
const prisma = new PrismaClient();

// Helper function to handle Prisma errors
function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Foreign key constraint errors
    if (error.code === 'P2003') {
      throw new ErrorHandler(400, 'Related record not found. Please check teammemberId and resourceId.');
    }
    // Unique constraint errors
    if (error.code === 'P2002') {
      throw new ErrorHandler(409, 'This permission already exists.');
    }
    // Record not found
    if (error.code === 'P2001') {
      throw new ErrorHandler(404, 'Record not found.');
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ErrorHandler(400, 'Invalid input data.');
  }
  // Generic Prisma errors
  throw new ErrorHandler(500, 'Database operation failed.');
}

// Create
async function createBlogPermission({ action, resourceId, resourceType, teammemberId }) {
  try {
    return await prisma.blogpermissions.create({
      data: {
        action,
        resourceId,
        resourceType,
        teammemberId,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Read
async function getBlogPermissionById(id) {
  try {
    const permission = await prisma.blogpermissions.findUnique({
      where: { id: Number(id) },
      include: {
        blog: true,
        teammember: true,
      },
    });
    
    if (!permission) {
      throw new ErrorHandler(404, 'Permission not found');
    }
    
    return permission;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getBlogPermissions(filters = {}) {
  return prisma.blogpermissions.findMany({
    where: filters,
    include: {
      blog: true,
      teammember: true,
    },
  });
}

// Get permissions for specific user and resource
async function getUserResourcePermissions(teammemberId, resourceId, resourceType) {
  return prisma.blogpermissions.findMany({
    where: {
      teammemberId,
      resourceId,
      resourceType,
    },
  });
}

// Check if user has specific permission
async function hasPermission(teammemberId, resourceId, resourceType, action) {
  const permission = await prisma.blogpermissions.findFirst({
    where: {
      teammemberId,
      resourceId,
      resourceType,
      action,
    },
  });
  return !!permission;
}

// Update
async function updateBlogPermission({ pk, data }) {
  return prisma.blogpermissions.update({
    where: { id: Number(pk) },
    data: data
  });
}

// Delete
async function deleteBlogPermission(id) {
  return prisma.blogpermissions.delete({
    where: { id: Number(id) },
  });
}

// Delete all permissions for a specific resource
async function deleteResourcePermissions(resourceId, resourceType) {
  return prisma.blogpermissions.deleteMany({
    where: {
      resourceId,
      resourceType,
    },
  });
}

async function findAll({ page = 1, pageSize = 10, teammemberId, resourceId, resourceType }) {
    const skip = (page - 1) * pageSize;
    const where = {};
    
    // Add optional filters with number conversion
    if (teammemberId) where.teammemberId = Number(teammemberId);
    if (resourceId) where.resourceId = Number(resourceId);
    if (resourceType) where.resourceType = resourceType;

    const [permissions, count] = await Promise.all([
        prisma.blogpermissions.findMany({
            where,
            take: pageSize,
            skip,
            orderBy: {
                id: 'desc'
            },
            include: {
                blog: true,
                teammember: true
            }
        }),
        prisma.blogpermissions.count({ where })
    ]);

    return {
        permissions,
        pagination: {
            page,
            pageSize,
            totalPages: Math.ceil(count / pageSize),
            totalItems: count
        }
    };
}

async function anyPrismaOperation() {
  try {
    // Your existing Prisma operation
    return await prisma.someOperation();
  } catch (error) {
    handlePrismaError(error);
  }
}

module.exports = {
  createBlogPermission,
  getBlogPermissionById,
  getBlogPermissions,
  getUserResourcePermissions,
  hasPermission,
  updateBlogPermission,
  deleteBlogPermission,
  deleteResourcePermissions,
  findAll,
  anyPrismaOperation,
}; 