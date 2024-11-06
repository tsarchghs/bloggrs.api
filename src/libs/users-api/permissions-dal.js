const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const addPermissionsToUser = async (teammemberId, permissionIds) => {
    try {
        // Create the user permissions with teammemberId and permissionId
        const userPermissions = permissionIds.map(permissionId => ({
            teammemberId,
            permissionId,
        }));

        // Bulk create the user permissions
        await prisma.user_permissions.createMany({
            data: userPermissions
        });

        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                throw new ErrorHandler(400, 'Invalid teammemberId or permissionId provided');
            }
            if (error.code === 'P2002') {
                throw new ErrorHandler(409, 'Permission already assigned to user');
            }
        }
        throw new ErrorHandler(500, 'Database error while adding permissions');
    }
};

async function findOrCreatePermission(name, resource, action) {
    try {
        let permission = await prisma.permissions.findFirst({
            where: { name }
        });

        if (!permission) {
            permission = await prisma.permissions.create({
                data: {
                    name,
                    resource,
                    action
                }
            });
        }

        return permission;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ErrorHandler(409, 'Permission with this name already exists');
            }
        }
        throw new ErrorHandler(500, 'Database error while managing permission');
    }
}

const createRole = async ({ name, permissions }) => {
    try {
        const role = await prisma.roles.create({
            data: {
                name,
                role_permissions: {
                    create: permissions.map(permissionId => ({
                        permissionId
                    }))
                }
            }
        });
        return role;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ErrorHandler(409, 'Role with this name already exists');
            }
            if (error.code === 'P2003') {
                throw new ErrorHandler(400, 'Invalid permission IDs provided');
            }
        }
        throw new ErrorHandler(500, 'Database error while creating role');
    }
};

module.exports = {
    addPermissionsToUser,
    findOrCreatePermission,
    createRole
}; 