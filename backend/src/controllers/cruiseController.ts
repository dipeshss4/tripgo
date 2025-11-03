import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { CruiseFilters, ApiResponse, ReviewRequest } from '@/types';

const prisma = new PrismaClient();

export const getCruises = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      minPrice,
      maxPrice,
      duration,
      type,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      destination,
      search
    } = req.query as CruiseFilters & { destination?: string; search?: string };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { available: true };

    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (duration) where.duration = parseInt(duration);
    if (type) where.type = { contains: type, mode: 'insensitive' };
    if (rating) where.rating = { gte: parseFloat(rating) };

    // Add destination search
    if (destination) {
      where.OR = [
        { destination: { contains: destination, mode: 'insensitive' } },
        { departure: { contains: destination, mode: 'insensitive' } },
        { departurePort: { contains: destination, mode: 'insensitive' } }
      ];
    }

    // Add general text search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { departure: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [cruises, total] = await Promise.all([
      prisma.cruise.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true
            }
          },
          departures: {
            where: {
              departureDate: {
                gte: new Date()
              }
            },
            orderBy: {
              departureDate: 'asc'
            },
            take: 5
          },
          _count: {
            select: {
              reviews: true,
              departures: true
            }
          }
        }
      }),
      prisma.cruise.count({ where })
    ]);

    // Transform available to isActive for frontend compatibility
    const transformedCruises = cruises.map(cruise => ({
      ...cruise,
      isActive: cruise.available,
      available: undefined
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        cruises: transformedCruises,
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

export const getCruiseBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const cruise = await prisma.cruise.findUnique({
      where: { id: slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true
          }
        },
        departures: {
          where: {
            departureDate: {
              gte: new Date()
            },
            status: {
              not: 'CANCELLED'
            }
          },
          orderBy: {
            departureDate: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true,
            departures: true
          }
        }
      }
    });

    if (!cruise) {
      return next(createError('Cruise not found', 404));
    }

    // Transform available to isActive for frontend compatibility
    const transformedCruise = {
      ...cruise,
      isActive: cruise.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedCruise
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createCruise = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const createData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const cruise = await prisma.cruise.create({
      data: createData
    });

    // Transform available to isActive for frontend compatibility
    const transformedCruise = {
      ...cruise,
      isActive: cruise.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedCruise,
      message: 'Cruise created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCruise = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const updateData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const cruise = await prisma.cruise.update({
      where: { id },
      data: updateData
    });

    // Transform available to isActive for frontend compatibility
    const transformedCruise = {
      ...cruise,
      isActive: cruise.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedCruise,
      message: 'Cruise updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCruise = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.cruise.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cruise deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCruiseReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { cruiseId: id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: { cruiseId: id } })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        reviews,
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

export const addCruiseReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: cruiseId } = req.params;
    const { rating, comment } = req.body as ReviewRequest;
    const userId = req.userId!;

    // Check if user already reviewed this cruise
    const existingReview = await prisma.review.findFirst({
      where: { userId, cruiseId }
    });

    if (existingReview) {
      return next(createError('You have already reviewed this cruise', 400));
    }

    const review = await prisma.review.create({
      data: {
        userId,
        cruiseId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update cruise rating
    const avgRating = await prisma.review.aggregate({
      where: { cruiseId },
      _avg: { rating: true }
    });

    await prisma.cruise.update({
      where: { id: cruiseId },
      data: { rating: avgRating._avg.rating || 0 }
    });

    const response: ApiResponse = {
      success: true,
      data: review,
      message: 'Review added successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const checkCruiseAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, guests = 1 } = req.query;

    const cruise = await prisma.cruise.findUnique({
      where: { id }
    });

    if (!cruise) {
      return next(createError('Cruise not found', 404));
    }

    // Check if cruise is available
    const isAvailable = cruise.available;

    // Check capacity (simplified logic - in real world, you'd check specific sailing dates)
    const guestCount = parseInt(guests as string) || 1;
    const hasCapacity = guestCount <= cruise.capacity;

    // Mock availability based on cruise capacity and date
    const selectedDate = date ? new Date(date as string) : null;
    const isDateValid = !selectedDate || selectedDate > new Date();

    const availability = {
      available: isAvailable && hasCapacity && isDateValid,
      capacity: cruise.capacity,
      remainingSpots: Math.max(0, cruise.capacity - Math.floor(cruise.capacity * 0.3)), // Mock 30% booked
      pricePerPerson: cruise.price,
      totalPrice: cruise.price * guestCount,
      sailingDate: date || null,
      guests: guestCount
    };

    const response: ApiResponse = {
      success: true,
      data: availability
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCruiseRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cruise = await prisma.cruise.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        routeGeo: true,
        routeNames: true,
        highlights: true,
        videos: true,
        departure: true,
        destination: true,
        duration: true
      }
    });

    if (!cruise) {
      return next(createError('Cruise not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: cruise.id,
        name: cruise.name,
        routeGeo: cruise.routeGeo || [],
        routeNames: cruise.routeNames || [],
        highlights: cruise.highlights || [],
        videos: cruise.videos || {},
        departure: cruise.departure,
        destination: cruise.destination,
        duration: cruise.duration
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};