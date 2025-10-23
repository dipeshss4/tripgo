import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { validateAdminLogin, validateAdminSetup } from '../middleware/adminValidation';

const router = express.Router();
const prisma = new PrismaClient();

// Admin Login
router.post('/login', validateAdminLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        isActive: true,
        tenantId: true
      }
    });

    if (!admin) {
      return next(createError('Invalid credentials', 401));
    }

    // Check if user is admin
    if (admin.role !== UserRole.ADMIN) {
      return next(createError('Access denied: Admin privileges required', 403));
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return next(createError('Account is disabled', 401));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return next(createError('Invalid credentials', 401));
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: admin.tenantId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        }
      },
      message: 'Admin login successful'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create Admin Account (Only for initial setup)
router.post('/setup', validateAdminSetup, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, setupKey } = req.body;

    // Check setup key for security
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return next(createError('Invalid setup key', 401));
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      return next(createError('Admin account already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.ADMIN,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: admin,
      message: 'Admin account created successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Check Admin Status
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(createError('Access token required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };

    if (decoded.role !== UserRole.ADMIN) {
      return next(createError('Admin access required', 403));
    }

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!admin || !admin.isActive) {
      return next(createError('Admin account not found or disabled', 401));
    }

    const response: ApiResponse = {
      success: true,
      data: admin
    };

    res.json(response);
  } catch (error) {
    next(createError('Invalid token', 401));
  }
});

export default router;