import { Request, Response, NextFunction } from 'express';
import { PrismaClient, TenantStatus, TenantPlan } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { RoleAuthRequest } from '@/middleware/roleAuth';
import { ApiResponse } from '@/types';

const prisma = new PrismaClient();

export const createTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug,
      domain,
      subdomain,
      plan = TenantPlan.STANDARD,
      settings
    } = req.body;

    // Check if slug, domain, or subdomain already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug },
          { domain },
          { subdomain }
        ]
      }
    });

    if (existingTenant) {
      return next(createError('Tenant with this slug, domain, or subdomain already exists', 400));
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain,
        subdomain,
        plan,
        settings: settings || {}
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTenants = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      plan,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
        { domain: { contains: search as string, mode: 'insensitive' } },
        { subdomain: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              users: true,
              cruises: true,
              hotels: true,
              packages: true,
              bookings: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tenant.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        tenants,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            cruises: true,
            hotels: true,
            packages: true,
            bookings: true,
            employees: true
          }
        }
      }
    });

    if (!tenant) {
      return next(createError('Tenant not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: tenant
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTenantByDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain } = req.params;

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain },
          { subdomain: domain }
        ],
        status: TenantStatus.ACTIVE
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        subdomain: true,
        plan: true,
        settings: true
      }
    });

    if (!tenant) {
      return next(createError('Tenant not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: tenant
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      domain,
      subdomain,
      status,
      plan,
      settings
    } = req.body;

    // Check if updating slug, domain, or subdomain conflicts with existing tenants
    if (slug || domain || subdomain) {
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(slug ? [{ slug }] : []),
                ...(domain ? [{ domain }] : []),
                ...(subdomain ? [{ subdomain }] : [])
              ]
            }
          ]
        }
      });

      if (existingTenant) {
        return next(createError('Slug, domain, or subdomain already exists', 400));
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(domain && { domain }),
        ...(subdomain && { subdomain }),
        ...(status && { status }),
        ...(plan && { plan }),
        ...(settings && { settings })
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            bookings: true
          }
        }
      }
    });

    if (!tenant) {
      return next(createError('Tenant not found', 404));
    }

    // Check if tenant has active users or bookings
    if (tenant._count.users > 0 || tenant._count.bookings > 0) {
      return next(createError('Cannot delete tenant with existing users or bookings', 400));
    }

    await prisma.tenant.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tenant deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTenantStats = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [
      userStats,
      bookingStats,
      revenueStats,
      contentStats
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        where: { tenantId: id },
        _count: { role: true }
      }),
      prisma.booking.groupBy({
        by: ['status'],
        where: { tenantId: id },
        _count: { status: true },
        _sum: { totalAmount: true }
      }),
      prisma.booking.aggregate({
        where: {
          tenantId: id,
          paymentStatus: 'PAID'
        },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      Promise.all([
        prisma.cruise.count({ where: { tenantId: id } }),
        prisma.hotel.count({ where: { tenantId: id } }),
        prisma.package.count({ where: { tenantId: id } }),
        prisma.employee.count({ where: { tenantId: id } })
      ])
    ]);

    const stats = {
      users: userStats,
      bookings: bookingStats,
      revenue: {
        total: Number(revenueStats._sum.totalAmount) || 0,
        count: revenueStats._count
      },
      content: {
        cruises: contentStats[0],
        hotels: contentStats[1],
        packages: contentStats[2],
        employees: contentStats[3]
      }
    };

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const suspendTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        status: TenantStatus.SUSPENDED,
        settings: {
          ...(typeof tenant.settings === 'object' ? tenant.settings : {}),
          suspensionReason: reason,
          suspendedAt: new Date().toISOString()
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant suspended successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const activateTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        status: TenantStatus.ACTIVE,
        settings: {
          ...(typeof tenant.settings === 'object' ? tenant.settings : {}),
          suspensionReason: null,
          suspendedAt: null,
          reactivatedAt: new Date().toISOString()
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant activated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Initialize default tenants for the system
export const initializeDefaultTenants = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const defaultTenants = [
      {
        name: 'TripGo Main',
        slug: 'tripgo-main',
        domain: 'tripgo.com',
        subdomain: 'main',
        plan: TenantPlan.ENTERPRISE,
        settings: {
          theme: 'default',
          allowRegistration: true,
          defaultCurrency: 'USD'
        }
      },
      {
        name: 'TripGo Cruises',
        slug: 'tripgo-cruises',
        domain: 'cruises.tripgo.com',
        subdomain: 'cruises',
        plan: TenantPlan.PREMIUM,
        settings: {
          theme: 'cruise',
          allowRegistration: true,
          defaultCurrency: 'USD',
          focusArea: 'cruises'
        }
      },
      {
        name: 'TripGo Hotels',
        slug: 'tripgo-hotels',
        domain: 'hotels.tripgo.com',
        subdomain: 'hotels',
        plan: TenantPlan.PREMIUM,
        settings: {
          theme: 'hotel',
          allowRegistration: true,
          defaultCurrency: 'USD',
          focusArea: 'hotels'
        }
      }
    ];

    const createdTenants = [];

    for (const tenantData of defaultTenants) {
      const existing = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: tenantData.slug },
            { domain: tenantData.domain },
            { subdomain: tenantData.subdomain }
          ]
        }
      });

      if (!existing) {
        const tenant = await prisma.tenant.create({
          data: tenantData
        });
        createdTenants.push(tenant);
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        created: createdTenants.length,
        tenants: createdTenants
      },
      message: 'Default tenants initialized successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};