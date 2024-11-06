const { PrismaClient, Prisma } = require('@prisma/client')
const { ErrorHandler } = require('../../utils/error')
const prisma = new PrismaClient()

const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        throw new ErrorHandler(409, 'Team member already exists');
      case 'P2003': // Foreign key constraint failed
        throw new ErrorHandler(400, 'Invalid User ID or Blog ID');
      case 'P2025': // Record not found
        throw new ErrorHandler(404, 'Team member not found');
      case 'P2014': // Invalid ID
        throw new ErrorHandler(400, 'Invalid ID provided');
      case 'P2021': // Table does not exist
        throw new ErrorHandler(500, 'Database table not found');
      case 'P2024': // Connection timeout
        throw new ErrorHandler(503, 'Database connection timeout');
      default:
        throw new ErrorHandler(400, error.message);
    }
  }
  throw error;
};

module.exports = {
    findByPkOr404: async (pk) => {
        try {
            const teammember = await prisma.teammembers.findUnique({
                where: { id: pk }
            })
            if (!teammember) throw new ErrorHandler(404, 'TeamMember not found')
            return teammember
        } catch (error) {
            handlePrismaError(error);
        }
    },
    
    findAll: async ({ page = 1, pageSize = 10, blogId }) => {
        try {
            if (!blogId) throw new ErrorHandler(400, 'Blog ID is required')
            return await prisma.teammembers.findMany({
                where: {
                    BlogId: parseInt(blogId)
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            })
        } catch (error) {
            handlePrismaError(error);
        }
    },

    createTeamMember: async ({ UserId, BlogId }) => {
        try {
            return await prisma.teammembers.create({
                data: {
                    blogs: {
                        connect: {
                            id: BlogId
                        }
                    },
                    users: {
                        connect: {
                            id: UserId
                        }
                    }
                }
            })
        } catch (error) {
            handlePrismaError(error);
        }
    },

    updateTeamMember: async ({pk, data}) => {
        try {
            return await prisma.teammembers.update({
                where: { id: pk },
                data
            })
        } catch (error) {
            handlePrismaError(error);
        }
    },

    deleteTeamMember: async (pk) => {
        try {
            return await prisma.teammembers.delete({
                where: { id: pk }
            })
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
