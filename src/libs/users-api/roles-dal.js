const prisma = require("../../prisma");

async function findOrCreateRole(name, tenantId = 1) {
    // First ensure tenant exists
    const tenant = await prisma.tenants.upsert({
        where: { id: tenantId },
        update: {},
        create: { 
            id: tenantId,
            name: 'Default Tenant',
            status: 'active'
        }
    });

    const role = await prisma.roles.upsert({
        where: { 
            name_tenantId: {
                name,
                tenantId: tenant.id
            }
        },
        update: {},
        create: { 
            name,
            tenantId: tenant.id,
            value: name
        }
    });
    return role;
}

async function addRoleToUser(userId, roleId) {
    // Connect the user to the role using the many-to-many relation
    await prisma.users.update({
        where: { id: userId },
        data: {
            roles: {
                connect: { id: roleId }
            }
        }
    });
}

module.exports = {
    findOrCreateRole,
    addRoleToUser
}; 