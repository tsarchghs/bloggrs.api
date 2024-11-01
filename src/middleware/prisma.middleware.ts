import { Prisma, PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger.ts';
import * as jwt from 'jsonwebtoken';

const logger = createLogger('PrismaMiddleware');

export function createPrismaMiddleware(prisma: PrismaClient) {
  // Logging Middleware
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });

  // Soft Delete Middleware
  prisma.$use(async (params, next) => {
    // Handle soft deletes
    if (params.action === 'delete') {
      // Change action to update
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      // Change action to updateMany
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }

    return next(params);
  });

  // Tenant Isolation Middleware
  prisma.$use(async (params, next) => {
    const tenantId = getTenantIdFromContext(); // Implement this based on your auth system
    
    if (tenantId && params.model && params.model in TENANT_MODELS) {
      // Add tenantId to queries
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.args.where['tenantId'] = tenantId;
      } else if (params.action === 'findMany') {
        if (!params.args) params.args = { where: { tenantId } };
        else if (!params.args.where) params.args.where = { tenantId };
        else params.args.where['tenantId'] = tenantId;
      }
    }

    return next(params);
  });

  // Audit Logging Middleware
  prisma.$use(async (params, next) => {
    const result = await next(params);
    
    if (['create', 'update', 'delete'].includes(params.action)) {
      const userId = getUserIdFromContext(); // Implement this based on your auth system
      await prisma.actionlogs.create({
        data: {
          action: params.action,
          userId: userId || 0,
          resourceId: result.id,
          resourceType: params.model || 'unknown',
        },
      });
    }

    return result;
  });

  // Permission Check Middleware
  prisma.$use(async (params, next) => {
    const userId = getUserIdFromContext();
    if (!userId) {
      throw new Error('Unauthorized: User ID not found in context');
    }
    
    const action = mapPrismaActionToPermission(params.action || 'unknown');
    if (!(await hasPermission(userId, action, params.model || 'unknown'))) {
      throw new Error(`Permission denied: ${action} on ${params.model}`);
    }

    return next(params);
  });

  // Validation Middleware
  prisma.$use(async (params, next) => {
    if (params.action === 'create' || params.action === 'update') {
      if (params.model) {
        validateData(params.model, params.args.data);
      }
    }
    return next(params);
  });

  return prisma;
}

// Helper functions and constants
const TENANT_MODELS = {
  blogs: true,
  posts: true,
  pages: true,
  // Add other tenant-specific models
};

function validateData(model: string, data: any) {
  // Implement model-specific validation rules
  const validators: Record<string, (data: any) => void> = {
    posts: validatePost,
    users: validateUser,
    // Add other validators
  };

  if (validators[model]) {
    validators[model](data);
  }
}

function validatePost(data: any) {
  if (data.title && data.title.length < 3) {
    throw new Error('Post title must be at least 3 characters long');
  }
  // Add other post-specific validations
}

function validateUser(data: any) {
  if (data.email && !isValidEmail(data.email)) {
    throw new Error('Invalid email format');
  }
  // Add other user-specific validations
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapPrismaActionToPermission(action: string): string {
  const mapping: Record<string, string> = {
    findMany: 'read',
    findUnique: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete',
    // Add other mappings
  };
  return mapping[action] || action;
}

// Permission checking function
async function hasPermission(userId: number, action: string, resource: string): Promise<boolean> {
  // Implement your permission checking logic here
  return true; // Temporary return
}

function getUserIdFromContext(): number | null {
  const token = global.headers?.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
  return decoded.userId;
}

function getTenantIdFromContext(): number | null {
  const token = global.headers?.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as { tenantId: number };
  return decoded.tenantId;
}