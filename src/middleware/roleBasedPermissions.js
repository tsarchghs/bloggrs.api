const getPermissionType = (method) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'read';
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'read';
  }
};

const checkRolePermissions = async (req, res, next) => {
  // Skip permission check for authentication routes
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const bearer = req.headers['authorization'];
  if (!bearer) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Extract user ID from token
    const token = bearer.split(" ")[1];
    const decoded = jwt.decode(token);
    const userId = decoded.userId;

    // Get user's roles and permissions with a single query
    const user = await prisma.users.findUnique({
      where: { id: userId },
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
        },
        blogpermissions: true // Include direct blog permissions
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Extract resource information from request
    const pathParts = req.path.split('/').filter(Boolean);
    const resourceType = pathParts[0]; // e.g., 'posts', 'blogs'
    const resourceId = pathParts[1] ? parseInt(pathParts[1]) : null;
    const actionType = getPermissionType(req.method);

    // Combine all permissions
    const allPermissions = new Set([
      ...user.roles.flatMap(role => role.permissions.map(p => p.name)),
      ...user.user_permissions.map(up => up.permission.name)
    ]);

    // Check for specific resource permissions (e.g., blog-specific permissions)
    const hasResourcePermission = resourceId && user.blogpermissions.some(perm => 
      perm.resourceId === resourceId &&
      perm.resourceType === resourceType &&
      perm.action === actionType
    );

    // Check for required permission
    const requiredPermission = `${resourceType}:${actionType}`;
    const hasGeneralPermission = allPermissions.has(requiredPermission);

    if (!hasGeneralPermission && !hasResourcePermission) {
      // Check for temporary access
      const temporaryAccess = await prisma.temporaryaccesses.findFirst({
        where: {
          userId,
          resourceType,
          resourceId: resourceId || undefined,
          expiresAt: {
            gt: new Date()
          },
          isActive: true
        }
      });

      if (!temporaryAccess) {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          required: requiredPermission,
          resourceId,
          resourceType
        });
      }
    }

    // Add permissions and user info to request object
    req.userContext = {
      userId,
      permissions: Array.from(allPermissions),
      roles: user.roles.map(role => role.name),
      resourcePermissions: user.blogpermissions,
      isAdmin: user.roles.some(role => role.name === 'admin')
    };

    // Log the action
    await prisma.actionlogs.create({
      data: {
        userId,
        action: actionType,
        resourceType,
        resourceId: resourceId || 0,
      }
    });

    // Special handling for specific resources
    if (resourceType === 'posts') {
      // Add additional checks for post status, etc.
      if (actionType === 'read') {
        const post = await prisma.posts.findUnique({
          where: { id: resourceId },
          select: { status: true, UserId: true, BlogId: true }
        });

        if (post && post.status === 'DRAFT' && post.UserId !== userId) {
          const hasViewPermission = await checkBlogPermission(userId, post.BlogId, 'view_drafts');
          if (!hasViewPermission) {
            return res.status(403).json({ error: 'Cannot view draft posts' });
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during permission check',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to check blog-specific permissions
const checkBlogPermission = async (userId, blogId, permission) => {
  const teamMember = await prisma.teammembers.findFirst({
    where: {
      UserId: userId,
      BlogId: blogId
    }
  });

  if (teamMember?.isOwner) return true;

  const blogPermission = await prisma.blogpermissions.findFirst({
    where: {
      userId,
      resourceId: blogId,
      action: permission
    }
  });

  return !!blogPermission;
};

module.exports = checkRolePermissions; 