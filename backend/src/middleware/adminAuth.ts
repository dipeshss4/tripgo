import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { RoleAuthRequest } from './roleAuth';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export const requireSuperAdmin = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(createError('Authentication required', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, email: true }
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    // Check if user is admin AND has super admin privileges
    const isSuperAdmin = user.role === UserRole.ADMIN &&
                        (user.email === process.env.ADMIN_EMAIL ||
                         user.email.endsWith('@tripgo.com'));

    if (!isSuperAdmin) {
      return next(createError('Super admin privileges required', 403));
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const canManageUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.userId || req.params.id;
    const currentUserId = req.userId!;

    // Users can always manage their own account
    if (targetUserId === currentUserId) {
      return next();
    }

    // Admins can manage other users, but not other admins (unless super admin)
    if (req.userRole === UserRole.ADMIN) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true, email: true }
      });

      if (!targetUser) {
        return next(createError('Target user not found', 404));
      }

      // Regular admins cannot manage other admins
      if (targetUser.role === UserRole.ADMIN) {
        const currentUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { email: true }
        });

        const isSuperAdmin = currentUser?.email === process.env.ADMIN_EMAIL ||
                            currentUser?.email.endsWith('@tripgo.com');

        if (!isSuperAdmin) {
          return next(createError('Cannot manage other admin accounts', 403));
        }
      }

      return next();
    }

    return next(createError('Insufficient permissions', 403));
  } catch (error) {
    next(error);
  }
};

export const preventSelfDemotion = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.userId || req.params.id;
    const currentUserId = req.userId!;

    if (targetUserId === currentUserId) {
      const { role } = req.body;

      if (role && role !== UserRole.ADMIN) {
        return next(createError('Cannot demote yourself', 400));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};