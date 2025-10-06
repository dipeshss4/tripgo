import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import validator from 'validator';

export interface ValidationRequest extends Request {
  validatedData?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

export const validate = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: ValidationRequest, res: Response, next: NextFunction) => {
    try {
      const validatedData: any = {};

      // Validate body
      if (schemas.body) {
        validatedData.body = schemas.body.parse(req.body);
      }

      // Validate query
      if (schemas.query) {
        validatedData.query = schemas.query.parse(req.query);
      }

      // Validate params
      if (schemas.params) {
        validatedData.params = schemas.params.parse(req.params);
      }

      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: error
      });
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  id: z.object({
    id: z.string().uuid('Invalid ID format')
  }),

  pagination: z.object({
    page: z.string().optional().transform(val => val ? Math.max(1, parseInt(val)) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(100, Math.max(1, parseInt(val))) : 10)
  }),

  email: z.string().email('Invalid email format'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .regex(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character'),

  phoneNumber: z.string().refine(
    (val) => validator.isMobilePhone(val),
    'Invalid phone number format'
  ),

  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format')
  }).refine(
    (data) => new Date(data.startDate) < new Date(data.endDate),
    'End date must be after start date'
  ),

  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),

  currency: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.enum(['USD', 'EUR', 'GBP', 'INR'], {
      errorMap: () => ({ message: 'Invalid currency code' })
    })
  }),

  fileUpload: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size too large (max 10MB)'),
    filename: z.string()
  })
};

// Sanitization functions
export const sanitize = {
  html: (text: string): string => {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },

  sql: (text: string): string => {
    return text.replace(/['"\\;]/g, '');
  },

  xss: (text: string): string => {
    return validator.escape(text);
  },

  trim: (text: string): string => {
    return text.trim();
  },

  toLowerCase: (text: string): string => {
    return text.toLowerCase();
  },

  removeSpecialChars: (text: string): string => {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  }
};

// Input sanitization middleware
export const sanitizeInput = (fields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const sanitizeObject = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (fields.length === 0 || fields.includes(key)) {
            obj[key] = sanitize.xss(sanitize.trim(obj[key]));
          }
        } else if (typeof obj[key] === 'object') {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  };
};

// Rate limiting by user
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();

    const userLimit = userRequestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequestCounts.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

// File validation middleware
export const validateFile = (options: {
  allowedTypes?: string[];
  maxSize?: number;
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { allowedTypes = [], maxSize = 10 * 1024 * 1024, required = false } = options;

    if (!req.file && required) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    if (!req.file && !required) {
      return next();
    }

    const file = req.file!;

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

// Business validation helpers
export const businessValidation = {
  isValidBookingDate: (date: string): boolean => {
    const bookingDate = new Date(date);
    const now = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 2);

    return bookingDate > now && bookingDate < maxDate;
  },

  isValidPrice: (price: number): boolean => {
    return price > 0 && price < 1000000;
  },

  isValidCapacity: (capacity: number): boolean => {
    return capacity > 0 && capacity <= 10000;
  },

  isValidDuration: (duration: number): boolean => {
    return duration > 0 && duration <= 365;
  }
};