import { Response } from 'express';
import { EnhancedQuery } from '../middleware/queryEnhancer';

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
  metadata?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

// Response builders
export class ResponseBuilder {
  private response: ApiResponse = { success: true };

  static success<T>(data?: T): ResponseBuilder {
    const builder = new ResponseBuilder();
    builder.response.success = true;
    if (data !== undefined) {
      builder.response.data = data;
    }
    return builder;
  }

  static error(message: string, code?: string): ResponseBuilder {
    const builder = new ResponseBuilder();
    builder.response.success = false;
    builder.response.message = message;
    if (code) {
      builder.response.error = code;
    }
    return builder;
  }

  message(message: string): ResponseBuilder {
    this.response.message = message;
    return this;
  }

  data<T>(data: T): ResponseBuilder {
    this.response.data = data;
    return this;
  }

  pagination(pagination: PaginationInfo): ResponseBuilder {
    this.response.pagination = pagination;
    return this;
  }

  metadata(metadata: any): ResponseBuilder {
    this.response.metadata = metadata;
    return this;
  }

  build(): ApiResponse {
    return this.response;
  }

  send(res: Response, status: number = 200): Response {
    return res.status(status).json(this.response);
  }
}

// Pagination helpers
export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  enhancedQuery: EnhancedQuery,
  message?: string
): ApiResponse<T[]> => {
  const pagination = createPaginationInfo(
    enhancedQuery.page,
    enhancedQuery.limit,
    total
  );

  return {
    success: true,
    data,
    message,
    pagination
  };
};

// Database query helpers
export const applyPrismaFilters = (where: any, filters: Record<string, any>) => {
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        where[key] = { in: value };
      } else if (typeof value === 'object' && value.hasOwnProperty('gte')) {
        where[key] = value; // Range filters
      } else if (typeof value === 'string' && value.includes('%')) {
        where[key] = { contains: value.replace(/%/g, ''), mode: 'insensitive' };
      } else {
        where[key] = value;
      }
    }
  });
  return where;
};

export const applyPrismaSearch = (where: any, search: string, searchFields: string[]) => {
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }));
  }
  return where;
};

export const buildPrismaOrderBy = (sort: Record<string, 'asc' | 'desc'>) => {
  return Object.entries(sort).map(([field, direction]) => ({
    [field]: direction
  }));
};

// Error handling utilities
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string = 'Bad Request', details?: any): ApiError {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static validationError(message: string = 'Validation Error', details?: any): ApiError {
    return new ApiError(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(message, 429, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      error: this.code,
      details: this.details
    };
  }
}

// Async wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Data transformation utilities
export const transformResponse = {
  // Remove sensitive fields from user objects
  sanitizeUser: (user: any) => {
    const { password, resetToken, ...sanitized } = user;
    return sanitized;
  },

  // Format dates consistently
  formatDates: (obj: any) => {
    const formatted = { ...obj };
    Object.keys(formatted).forEach(key => {
      if (formatted[key] instanceof Date) {
        formatted[key] = formatted[key].toISOString();
      }
    });
    return formatted;
  },

  // Add computed fields
  addComputedFields: (obj: any, computedFields: Record<string, (obj: any) => any>) => {
    const enhanced = { ...obj };
    Object.entries(computedFields).forEach(([key, fn]) => {
      enhanced[key] = fn(obj);
    });
    return enhanced;
  }
};

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userSessions: (id: string) => `user:${id}:sessions`,
  cruise: (id: string) => `cruise:${id}`,
  cruiseList: (query: string) => `cruises:${query}`,
  hotel: (id: string) => `hotel:${id}`,
  hotelList: (query: string) => `hotels:${query}`,
  package: (id: string) => `package:${id}`,
  packageList: (query: string) => `packages:${query}`,
  booking: (id: string) => `booking:${id}`,
  bookingList: (userId: string, query: string) => `bookings:${userId}:${query}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  adminStats: () => 'admin:stats',
  systemHealth: () => 'system:health'
};

// Business logic helpers
export const businessRules = {
  // Validate booking dates
  validateBookingDates: (startDate: Date, endDate: Date) => {
    const now = new Date();
    const maxAdvanceBooking = new Date();
    maxAdvanceBooking.setFullYear(now.getFullYear() + 2);

    if (startDate <= now) {
      throw ApiError.badRequest('Booking start date must be in the future');
    }

    if (endDate <= startDate) {
      throw ApiError.badRequest('End date must be after start date');
    }

    if (startDate > maxAdvanceBooking) {
      throw ApiError.badRequest('Cannot book more than 2 years in advance');
    }
  },

  // Calculate pricing with discounts
  calculateTotalPrice: (basePrice: number, quantity: number, discounts: any[] = []) => {
    let total = basePrice * quantity;

    discounts.forEach(discount => {
      if (discount.type === 'percentage') {
        total *= (1 - discount.value / 100);
      } else if (discount.type === 'fixed') {
        total -= discount.value;
      }
    });

    return Math.max(0, total);
  },

  // Check availability
  checkAvailability: async (resourceType: string, resourceId: string, date: Date, quantity: number) => {
    // This would typically check against actual availability data
    // For now, return a simple availability check
    return {
      available: true,
      remainingCapacity: 100 - quantity
    };
  }
};

// Validation helpers
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  isValidDateRange: (start: string, end: string): boolean => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate && startDate > new Date();
  },

  isValidPrice: (price: number): boolean => {
    return price > 0 && price < 1000000 && Number.isFinite(price);
  }
};

// Export commonly used response patterns
export const responses = {
  success: (data?: any, message?: string) =>
    ResponseBuilder.success(data).message(message || 'Operation successful').build(),

  created: (data: any, message?: string) =>
    ResponseBuilder.success(data).message(message || 'Resource created successfully').build(),

  updated: (data: any, message?: string) =>
    ResponseBuilder.success(data).message(message || 'Resource updated successfully').build(),

  deleted: (message?: string) =>
    ResponseBuilder.success().message(message || 'Resource deleted successfully').build(),

  notFound: (resource?: string) =>
    ResponseBuilder.error(`${resource || 'Resource'} not found`, 'NOT_FOUND').build(),

  unauthorized: (message?: string) =>
    ResponseBuilder.error(message || 'Authentication required', 'UNAUTHORIZED').build(),

  forbidden: (message?: string) =>
    ResponseBuilder.error(message || 'Insufficient permissions', 'FORBIDDEN').build(),

  badRequest: (message?: string, details?: any) => {
    const builder = ResponseBuilder.error(message || 'Invalid request', 'BAD_REQUEST');
    if (details) builder.metadata(details);
    return builder.build();
  },

  validationError: (errors: any[]) =>
    ResponseBuilder.error('Validation failed', 'VALIDATION_ERROR').metadata({ errors }).build(),

  tooManyRequests: (retryAfter?: number) => {
    const builder = ResponseBuilder.error('Too many requests', 'TOO_MANY_REQUESTS');
    if (retryAfter) builder.metadata({ retryAfter });
    return builder.build();
  }
};