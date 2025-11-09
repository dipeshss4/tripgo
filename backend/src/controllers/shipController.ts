import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { ShipFilters, ApiResponse, ReviewRequest } from '@/types';

const prisma = new PrismaClient();

export const getShips = async (req: Request, res: Response, next: NextFunction) => {
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
    } = req.query as ShipFilters & { destination?: string; search?: string };

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

    const [ships, total] = await Promise.all([
      prisma.ship.findMany({
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
      prisma.ship.count({ where })
    ]);

    // Transform available to isActive for frontend compatibility
    const transformedShips = ships.map(ship => ({
      ...ship,
      isActive: ship.available,
      available: undefined
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        ships: transformedShips,
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

export const getShipBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const ship = await prisma.ship.findUnique({
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

    if (!ship) {
      return next(createError('Ship not found', 404));
    }

    // Transform available to isActive for frontend compatibility
    const transformedShip = {
      ...ship,
      isActive: ship.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedShip
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createShip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const createData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const ship = await prisma.ship.create({
      data: createData
    });

    // Transform available to isActive for frontend compatibility
    const transformedShip = {
      ...ship,
      isActive: ship.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedShip,
      message: 'Ship created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateShip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const updateData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const ship = await prisma.ship.update({
      where: { id },
      data: updateData
    });

    // Transform available to isActive for frontend compatibility
    const transformedShip = {
      ...ship,
      isActive: ship.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedShip,
      message: 'Ship updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteShip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.ship.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Ship deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getShipReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { shipId: id },
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
      prisma.review.count({ where: { shipId: id } })
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

export const addShipReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: shipId } = req.params;
    const { rating, comment } = req.body as ReviewRequest;
    const userId = req.userId!;

    // Check if user already reviewed this ship
    const existingReview = await prisma.review.findFirst({
      where: { userId, shipId }
    });

    if (existingReview) {
      return next(createError('You have already reviewed this ship', 400));
    }

    const review = await prisma.review.create({
      data: {
        userId,
        shipId,
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

    // Update ship rating
    const avgRating = await prisma.review.aggregate({
      where: { shipId },
      _avg: { rating: true }
    });

    await prisma.ship.update({
      where: { id: shipId },
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

export const checkShipAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { date, guests = 1 } = req.query;

    const ship = await prisma.ship.findUnique({
      where: { id }
    });

    if (!ship) {
      return next(createError('Ship not found', 404));
    }

    // Check if ship is available
    const isAvailable = ship.available;

    // Check capacity (simplified logic - in real world, you'd check specific sailing dates)
    const guestCount = parseInt(guests as string) || 1;
    const hasCapacity = guestCount <= ship.capacity;

    // Mock availability based on ship capacity and date
    const selectedDate = date ? new Date(date as string) : null;
    const isDateValid = !selectedDate || selectedDate > new Date();

    const availability = {
      available: isAvailable && hasCapacity && isDateValid,
      capacity: ship.capacity,
      remainingSpots: Math.max(0, ship.capacity - Math.floor(ship.capacity * 0.3)), // Mock 30% booked
      pricePerPerson: ship.price,
      totalPrice: ship.price * guestCount,
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

export const getShipRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const ship = await prisma.ship.findUnique({
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

    if (!ship) {
      return next(createError('Ship not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: ship.id,
        name: ship.name,
        routeGeo: ship.routeGeo || [],
        routeNames: ship.routeNames || [],
        highlights: ship.highlights || [],
        videos: ship.videos || {},
        departure: ship.departure,
        destination: ship.destination,
        duration: ship.duration
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};