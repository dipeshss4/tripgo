import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const cruiseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  duration: z.number().positive('Duration must be positive'),
  type: z.string().min(1, 'Type is required'),
  badge: z.string().optional(),
  capacity: z.number().positive('Capacity must be positive'),
  amenities: z.array(z.string()).optional(),
  departure: z.string().min(1, 'Departure is required'),
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
});

export const bookingSchema = z.object({
  guests: z.number().positive('Number of guests must be positive'),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  specialRequests: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
};