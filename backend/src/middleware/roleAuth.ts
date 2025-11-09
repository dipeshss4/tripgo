import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from './auth';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export interface RoleAuthRequest extends AuthRequest {
  userRole?: UserRole;
  tenantId?: string;
}

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(createError('Authentication required', 401));
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true, id: true }
      });

      if (!user) {
        return next(createError('User not found', 404));
      }

      req.userRole = user.role;

      if (!allowedRoles.includes(user.role)) {
        return next(createError('Insufficient permissions', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);

export const requireCustomerOrAdmin = requireRole([UserRole.CUSTOMER, UserRole.ADMIN]);

export const checkResourceOwnership = async (
  req: RoleAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole;
    const resourceUserId = req.params.userId || req.body.userId;

    // Admins can access any resource
    if (userRole === UserRole.ADMIN) {
      return next();
    }

    // Users can only access their own resources
    if (userId !== resourceUserId) {
      return next(createError('Access denied: You can only access your own resources', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkBookingOwnership = async (
  req: RoleAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole;
    const bookingId = req.params.id;

    // Admins can access any booking
    if (userRole === UserRole.ADMIN) {
      return next();
    }

    // Check if booking belongs to the user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { id: true }
    });

    if (!booking) {
      return next(createError('Booking not found or access denied', 404));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const permissions = {
  // Cruise permissions
  CREATE_CRUISE: [UserRole.ADMIN],
  UPDATE_CRUISE: [UserRole.ADMIN],
  DELETE_CRUISE: [UserRole.ADMIN],
  BOOK_CRUISE: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],
  REVIEW_CRUISE: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],

  // Ship permissions
  CREATE_SHIP: [UserRole.ADMIN],
  UPDATE_SHIP: [UserRole.ADMIN],
  DELETE_SHIP: [UserRole.ADMIN],
  BOOK_SHIP: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],
  REVIEW_SHIP: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],

  // Hotel permissions
  CREATE_HOTEL: [UserRole.ADMIN],
  UPDATE_HOTEL: [UserRole.ADMIN],
  DELETE_HOTEL: [UserRole.ADMIN],
  BOOK_HOTEL: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],
  REVIEW_HOTEL: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],

  // Package permissions
  CREATE_PACKAGE: [UserRole.ADMIN],
  UPDATE_PACKAGE: [UserRole.ADMIN],
  DELETE_PACKAGE: [UserRole.ADMIN],
  BOOK_PACKAGE: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],
  REVIEW_PACKAGE: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.EMPLOYEE],

  // User management permissions
  VIEW_ALL_USERS: [UserRole.ADMIN, UserRole.HR_MANAGER],
  UPDATE_USER_ROLE: [UserRole.ADMIN],
  DELETE_USER: [UserRole.ADMIN],
  VIEW_USER_DETAILS: [UserRole.ADMIN, UserRole.HR_MANAGER],

  // Booking permissions
  VIEW_ALL_BOOKINGS: [UserRole.ADMIN],
  UPDATE_BOOKING_STATUS: [UserRole.ADMIN],
  CANCEL_ANY_BOOKING: [UserRole.ADMIN],

  // Analytics permissions
  VIEW_ANALYTICS: [UserRole.ADMIN],
  VIEW_REPORTS: [UserRole.ADMIN],

  // HR permissions
  MANAGE_EMPLOYEES: [UserRole.HR_MANAGER, UserRole.ADMIN],
  VIEW_HR_DASHBOARD: [UserRole.HR_MANAGER, UserRole.ADMIN],
  MANAGE_ATTENDANCE: [UserRole.HR_MANAGER, UserRole.ADMIN],
  APPROVE_LEAVE: [UserRole.HR_MANAGER, UserRole.ADMIN],
  MANAGE_PAYROLL: [UserRole.HR_MANAGER, UserRole.ADMIN],
  VIEW_EMPLOYEE_DETAILS: [UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE],

  // Site settings permissions
  MANAGE_SETTINGS: [UserRole.ADMIN],
  VIEW_SETTINGS: [UserRole.ADMIN],

  // Media permissions
  UPLOAD_MEDIA: [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE],
  MANAGE_MEDIA: [UserRole.ADMIN],
  DELETE_ANY_MEDIA: [UserRole.ADMIN],
};

export const requirePermission = (permission: keyof typeof permissions) => {
  return requireRole(permissions[permission]);
};