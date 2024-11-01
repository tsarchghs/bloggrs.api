import { Request, Response, NextFunction } from 'express';
import { setRequestContext } from '../utils/context';
import { verifyToken } from '../utils/auth.ts'; // Implement this based on your auth system

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = await verifyToken(token);
      setRequestContext({
        userId: Number(decoded.userId),
        tenantId: Number(decoded.tenantId),
        roles: decoded.roles,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
} 