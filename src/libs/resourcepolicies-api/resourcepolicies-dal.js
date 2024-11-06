const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Foreign key constraint failed
    if (error.code === 'P2003') {
      throw new ErrorHandler(400, `Foreign key constraint failed: ${error.meta?.field_name}`);
    }
    // Unique constraint failed
    if (error.code === 'P2002') {
      throw new ErrorHandler(400, `Unique constraint violation on ${error.meta?.target}`);
    }
    // Record not found
    if (error.code === 'P2025') {
      throw new ErrorHandler(404, 'Record not found');
    }
    // Invalid data type
    if (error.code === 'P2006') {
      throw new ErrorHandler(400, 'Invalid data provided');
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ErrorHandler(400, 'Invalid data format');
  }

  // Generic database error
  throw new ErrorHandler(500, 'Database operation failed');
}

// Create
async function createResourcePolicy({ resourceType, resourceId, roleId, permissions, priority = 0 }) {
  try {
    return await prisma.resource_policies.create({
      data: {
        resourceType,
        resourceId,
        roleId,
        permissions,
        priority,
      },
      include: {
        role: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Read
async function getResourcePolicyById(id) {
  return prisma.resource_policies.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });
}

async function findByPkOr404(id) {
  const resourcePolicy = await getResourcePolicyById(id);
  if (!resourcePolicy) throw new Error('Resource Policy not found');
  return resourcePolicy;
}

// Get resource policies with optional filters
async function findAll({ 
  page = 1, 
  pageSize = 10, 
  resourceType, 
  resourceId, 
  roleId, 
  priority 
}) {
  const skip = (page - 1) * pageSize;
  const where = {};

  // Add optional filters
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;
  if (roleId) where.roleId = roleId;
  if (priority !== undefined) where.priority = priority;

  const [resourcePolicies, count] = await Promise.all([
    prisma.resource_policies.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: {
        priority: 'desc', // Order by priority first
      },
      include: {
        role: true,
      },
    }),
    prisma.resource_policies.count({ where }),
  ]);

  return {
    resourcePolicies,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    },
  };
}

// Get policies for specific resource
async function getPoliciesForResource(resourceType, resourceId) {
  return prisma.resource_policies.findMany({
    where: {
      resourceType,
      resourceId,
    },
    orderBy: {
      priority: 'desc',
    },
    include: {
      role: true,
    },
  });
}

// Update
async function updateResourcePolicy(id, updateData) {
  try {
    if (updateData.permissions) {
      updateData.permissions = typeof updateData.permissions === 'string'
        ? JSON.parse(updateData.permissions)
        : updateData.permissions;
    }

    return await prisma.resource_policies.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete
async function deleteResourcePolicy(id) {
  try {
    return await prisma.resource_policies.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete all policies for a specific resource
async function deleteResourcePolicies(resourceType, resourceId) {
  return prisma.resource_policies.deleteMany({
    where: {
      resourceType,
      resourceId,
    },
  });
}

module.exports = {
  createResourcePolicy,
  getResourcePolicyById,
  findByPkOr404,
  findAll,
  getPoliciesForResource,
  updateResourcePolicy,
  deleteResourcePolicy,
  deleteResourcePolicies,
};
