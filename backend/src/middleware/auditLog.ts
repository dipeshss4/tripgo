import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RoleAuthRequest } from './roleAuth';

const prisma = new PrismaClient();

interface AuditLogData {
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

// Create audit log entry
export const createAuditLog = async (data: AuditLogData) => {
  try {
    // In a production environment, you might want to store audit logs
    // in a separate database or use a logging service like Winston
    console.log('AUDIT LOG:', {
      timestamp: new Date().toISOString(),
      ...data
    });

    // Optional: Store in database (you would need to create AuditLog model)
    // await prisma.auditLog.create({ data: { ...data, timestamp: new Date() } });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Middleware to automatically log admin actions
export const auditAdminAction = (action: string, resource: string) => {
  return async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;

    res.json = function(data: any) {
      // Only log successful operations (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
        const auditData: AuditLogData = {
          userId: req.userId || 'unknown',
          userEmail: req.userEmail,
          action,
          resource,
          resourceId: req.params.userId || req.params.bookingId || req.params.id,
          metadata: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            query: req.query
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        };

        createAuditLog(auditData);
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// Predefined audit actions
export const AUDIT_ACTIONS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PROMOTE: 'USER_PROMOTE',
  USER_DEMOTE: 'USER_DEMOTE',
  USER_BAN: 'USER_BAN',
  USER_UNBAN: 'USER_UNBAN',
  BOOKING_STATUS_UPDATE: 'BOOKING_STATUS_UPDATE',
  DASHBOARD_ACCESS: 'DASHBOARD_ACCESS',
  SYSTEM_HEALTH_CHECK: 'SYSTEM_HEALTH_CHECK',
  ANALYTICS_ACCESS: 'ANALYTICS_ACCESS',
  REPORTS_ACCESS: 'REPORTS_ACCESS'
};

export const AUDIT_RESOURCES = {
  USER: 'USER',
  BOOKING: 'BOOKING',
  DASHBOARD: 'DASHBOARD',
  SYSTEM: 'SYSTEM',
  ANALYTICS: 'ANALYTICS',
  REPORTS: 'REPORTS',
  AUTH: 'AUTH'
};