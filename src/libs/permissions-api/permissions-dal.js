const { PrismaClient } = require('@prisma/client');
const { ErrorHandler } = require('../../utils/error');
const prisma = new PrismaClient();

function handlePrismaError(error) {
  if (error.code === 'P2002') {
    throw new ErrorHandler(400, 'A permission with these unique fields already exists');
  }
  if (error.code === 'P2003') {
    throw new ErrorHandler(400, 'Invalid foreign key reference');
  }
  if (error.code === 'P2025') {
    throw new ErrorHandler(404, 'Record not found');
  }
  if (error instanceof prisma.Prisma.PrismaClientValidationError) {
    throw new ErrorHandler(400, 'Invalid data provided');
  }
  throw new ErrorHandler(500, 'Database operation failed');
}

// Create
async function createPermission({ name, action, resource, description, isSystem, roleId, tenantId }) {
  try {
    return prisma.permissions.create({
      data: {
        name,
        action,
        resource,
        description: description || null,
        isSystem: isSystem || false,
        role: roleId ? { connect: { id: roleId } } : undefined,
        tenant: tenantId ? { connect: { id: tenantId } } : undefined,
      },
      include: {
        role: true,
        tenant: true,
        teammemberspermissions: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Read
async function getPermissionById(id) {
  return prisma.permissions.findUnique({
    where: { id },
    include: {
      role: true,
      tenant: true,
      teammemberspermissions: true,
    },
  });
}

async function findByPkOr404(id) {
  try {
    const permission = await getPermissionById(id);
    if (!permission) {
      throw new ErrorHandler(404, 'Permission not found');
    }
    return permission;
  } catch (error) {
    handlePrismaError(error);
  }
}

// Get permissions with optional filters
async function findAll({ page = 1, pageSize = 10, roleId, tenantId, isSystem }) {
  const skip = (page - 1) * pageSize;
  const where = {};

  if (roleId) where.roleId = roleId;
  if (tenantId) where.tenantId = tenantId;
  if (isSystem !== undefined) where.isSystem = isSystem;

  const [permissions, count] = await Promise.all([
    prisma.permissions.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { id: 'desc' },
      include: {
        role: true,
        tenant: true,
        teammemberspermissions: {
          include: {
            teammember: true
          }
        }
      },
    }),
    prisma.permissions.count({ where }),
  ]);

  return {
    permissions,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    },
  };
}

// Update
async function updatePermission(id, updateData) {
  try {
    return prisma.permissions.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        tenant: true,
        teammemberspermissions: true,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete
async function deletePermission(id) {
  try {
    return prisma.permissions.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete all permissions for a specific role
async function deleteRolePermissions(roleId) {
  return prisma.permissions.deleteMany({
    where: { roleId },
  });
}

// Delete all permissions for a specific tenant
async function deleteTenantPermissions(tenantId) {
  return prisma.permissions.deleteMany({
    where: { tenantId },
  });
}

module.exports = {
  createPermission,
  getPermissionById,
  findByPkOr404,
  findAll,
  updatePermission,
  deletePermission,
  deleteRolePermissions,
  deleteTenantPermissions,
}; 