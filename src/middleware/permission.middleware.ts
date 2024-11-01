import { PrismaClient } from '@prisma/client';
import { getUserIdFromContext, getTenantIdFromContext, getRolesFromContext } from '../utils/context';
import prisma from '../prisma';

interface PermissionConfig {
  requiredRoles?: string[];
  ownershipCheck?: boolean;
  tenantCheck?: boolean;
  customCheck?: (params: any) => Promise<boolean>;
}

const RESOURCE_PERMISSIONS: Record<string, Record<string, PermissionConfig>> = {
  blogs: {
    create: { requiredRoles: ['ADMIN', 'BLOG_CREATOR'] },
    read: { ownershipCheck: true },
    update: { ownershipCheck: true },
    delete: { ownershipCheck: true, requiredRoles: ['ADMIN', 'BLOG_OWNER'] },
  },
  posts: {
    create: { ownershipCheck: true, customCheck: checkBlogPermission },
    read: { tenantCheck: true },
    update: { ownershipCheck: true },
    delete: { ownershipCheck: true },
  },
  pages: {
    create: { ownershipCheck: true, customCheck: checkBlogPermission },
    read: { tenantCheck: true },
    update: { ownershipCheck: true },
    delete: { ownershipCheck: true },
  },
  blogcategories: {
    create: { requiredRoles: ['ADMIN'] },
    read: { tenantCheck: true },
    update: { requiredRoles: ['ADMIN'] },
    delete: { requiredRoles: ['ADMIN'] },
  },
  users: {
    create: { requiredRoles: ['ADMIN'] },
    read: { ownershipCheck: true },
    update: { ownershipCheck: true },
    delete: { requiredRoles: ['ADMIN'] },
  },
  roles: {
    create: { requiredRoles: ['ADMIN'] },
    read: { requiredRoles: ['ADMIN'] },
    update: { requiredRoles: ['ADMIN'] },
    delete: { requiredRoles: ['ADMIN'] },
  },
  permissions: {
    create: { requiredRoles: ['ADMIN'] },
    read: { requiredRoles: ['ADMIN'] },
    update: { requiredRoles: ['ADMIN'] },
    delete: { requiredRoles: ['ADMIN'] },
  },
  // Add configurations for other models
};

export function createPermissionMiddleware(prisma: PrismaClient) {
  return async (params: any, next: (params: any) => Promise<any>) => {
    const userId = getUserIdFromContext();
    if (!userId) throw new Error('User not authenticated');

    const action = mapPrismaActionToPermission(params.action);
    const model = params.model.toLowerCase();

    // Check if model exists in permission config
    if (!RESOURCE_PERMISSIONS[model]) {
      throw new Error(`No permission configuration found for model: ${model}`);
    }

    // Get permission config for this action
    const permConfig = RESOURCE_PERMISSIONS[model][action];
    if (!permConfig) {
      throw new Error(`No permission configuration found for action: ${action} on model: ${model}`);
    }

    // Perform permission checks
    const isAllowed = await checkPermissions(prisma, {
      userId,
      model,
      action,
      params,
      config: permConfig,
    });

    if (!isAllowed) {
      throw new Error(`Permission denied: ${action} on ${model}`);
    }

    return next(params);
  };
}

async function checkPermissions(
  prisma: PrismaClient,
  { userId, model, action, params, config }: any
): Promise<boolean> {
  // Check required roles
  if (config.requiredRoles) {
    const userRoles = await getUserRoles(prisma, userId);
    if (!config.requiredRoles.some(role => userRoles.includes(role))) {
      return false;
    }
  }

  // Check tenant isolation
  if (config.tenantCheck) {
    const tenantId = getTenantIdFromContext();
    if (!tenantId) return false;
    
    // Add tenant check to query
    if (!params.args.where) params.args.where = {};
    params.args.where.tenantId = tenantId;
  }

  // Check ownership
  if (config.ownershipCheck) {
    const isOwner = await checkOwnership(prisma, {
      userId,
      model,
      params,
    });
    if (!isOwner) return false;
  }

  // Run custom checks
  if (config.customCheck) {
    const passes = await config.customCheck(params);
    if (!passes) return false;
  }

  return true;
}

async function getUserRoles(prisma: PrismaClient, userId: number): Promise<string[]> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  return user?.roles.map(role => role.name) || [];
}

async function checkOwnership(prisma: PrismaClient, { userId, model, params }: any): Promise<boolean> {
  // Handle different ownership scenarios based on model
  switch (model) {
    case 'blogs':
      return checkBlogOwnership(prisma, userId, params);
    case 'posts':
      return checkPostOwnership(prisma, userId, params);
    case 'pages':
      return checkPageOwnership(prisma, userId, params);
    case 'users':
      return checkUserOwnership(userId, params);
    default:
      return false;
  }
}

async function checkBlogOwnership(prisma: PrismaClient, userId: number, params: any): Promise<boolean> {
  const blogId = params.args.where?.id || params.args.where?.BlogId;
  if (!blogId) return true; // New blog creation

  const teammember = await prisma.teammembers.findFirst({
    where: {
      BlogId: blogId,
      UserId: userId,
      isOwner: true,
    },
  });

  return !!teammember;
}

async function checkPostOwnership(prisma: PrismaClient, userId: number, params: any): Promise<boolean> {
  const postId = params.args.where?.id;
  if (!postId) return true; // New post creation

  const post = await prisma.posts.findUnique({
    where: { id: postId },
    select: { UserId: true, BlogId: true },
  });

  if (!post) return false;

  // Check if user is post author or blog owner
  return (
    post.UserId === userId ||
    !!(await prisma.teammembers.findFirst({
      where: {
        BlogId: post.BlogId,
        UserId: userId,
        isOwner: true,
      },
    }))
  );
}

async function checkPageOwnership(prisma: PrismaClient, userId: number, params: any): Promise<boolean> {
  const pageId = params.args.where?.id;
  if (!pageId) return true; // New page creation

  const page = await prisma.pages.findUnique({
    where: { id: pageId },
    select: { UserId: true, BlogId: true },
  });

  if (!page) return false;

  // Check if user is page creator or blog owner
  return (
    page.UserId === userId ||
    !!(await prisma.teammembers.findFirst({
      where: {
        BlogId: page.BlogId,
        UserId: userId,
        isOwner: true,
      },
    }))
  );
}

async function checkUserOwnership(userId: number, params: any): Promise<boolean> {
  const targetUserId = params.args.where?.id;
  return userId === targetUserId;
}

async function checkBlogPermission(params: any): Promise<boolean> {
  const userId = getUserIdFromContext();
  const blogId = params.args.data?.BlogId;
  
  if (!blogId || !userId) return false;

  // Check if user has permission to create content in this blog
  const hasPermission = await prisma.blogpermissions.findFirst({
    where: {
      userId,
      resourceId: blogId,
      resourceType: 'blog',
      action: 'create',
    },
  });

  return !!hasPermission;
}

function mapPrismaActionToPermission(action: string): string {
  const mapping: Record<string, string> = {
    findMany: 'read',
    findUnique: 'read',
    findFirst: 'read',
    create: 'create',
    createMany: 'create',
    update: 'update',
    updateMany: 'update',
    upsert: 'update',
    delete: 'delete',
    deleteMany: 'delete',
  };
  return mapping[action] || action;
} 