const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addPermissionsToUser = async (userId, permissionIds) => {
    try {
        // Create the user permissions with userId and permissionId
        const userPermissions = permissionIds.map(permissionId => ({
            userId,
            permissionId,
        }));

        // Bulk create the user permissions
        await prisma.user_permissions.createMany({
            data: userPermissions
        });

        return true;
    } catch (error) {
        console.error('Error adding permissions to user:', error);
        throw error;
    }
};

const findOrCreatePermission = async ({ resource, action }) => {
    try {
        // Try to find existing permission
        let permission = await prisma.permissions.findFirst({
            where: {
                resource,
                action,
            }
        });

        // If permission doesn't exist, create it
        if (!permission) {
            permission = await prisma.permissions.create({
                data: {
                    name: `${resource}_${action}`,
                    resource,
                    action,
                }
            });
        }

        return permission;
    } catch (error) {
        console.error('Error finding or creating permission:', error);
        throw error;
    }
};

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
        console.error('Error creating role:', error);
        throw error;
    }
};

module.exports = {
    addPermissionsToUser,
    findOrCreatePermission,
    createRole
}; 