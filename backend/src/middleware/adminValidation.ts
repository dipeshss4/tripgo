import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { UserRole, BookingStatus } from '@prisma/client';

// Validation utilities
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

const isValidRole = (role: string): boolean => {
  return Object.values(UserRole).includes(role as UserRole);
};

const isValidBookingStatus = (status: string): boolean => {
  return Object.values(BookingStatus).includes(status as BookingStatus);
};

const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0;
};

const isValidPaginationParams = (page: string, limit: string): boolean => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  return !isNaN(pageNum) && !isNaN(limitNum) && pageNum > 0 && limitNum > 0 && limitNum <= 100;
};

// Admin login validation
export const validateAdminLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Admin setup validation
export const validateAdminSetup = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, setupKey } = req.body;

  const errors: string[] = [];

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (!isValidPassword(password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    errors.push('First name is required');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    errors.push('Last name is required');
  }

  if (!setupKey || typeof setupKey !== 'string' || setupKey.trim() === '') {
    errors.push('Setup key is required');
  }

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// User management validation
export const validateUserRoleUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (!userId || !isValidId(userId)) {
    return next(createError('Valid user ID is required', 400));
  }

  next();
};

// Booking status update validation
export const validateBookingStatusUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const errors: string[] = [];

  if (!bookingId || !isValidId(bookingId)) {
    errors.push('Valid booking ID is required');
  }

  if (!status || typeof status !== 'string') {
    errors.push('Status is required');
  } else if (!isValidBookingStatus(status)) {
    errors.push('Invalid booking status');
  }

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Pagination validation
export const validatePaginationParams = (req: Request, res: Response, next: NextFunction) => {
  const { page = '1', limit = '20' } = req.query;

  if (!isValidPaginationParams(page as string, limit as string)) {
    return next(createError('Invalid pagination parameters. Page must be > 0 and limit must be 1-100', 400));
  }

  next();
};

// Search validation
export const validateSearchParams = (req: Request, res: Response, next: NextFunction) => {
  const { role, search } = req.query;

  if (role && typeof role === 'string' && !isValidRole(role)) {
    return next(createError('Invalid role filter', 400));
  }

  if (search && typeof search === 'string' && search.length > 100) {
    return next(createError('Search term too long (max 100 characters)', 400));
  }

  next();
};

// Analytics validation
export const validateAnalyticsParams = (req: Request, res: Response, next: NextFunction) => {
  const { period } = req.query;

  if (period) {
    const periodNum = parseInt(period as string);
    if (isNaN(periodNum) || periodNum < 1 || periodNum > 365) {
      return next(createError('Period must be between 1 and 365 days', 400));
    }
  }

  next();
};

// Reports validation
export const validateReportsParams = (req: Request, res: Response, next: NextFunction) => {
  const { type, startDate, endDate } = req.query;

  const errors: string[] = [];
  const validTypes = ['revenue', 'users', 'bookings'];

  if (type && !validTypes.includes(type as string)) {
    errors.push('Invalid report type. Must be: revenue, users, or bookings');
  }

  if (startDate && isNaN(Date.parse(startDate as string))) {
    errors.push('Invalid start date format');
  }

  if (endDate && isNaN(Date.parse(endDate as string))) {
    errors.push('Invalid end date format');
  }

  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (start >= end) {
      errors.push('Start date must be before end date');
    }
  }

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400));
  }

  next();
};

// Rate limiting for admin actions
export const adminActionRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This is a placeholder for more sophisticated rate limiting
  // In production, you might use Redis or similar for distributed rate limiting
  next();
};