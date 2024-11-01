const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ErrorHandler } = require("../utils/error");

const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) throw new ErrorHandler(401, "Authentication required");

            // Check user permissions through roles and direct permissions
            const hasPermission = await checkUserPermission(user.id, resource, action);
            
            if (!hasPermission) {
                throw new ErrorHandler(403, `You don't have permission to ${action} ${resource}`);
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

async function checkUserPermission(userId, resource, action) {
    // Check direct user permissions
    const userPermission = await prisma.user_permissions.findFirst({
        where: {
            userId,
            permission: {
                resource,
                action,
            }
        },
        include: {
            permission: true
        }
    });

    if (userPermission) return true;

    // Check role-based permissions
    const userRoles = await prisma.users.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: {
                    permissions: true
                }
            }
        }
    });

    return userRoles?.roles.some(role => 
        role.permissions.some(permission => 
            permission.resource === resource && permission.action === action
        )
    ) ?? false;
}

const addPermissionContext = async (req, res, next) => {
    if (req.user) {
        try {
            // Get user's roles and permissions
            const userWithPermissions = await prisma.users.findUnique({
                where: { id: req.user.id },
                include: {
                    roles: {
                        include: {
                            permissions: true
                        }
                    },
                    user_permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            // Build permissions object
            req.user.permissions = {
                isAdmin: userWithPermissions.roles.some(role => role.name === 'admin'),
                roles: userWithPermissions.roles.map(role => role.name),
                actions: new Set([
                    ...userWithPermissions.roles.flatMap(role => 
                        role.permissions.map(p => `${p.resource}:${p.action}`)
                    ),
                    ...userWithPermissions.user_permissions.map(up => 
                        `${up.permission.resource}:${up.permission.action}`
                    )
                ])
            };

            // Add helper method to check permissions
            req.user.can = function(action, resource) {
                return this.permissions.isAdmin || 
                       this.permissions.actions.has(`${resource}:${action}`);
            };
        } catch (error) {
            console.error('Error adding permission context:', error);
        }
    }
    next();
};

module.exports = { 
    checkPermission, 
    checkUserPermission, 
    addPermissionContext 
};