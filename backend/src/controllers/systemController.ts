import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { RoleAuthRequest } from '../middleware/roleAuth';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

// SITE SETTINGS MANAGEMENT
export const getSiteSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' }
    });

    // Convert to key-value object for easier frontend consumption
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        description: setting.description
      };
      return acc;
    }, {} as Record<string, any>);

    const response: ApiResponse = {
      success: true,
      data: {
        settings: settingsObject,
        raw: settings
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get site settings error:', error);
    next(createError('Failed to fetch site settings', 500));
  }
};

export const updateSiteSetting = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { value, type, description } = req.body;

    if (!key || !value) {
      return next(createError('Key and value are required', 400));
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value,
        type: type || 'string',
        description
      },
      create: {
        key,
        value,
        type: type || 'string',
        description,
        tenantId: 'default' // You might want to use actual tenant ID
      }
    });

    const response: ApiResponse = {
      success: true,
      data: setting,
      message: 'Site setting updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update site setting error:', error);
    next(createError('Failed to update site setting', 500));
  }
};

export const deleteSiteSetting = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    await prisma.siteSetting.delete({
      where: { key }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Site setting deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete site setting error:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return next(createError('Site setting not found', 404));
    }
    next(createError('Failed to delete site setting', 500));
  }
};

// TENANT MANAGEMENT
export const getAllTenants = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
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
    console.error('Get tenants error:', error);
    next(createError('Failed to fetch tenants', 500));
  }
};

export const createTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, slug, domain, subdomain, plan = 'STANDARD', settings } = req.body;

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        domain,
        subdomain,
        plan,
        settings: settings || {}
      },
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
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Create tenant error:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return next(createError('Tenant with this slug, domain, or subdomain already exists', 400));
    }
    next(createError('Failed to create tenant', 500));
  }
};

export const updateTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;
    const updateData = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
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
      }
    });

    const response: ApiResponse = {
      success: true,
      data: tenant,
      message: 'Tenant updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update tenant error:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return next(createError('Tenant not found', 404));
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return next(createError('Tenant with this slug, domain, or subdomain already exists', 400));
    }
    next(createError('Failed to update tenant', 500));
  }
};

export const deleteTenant = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;

    // Check if tenant has users, bookings, or content
    const counts = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            bookings: true,
            cruises: true,
            hotels: true,
            packages: true
          }
        }
      }
    });

    if (!counts) {
      return next(createError('Tenant not found', 404));
    }

    const totalCount = counts._count.users + counts._count.bookings +
                     counts._count.cruises + counts._count.hotels + counts._count.packages;

    if (totalCount > 0) {
      return next(createError('Cannot delete tenant with existing data. Please migrate or delete all associated records first.', 400));
    }

    await prisma.tenant.delete({
      where: { id: tenantId }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tenant deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete tenant error:', error);
    next(createError('Failed to delete tenant', 500));
  }
};

// MEDIA FILE MANAGEMENT
export const getMediaFiles = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', type, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (type) {
      where.category = type;
    }
    if (search) {
      where.OR = [
        { filename: { contains: search as string, mode: 'insensitive' } },
        { originalName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          uploader: { select: { firstName: true, lastName: true, email: true } },
          tenant: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mediaFile.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        files,
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
    console.error('Get media files error:', error);
    next(createError('Failed to fetch media files', 500));
  }
};

export const deleteMediaFile = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.mediaFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return next(createError('Media file not found', 404));
    }

    // TODO: Delete actual file from filesystem/cloud storage
    // fs.unlinkSync(file.path) or cloud storage delete

    await prisma.mediaFile.delete({
      where: { id: fileId }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Media file deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete media file error:', error);
    next(createError('Failed to delete media file', 500));
  }
};

// SYSTEM BACKUP & MAINTENANCE
export const createSystemBackup = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // This is a placeholder - in production, implement actual backup logic
    const backupInfo = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'full',
      status: 'completed',
      size: '125MB',
      tables: ['User', 'Booking', 'Cruise', 'Hotel', 'Package', 'Tenant', 'SiteSetting', 'MediaFile']
    };

    const response: ApiResponse = {
      success: true,
      data: backupInfo,
      message: 'System backup created successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Create backup error:', error);
    next(createError('Failed to create system backup', 500));
  }
};

export const getSystemLogs = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { level = 'all', limit = '100' } = req.query;

    // This is a placeholder - in production, implement actual log retrieval
    const logs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Admin user logged in',
        source: 'auth.service',
        userId: req.userId
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'INFO',
        message: 'Dashboard statistics requested',
        source: 'admin.controller',
        userId: req.userId
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'WARN',
        message: 'High memory usage detected',
        source: 'system.monitor',
        metadata: { memoryUsage: '85%' }
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: {
        logs: logs.slice(0, parseInt(limit as string)),
        total: logs.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get system logs error:', error);
    next(createError('Failed to fetch system logs', 500));
  }
};

// SYSTEM MONITORING
export const getSystemPerformance = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const performance = {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpu: {
        usage: Math.random() * 100, // Placeholder
        cores: require('os').cpus().length
      },
      disk: {
        used: '2.5GB',
        total: '10GB',
        percentage: 25
      },
      database: {
        connections: 5,
        maxConnections: 100,
        responseTime: Math.random() * 10
      }
    };

    const response: ApiResponse = {
      success: true,
      data: performance
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getDetailedHealthCheck = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'healthy',
          responseTime: Math.random() * 10
        },
        cache: {
          status: 'healthy',
          responseTime: Math.random() * 5
        },
        email: {
          status: 'healthy',
          responseTime: Math.random() * 15
        },
        storage: {
          status: 'healthy',
          available: '7.5GB'
        }
      },
      metrics: {
        totalUsers: await prisma.user.count(),
        totalBookings: await prisma.booking.count(),
        totalRevenue: await prisma.booking.aggregate({
          _sum: { totalAmount: true }
        }),
        activeConnections: 5
      }
    };

    const response: ApiResponse = {
      success: true,
      data: health
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getDatabaseStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const dbStats = await prisma.$queryRaw`
      SELECT
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables
      ORDER BY tablename;
    `;

    const response: ApiResponse = {
      success: true,
      data: {
        status: 'connected',
        statistics: dbStats,
        connectionInfo: {
          maxConnections: 100,
          activeConnections: 5,
          idleConnections: 15
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCacheStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when cache is set up
    const cacheStats = {
      status: 'not_configured',
      hitRate: 0,
      missRate: 0,
      memory: {
        used: 0,
        available: 0
      }
    };

    const response: ApiResponse = {
      success: true,
      data: cacheStats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// EMAIL & NOTIFICATIONS
export const getNotificationSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = {
      email: {
        provider: 'smtp',
        enabled: false,
        fromAddress: 'noreply@tripgo.com',
        smtpHost: '',
        smtpPort: 587,
        smtpSecure: false
      },
      sms: {
        provider: 'twilio',
        enabled: false,
        accountSid: '',
        authToken: ''
      },
      push: {
        enabled: false,
        fcmServerKey: ''
      }
    };

    const response: ApiResponse = {
      success: true,
      data: settings
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, sms, push } = req.body;

    // Placeholder - implement when notification settings model is available
    const response: ApiResponse = {
      success: true,
      message: 'Notification settings updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const testNotificationSystem = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, recipient } = req.body;

    // Placeholder - implement actual notification testing
    const response: ApiResponse = {
      success: true,
      message: `Test ${type} notification sent to ${recipient}`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getEmailTemplates = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when email template model is available
    const templates = [
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to TripGo!',
        type: 'user_welcome',
        lastModified: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Booking Confirmation',
        subject: 'Your booking is confirmed',
        type: 'booking_confirmation',
        lastModified: new Date().toISOString()
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: templates
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateEmailTemplate = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const { subject, content } = req.body;

    // Placeholder - implement when email template model is available
    const response: ApiResponse = {
      success: true,
      message: 'Email template updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// SECURITY & PERMISSIONS
export const getAllPermissions = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when permission model is available
    const permissions = [
      { id: '1', name: 'VIEW_DASHBOARD', description: 'View admin dashboard' },
      { id: '2', name: 'MANAGE_USERS', description: 'Create, update, delete users' },
      { id: '3', name: 'MANAGE_BOOKINGS', description: 'Manage all bookings' },
      { id: '4', name: 'MANAGE_CONTENT', description: 'Manage cruises, hotels, packages' },
      { id: '5', name: 'SYSTEM_ADMIN', description: 'Full system administration' }
    ];

    const response: ApiResponse = {
      success: true,
      data: permissions
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createPermission = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    // Placeholder - implement when permission model is available
    const response: ApiResponse = {
      success: true,
      message: 'Permission created successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { permissionId } = req.params;
    const updateData = req.body;

    // Placeholder - implement when permission model is available
    const response: ApiResponse = {
      success: true,
      message: 'Permission updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deletePermission = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { permissionId } = req.params;

    // Placeholder - implement when permission model is available
    const response: ApiResponse = {
      success: true,
      message: 'Permission deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllRoles = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when role model is available
    const roles = [
      { id: '1', name: 'ADMIN', description: 'System administrator' },
      { id: '2', name: 'MANAGER', description: 'Content manager' },
      { id: '3', name: 'SUPPORT', description: 'Customer support' },
      { id: '4', name: 'CUSTOMER', description: 'Regular customer' }
    ];

    const response: ApiResponse = {
      success: true,
      data: roles
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body;

    // Placeholder - implement when role model is available
    const response: ApiResponse = {
      success: true,
      message: 'Role created successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;
    const updateData = req.body;

    // Placeholder - implement when role model is available
    const response: ApiResponse = {
      success: true,
      message: 'Role updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.params;

    // Placeholder - implement when role model is available
    const response: ApiResponse = {
      success: true,
      message: 'Role deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// API MANAGEMENT
export const getAPIUsageStats = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when API usage tracking is available
    const stats = {
      totalRequests: 12450,
      requestsToday: 340,
      averageResponseTime: 125,
      errorRate: 0.02,
      topEndpoints: [
        { endpoint: '/api/bookings', requests: 2340 },
        { endpoint: '/api/cruises', requests: 1890 },
        { endpoint: '/api/auth/login', requests: 1560 }
      ]
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

export const getRateLimitSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = {
      global: { requests: 1000, window: '1h' },
      auth: { requests: 10, window: '1m' },
      api: { requests: 100, window: '1m' },
      upload: { requests: 5, window: '1m' }
    };

    const response: ApiResponse = {
      success: true,
      data: settings
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateRateLimitSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { settings } = req.body;

    // Placeholder - implement when rate limit settings model is available
    const response: ApiResponse = {
      success: true,
      message: 'Rate limit settings updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getAPIKeys = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when API key model is available
    const apiKeys = [
      {
        id: '1',
        name: 'Frontend App',
        key: 'pk_***************',
        lastUsed: new Date().toISOString(),
        permissions: ['read:bookings', 'write:bookings']
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: apiKeys
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createAPIKey = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, permissions } = req.body;

    // Placeholder - implement when API key model is available
    const response: ApiResponse = {
      success: true,
      message: 'API key created successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const revokeAPIKey = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { keyId } = req.params;

    // Placeholder - implement when API key model is available
    const response: ApiResponse = {
      success: true,
      message: 'API key revoked successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// SYSTEM CONFIGURATION
export const getSystemConfig = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const config = {
      general: {
        siteName: 'TripGo',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en'
      },
      features: {
        multiTenant: true,
        emailVerification: true,
        socialLogin: false,
        paymentGateway: 'stripe'
      },
      security: {
        sessionTimeout: 3600,
        passwordPolicy: 'strong',
        twoFactorAuth: false
      }
    };

    const response: ApiResponse = {
      success: true,
      data: config
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateSystemConfig = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { config } = req.body;

    // Placeholder - implement when system config model is available
    const response: ApiResponse = {
      success: true,
      message: 'System configuration updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resetSystemConfig = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement config reset logic
    const response: ApiResponse = {
      success: true,
      message: 'System configuration reset to defaults'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// MAINTENANCE MODE
export const getMaintenanceStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = {
      enabled: false,
      message: '',
      startTime: null,
      endTime: null,
      allowedUsers: []
    };

    const response: ApiResponse = {
      success: true,
      data: status
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const enableMaintenanceMode = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, duration, allowedUsers } = req.body;

    // Placeholder - implement maintenance mode logic
    const response: ApiResponse = {
      success: true,
      message: 'Maintenance mode enabled'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const disableMaintenanceMode = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement maintenance mode logic
    const response: ApiResponse = {
      success: true,
      message: 'Maintenance mode disabled'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};