import { PrismaClient } from '@prisma/client';
import { createPermissionMiddleware } from '../middleware/permission.middleware';

let prisma: PrismaClient;

export function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Add permission middleware
    prisma.$use(createPermissionMiddleware(prisma));
  }
  return prisma;
} 