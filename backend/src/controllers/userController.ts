import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { RoleAuthRequest } from '@/middleware/roleAuth';
import { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getUsers = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limitNum,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        users,
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

export const createUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role = 'CUSTOMER', phone, avatar } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(createError('User with this email already exists', 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get tenant ID from authenticated user
    const tenantId = req.tenantId;

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
        avatar,
        tenantId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        avatar: true,
        createdAt: true,
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, phone, avatar },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      return next(createError('Cannot delete your own account', 400));
    }

    await prisma.user.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.userId) {
      return next(createError('Cannot change your own role', 400));
    }

    if (!Object.values(UserRole).includes(role)) {
      return next(createError('Invalid role', 400));
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User role updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          cruise: { select: { title: true } },
          hotel: { select: { name: true } },
          package: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        bookings,
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

export const updateBookingStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { status, paymentStatus } = req.body;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus })
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cruise: { select: { title: true } },
        hotel: { select: { name: true } },
        package: { select: { title: true } }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: booking,
      message: 'Booking status updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};