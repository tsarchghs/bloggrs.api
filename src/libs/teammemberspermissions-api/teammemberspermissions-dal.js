const { PrismaClient, Prisma } = require('@prisma/client');
const { ErrorHandler } = require('../../utils/error');
const prisma = new PrismaClient();

// Helper function to handle Prisma errors
function handlePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Foreign key constraint errors
    if (error.code === 'P2003') {
      throw new ErrorHandler(400, 'Invalid reference: The provided teammemberId or permissionId does not exist');
    }
    // Unique constraint errors
    if (error.code === 'P2002') {
      throw new ErrorHandler(400, 'This permission is already assigned to the team member');
    }
    // Record not found
    if (error.code === 'P2025') {
      throw new ErrorHandler(404, 'Record not found');
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new ErrorHandler(400, 'Invalid data provided');
  }
  // Handle unexpected errors
  throw new ErrorHandler(500, 'Database operation failed');
}

// Create
async function createTeamMemberPermission({ teammemberId, permissionId, isCustom = false }) {
  try {
    return await prisma.teammemberspermissions.create({
      data: { teammemberId, permissionId, isCustom },
      include: { teammember: true, permission: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Read
async function getTeamMemberPermissionById(id) {
  return prisma.teammemberspermissions.findUnique({
    where: { id },
    include: {
      teammember: true,
      permission: true,
    },
  });
}

async function findByPkOr404(id) {
  const teamMemberPermission = await getTeamMemberPermissionById(id);
  if (!teamMemberPermission) throw new Error('Team Member Permission not found');
  return teamMemberPermission;
}

// Get team member permissions with optional filters
async function findAll({ page = 1, pageSize = 10, teammemberId, permissionId, isCustom }) {
  const skip = (page - 1) * pageSize;
  const where = {};

  // Add optional filters
  if (teammemberId) where.teammemberId = teammemberId;
  if (permissionId) where.permissionId = permissionId;
  if (isCustom !== undefined) where.isCustom = isCustom;

  const [teamMemberPermissions, count] = await Promise.all([
    prisma.teammemberspermissions.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: {
        id: 'desc',
      },
      include: {
        teammember: true,
        permission: true,
      },
    }),
    prisma.teammemberspermissions.count({ where }),
  ]);

  return {
    teamMemberPermissions,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      totalItems: count,
    },
  };
}

// Update
async function updateTeamMemberPermission(id, updateData) {
  try {
    return await prisma.teammemberspermissions.update({
      where: { id },
      data: updateData,
      include: { teammember: true, permission: true },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete
async function deleteTeamMemberPermission(id) {
  try {
    return await prisma.teammemberspermissions.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

// Delete all permissions for a specific team member
async function deleteTeamMemberPermissions(teammemberId) {
  return prisma.teammemberspermissions.deleteMany({
    where: { teammemberId },
  });
}

// Delete specific permission for a team member
async function deleteSpecificTeamMemberPermission(teammemberId, permissionId) {
  return prisma.teammemberspermissions.deleteMany({
    where: {
      teammemberId,
      permissionId,
    },
  });
}

module.exports = {
  createTeamMemberPermission,
  getTeamMemberPermissionById,
  findByPkOr404,
  findAll,
  updateTeamMemberPermission,
  deleteTeamMemberPermission,
  deleteTeamMemberPermissions,
  deleteSpecificTeamMemberPermission,
}; 