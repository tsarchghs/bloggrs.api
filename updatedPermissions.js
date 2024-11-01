const express = require('express');
const { prisma } = require('@prisma/client'); // Assuming you're using Prisma

const router = express.Router();

// Get user permissions
router.get('/permissions', async (req, res) => {
    const userId = req.user.id; // Get user ID from authentication middleware
    const permissions = await prisma.user_permissions.findMany({
        where: { userId: userId },
        include: { permission: true }
    });
    res.json(permissions);
});

// Update user permissions
router.post('/permissions/update', async (req, res) => {
    const userId = req.user.id; // Get user ID from authentication middleware
    const { permissionsToUpdate } = req.body; // Expect an array of permission IDs

    // Validate that the user can change these permissions
    for (let permissionId of permissionsToUpdate) {
        const permission = await prisma.permissions.findUnique({
            where: { id: permissionId }
        });
        
        // Add logic to ensure the user is allowed to change this permission based on their role
        // For example, you could check if the user is part of a certain role that allows this permission.
    }

    // Update permissions in the database
    await prisma.user_permissions.deleteMany({
        where: { userId: userId } // Clear existing custom permissions if needed
    });

    const updatePromises = permissionsToUpdate.map(permissionId =>
        prisma.user_permissions.create({
            data: {
                userId: userId,
                permissionId: permissionId,
                isCustom: true
            }
        })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Permissions updated successfully!' });
});
