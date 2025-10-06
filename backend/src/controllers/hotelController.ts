import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { HotelFilters, ApiResponse, ReviewRequest } from '@/types';

const prisma = new PrismaClient();

export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      city,
      country,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as HotelFilters;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { available: true };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (minPrice) where.pricePerNight = { ...where.pricePerNight, gte: parseFloat(minPrice) };
    if (maxPrice) where.pricePerNight = { ...where.pricePerNight, lte: parseFloat(maxPrice) };
    if (rating) where.rating = { gte: parseFloat(rating) };

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.hotel.count({ where })
    ]);

    // Transform available to isActive for frontend compatibility
    const transformedHotels = hotels.map(hotel => ({
      ...hotel,
      isActive: hotel.available,
      available: undefined
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        hotels: transformedHotels,
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

export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
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
          select: { reviews: true }
        }
      }
    });

    if (!hotel) {
      return next(createError('Hotel not found', 404));
    }

    // Transform available to isActive for frontend compatibility
    const transformedHotel = {
      ...hotel,
      isActive: hotel.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedHotel
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const createData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const hotel = await prisma.hotel.create({
      data: createData
    });

    // Transform available to isActive for frontend compatibility
    const transformedHotel = {
      ...hotel,
      isActive: hotel.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedHotel,
      message: 'Hotel created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const updateData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData
    });

    // Transform available to isActive for frontend compatibility
    const transformedHotel = {
      ...hotel,
      isActive: hotel.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedHotel,
      message: 'Hotel updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.hotel.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Hotel deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getHotelReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { hotelId: id },
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
      prisma.review.count({ where: { hotelId: id } })
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

export const addHotelReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: hotelId } = req.params;
    const { rating, comment } = req.body as ReviewRequest;
    const userId = req.userId!;

    const existingReview = await prisma.review.findFirst({
      where: { userId, hotelId }
    });

    if (existingReview) {
      return next(createError('You have already reviewed this hotel', 400));
    }

    const review = await prisma.review.create({
      data: {
        userId,
        hotelId,
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

    const avgRating = await prisma.review.aggregate({
      where: { hotelId },
      _avg: { rating: true }
    });

    await prisma.hotel.update({
      where: { id: hotelId },
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