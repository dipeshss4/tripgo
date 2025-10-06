import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { TenantAuthRequest, generateTenantToken } from '@/middleware/tenantAuth';
import { LoginRequest, RegisterRequest, ApiResponse } from '@/types';

const prisma = new PrismaClient();

export const register = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body as RegisterRequest;
    const tenantId = req.tenantId!;

    // Check if email is already registered in this tenant
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId }
    });

    if (existingUser) {
      return next(createError('Email already registered in this tenant', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateTenantToken(user.id, user.email, tenantId);

    const response: ApiResponse = {
      success: true,
      data: { user, token },
      message: 'Registration successful',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const tenantId = req.tenantId!;

    const user = await prisma.user.findFirst({
      where: { email, tenantId },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError('Invalid email or password', 401));
    }

    const token = generateTenantToken(user.id, user.email, tenantId);

    const { password: _, tenant, ...userWithoutPassword } = user;

    const response: ApiResponse = {
      success: true,
      data: {
        user: userWithoutPassword,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          status: tenant.status,
        },
        token
      },
      message: 'Login successful',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: TenantAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.userId,
        tenantId: req.tenantId
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phone, avatar },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'Profile updated successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(createError('Current password is incorrect', 400));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a reset link has been sent',
      };
      return res.json(response);
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset link sent to your email',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return next(createError('Invalid or expired reset token', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const switchTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantSubdomain } = req.body;
    const currentUserId = req.userId!;

    // Find the target tenant
    const tenant = await prisma.tenant.findFirst({
      where: { subdomain: tenantSubdomain, status: 'ACTIVE' }
    });

    if (!tenant) {
      return next(createError('Tenant not found or inactive', 404));
    }

    // Get current user to check role and permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true, email: true }
    });

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return next(createError('Insufficient permissions to switch tenants', 403));
    }

    // For now, find or create an admin user in the target tenant
    // In a real multi-tenant system, you'd have proper user mapping
    let targetUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: 'ADMIN'
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return next(createError('No admin user found in target tenant', 404));
    }

    // Generate new token for the target tenant
    const token = generateTenantToken(targetUser.id, targetUser.email, tenant.id);

    const response: ApiResponse = {
      success: true,
      data: {
        user: targetUser,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          status: tenant.status,
        },
        token
      },
      message: 'Tenant switched successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};