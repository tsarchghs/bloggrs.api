const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
async function createRole({ UserId, name, value, description = null, isSystem = false, parentRoleId = null, tenantId = null }) {
  return prisma.roles.create({
    data: {
      name,
      value,
      description,
      isSystem,
      parentRoleId,
      tenantId,
      users: { 
        connect: { id: UserId }
      }
    },
  });
}

// Read
async function getRoleById(id) {
  return prisma.roles.findUnique({
    where: { id },
    include: {
      permissions: true,
      childRoles: true,
      parentRole: true,
    },
  });
}

async function getRoles({ tenantId = null, isSystem = null }) {
  const where = {};
  if (tenantId !== null) where.tenantId = tenantId;
  if (isSystem !== null) where.isSystem = isSystem;
  
  return prisma.roles.findMany({
    where,
    include: {
      permissions: true,
      childRoles: true,
      parentRole: true,
    },
  });
}

async function findAll() {
  return prisma.roles.findMany({
    include: {
      permissions: true,
      childRoles: true,
      parentRole: true,
    },
  });
}

// Update
async function updateRole(id, updateData) {
  const { permissions, ...rest } = updateData;
  return prisma.roles.update({
    where: { id: parseInt(id) },
    data: {
      ...rest,
      permissions: permissions ? {
        set: permissions
      } : undefined
    },
  });
}

// Delete
async function deleteRole(id) {
  return prisma.roles.delete({
    where: { id },
  });
}

module.exports = {
  createRole,
  getRoleById,
  getRoles,
  updateRole,
  deleteRole,
  findAll,
};
