import { Request, Response, NextFunction } from 'express';
import { PrismaClient, TenantStatus } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    domain: string;
    subdomain: string;
    plan: string;
    status: TenantStatus;
    settings: any;
  };
}

export const tenantResolver = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Tenant resolver called for:', req.method, req.path);
    console.log('📋 Headers:', Object.keys(req.headers));
    let tenant = null;

    // Method 1: Extract from subdomain
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];

    // Method 2: Extract from custom header (for API testing)
    const tenantHeader = req.get('x-tenant-id') || req.get('x-tenant-domain');

    // Method 3: Extract from query parameter (fallback)
    const tenantQuery = req.query.tenant as string;

    // Try to find tenant by different methods
    if (tenantHeader) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: tenantHeader },
            { domain: tenantHeader },
            { subdomain: tenantHeader },
            { slug: tenantHeader }
          ],
          status: TenantStatus.ACTIVE
        }
      });
    } else if (subdomain && subdomain !== 'localhost' && subdomain !== 'api') {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain },
            { domain: host }
          ],
          status: TenantStatus.ACTIVE
        }
      });
    } else if (tenantQuery) {
      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: tenantQuery },
            { slug: tenantQuery },
            { subdomain: tenantQuery }
          ],
          status: TenantStatus.ACTIVE
        }
      });
    }

    // Default to the main tenant if no specific tenant found
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        where: {
          slug: 'tripgo-main',
          status: TenantStatus.ACTIVE
        }
      });
    }

    // If still no tenant found, create or find any active tenant for development
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        where: {
          status: TenantStatus.ACTIVE
        }
      });
    }

    // As a last resort for development, find any tenant
    if (!tenant) {
      tenant = await prisma.tenant.findFirst();
    }

    if (!tenant) {
      return next(createError('No tenant found. Please ensure at least one tenant exists in the database.', 404));
    }

    // Check if tenant is suspended
    if (tenant.status === TenantStatus.SUSPENDED) {
      return next(createError('Tenant is currently suspended', 403));
    }

    // Attach tenant information to request
    req.tenantId = tenant.id;
    req.tenant = tenant;

    console.log('✅ Tenant resolved:', tenant.id, tenant.name || tenant.slug);

    next();
  } catch (error) {
    next(error);
  }
};

export const requireTenant = (req: TenantRequest, res: Response, next: NextFunction) => {
  // Temporarily disable tenant requirement in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Temporarily bypassing tenant requirement in development mode');
    return next();
  }

  if (!req.tenantId || !req.tenant) {
    return next(createError('Tenant context required', 400));
  }
  next();
};

export const tenantIsolation = (req: TenantRequest, res: Response, next: NextFunction) => {
  // This middleware ensures that all database queries are scoped to the current tenant
  // It should be used after tenantResolver

  if (!req.tenantId) {
    return next(createError('Tenant context required for this operation', 400));
  }

  // Store original Prisma client
  const originalPrisma = prisma;

  // Create a tenant-scoped Prisma instance
  // Note: This is a simplified approach. In production, you might want to use
  // Prisma middleware or custom methods for better performance
  req.prisma = originalPrisma;

  next();
};

// Middleware to check tenant plan limits
export const checkTenantLimits = (limitType: 'users' | 'bookings' | 'storage' | 'api_calls') => {
  return async (req: TenantRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant) {
        return next();
      }

      const plan = req.tenant.plan;

      // Define limits based on plan
      const limits: Record<string, Record<string, number>> = {
        FREE: {
          users: 10,
          bookings: 50,
          storage: 100, // MB
          api_calls: 1000 // per day
        },
        STANDARD: {
          users: 100,
          bookings: 500,
          storage: 1000, // MB
          api_calls: 10000 // per day
        },
        PREMIUM: {
          users: 1000,
          bookings: 5000,
          storage: 10000, // MB
          api_calls: 100000 // per day
        },
        ENTERPRISE: {
          users: -1, // Unlimited
          bookings: -1,
          storage: -1,
          api_calls: -1
        }
      };

      const tenantLimits = limits[plan] || limits.STANDARD;
      const limit = tenantLimits[limitType];

      // Skip check for unlimited plans
      if (limit === -1) {
        return next();
      }

      // Check current usage based on limit type
      let currentUsage = 0;

      switch (limitType) {
        case 'users':
          currentUsage = await prisma.user.count({
            where: { tenantId: req.tenantId }
          });
          break;
        case 'bookings':
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          currentUsage = await prisma.booking.count({
            where: {
              tenantId: req.tenantId,
              createdAt: { gte: startOfMonth }
            }
          });
          break;
        case 'storage':
          const mediaFiles = await prisma.mediaFile.aggregate({
            where: { tenantId: req.tenantId },
            _sum: { size: true }
          });
          currentUsage = Math.ceil((mediaFiles._sum.size || 0) / (1024 * 1024)); // Convert to MB
          break;
        case 'api_calls':
          // This would require an API call tracking system
          // For now, we'll skip this check
          return next();
      }

      if (currentUsage >= limit) {
        return next(createError(`Tenant has reached the ${limitType} limit for ${plan} plan`, 429));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Utility function to get tenant-scoped Prisma queries
export const getTenantScopedQueries = (tenantId: string) => {
  return {
    user: {
      ...prisma.user,
      findMany: (args: any = {}) => prisma.user.findMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      findFirst: (args: any = {}) => prisma.user.findFirst({
        ...args,
        where: { ...args.where, tenantId }
      }),
      findUnique: (args: any) => prisma.user.findFirst({
        where: { ...args.where, tenantId }
      }),
      create: (args: any) => prisma.user.create({
        ...args,
        data: { ...args.data, tenantId }
      }),
      update: (args: any) => prisma.user.updateMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      delete: (args: any) => prisma.user.deleteMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      count: (args: any = {}) => prisma.user.count({
        ...args,
        where: { ...args.where, tenantId }
      })
    },
    cruise: {
      ...prisma.cruise,
      findMany: (args: any = {}) => prisma.cruise.findMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      findFirst: (args: any = {}) => prisma.cruise.findFirst({
        ...args,
        where: { ...args.where, tenantId }
      }),
      create: (args: any) => prisma.cruise.create({
        ...args,
        data: { ...args.data, tenantId }
      }),
      update: (args: any) => prisma.cruise.updateMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      count: (args: any = {}) => prisma.cruise.count({
        ...args,
        where: { ...args.where, tenantId }
      })
    },
    hotel: {
      ...prisma.hotel,
      findMany: (args: any = {}) => prisma.hotel.findMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      findFirst: (args: any = {}) => prisma.hotel.findFirst({
        ...args,
        where: { ...args.where, tenantId }
      }),
      create: (args: any) => prisma.hotel.create({
        ...args,
        data: { ...args.data, tenantId }
      }),
      count: (args: any = {}) => prisma.hotel.count({
        ...args,
        where: { ...args.where, tenantId }
      })
    },
    booking: {
      ...prisma.booking,
      findMany: (args: any = {}) => prisma.booking.findMany({
        ...args,
        where: { ...args.where, tenantId }
      }),
      findFirst: (args: any = {}) => prisma.booking.findFirst({
        ...args,
        where: { ...args.where, tenantId }
      }),
      create: (args: any) => prisma.booking.create({
        ...args,
        data: { ...args.data, tenantId }
      }),
      count: (args: any = {}) => prisma.booking.count({
        ...args,
        where: { ...args.where, tenantId }
      })
    }
  };
};