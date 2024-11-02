const prisma = require("../prisma");
const { ErrorHandler } = require("../utils/error");

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    // If resource contains colon, split it
    if (resource.includes(':')) {
      [resource, action] = resource.split(':');
    }
    
    console.log('Resource:', resource);
    console.log('Action:', action);
    
    if (!req.user || !req.user.id) {
      throw new ErrorHandler(401, 'Authentication required');
    }

    // Fetch user with roles from Prisma
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { roles: true }
    });
    
    if (!user || !user.roles || user.roles.length === 0) {
      throw new ErrorHandler(403, 'User has no roles assigned');
    }
    
    // Check if user has required permission
    const hasPermission = await checkUserPermission(user, resource, action);
    
    console.log('User roles:', user.roles.map(r => r.name));
    console.log('Has permission:', hasPermission);
    
    if (!hasPermission) {
      throw new ErrorHandler(403, `You don't have permission to ${action} ${resource}`);
    }
    
    next();
  };
};

async function checkUserPermission(user, resource, action) {
  // Check if user has admin role
  if (user.roles.some(role => role.name === 'admin')) return true;
  
  const permissionMap = {
    'editor': {
      'blogpostcategories': ['read', 'create', 'update'],
      'blogs': ['read', 'create', 'update', 'delete'],
      'posts': ['read', 'create', 'update', 'delete'],
      'blog:posts': ['read', 'create', 'update', 'delete']
    },
    'moderator': {
      'blogpostcategories': ['read', 'create', 'update', 'delete'],
      'blogcategories': ['read', 'create', 'update', 'delete'],
      'blogs': ['read', 'create', 'update', 'delete'],
      'posts': ['read', 'create', 'update', 'delete'],
      'blog:posts': ['read', 'create', 'update', 'delete']
    },
    'viewer': {
      'blogpostcategories': ['read'],
      'blogs': ['read'],
      'posts': ['read'],
      'blog:posts': ['read']
    }
  };
  
  // Check permissions for each role the user has
  return user.roles.some(role => {
    const rolePerms = permissionMap[role.name];
    if (!rolePerms) return false;
    
    // Handle composite resources like 'blog:posts'
    if (resource.includes(':')) {
      const [parentResource, childResource] = resource.split(':');
      return rolePerms[`${parentResource}:${childResource}`]?.includes(action);
    }
    
    return rolePerms[resource]?.includes(action);
  });
}

module.exports = checkPermission; 