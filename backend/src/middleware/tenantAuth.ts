import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { TenantRequest } from './tenantIsolation';

const prisma = new PrismaClient();

export interface TenantAuthRequest extends TenantRequest {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
}

export const tenantAwareAuth = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(createError('Access token required', 401));
    }

    if (!req.tenantId) {
      return next(createError('Tenant context required', 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      tenantId: string;
    };

    // Verify that the token's tenant matches the current request tenant
    if (decoded.tenantId !== req.tenantId) {
      return next(createError('Token tenant mismatch', 403));
    }

    // Get user information scoped to current tenant
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        tenantId: req.tenantId,
        email: decoded.email
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true
      }
    });

    if (!user) {
      return next(createError('User not found in this tenant', 404));
    }

    if (!user.isActive) {
      return next(createError('User account not active', 401));
    }

    // Attach user information to request
    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid or expired token', 401));
    }
    next(error);
  }
};

export const optionalTenantAuth = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !req.tenantId) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      tenantId: string;
    };

    // Only attach user if token tenant matches current tenant
    if (decoded.tenantId === req.tenantId) {
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          tenantId: req.tenantId,
          email: decoded.email
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.userId = user.id;
        req.userEmail = user.email;
        req.userRole = user.role;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Cross-tenant authentication for super admins
export const superAdminAuth = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(createError('Access token required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      tenantId: string;
    };

    // Find user in any tenant (for super admin operations)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    // Check if user is a super admin
    const isSuperAdmin = user.role === 'ADMIN' &&
                        (user.email === process.env.ADMIN_EMAIL ||
                         user.tenant.slug === 'tripgo-main');

    if (!isSuperAdmin) {
      return next(createError('Super admin privileges required', 403));
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid or expired token', 401));
    }
    next(error);
  }
};

// Middleware to check if user belongs to current tenant
export const validateTenantMembership = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId || !req.tenantId) {
      return next(createError('Authentication and tenant context required', 401));
    }

    const user = await prisma.user.findFirst({
      where: {
        id: req.userId,
        tenantId: req.tenantId
      }
    });

    if (!user) {
      return next(createError('User does not belong to this tenant', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Generate tenant-aware JWT token
export const generateTenantToken = (userId: string, email: string, tenantId: string) => {
  return jwt.sign(
    {
      userId,
      email,
      tenantId
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};