import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  tenantId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(createError('Access token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; tenantId?: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    next(createError('Invalid or expired token', 401));
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; tenantId?: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.tenantId = decoded.tenantId;
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};