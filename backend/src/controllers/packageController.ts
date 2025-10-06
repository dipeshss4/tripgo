import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { PackageFilters, ApiResponse, ReviewRequest } from '@/types';

const prisma = new PrismaClient();

export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      destination,
      minPrice,
      maxPrice,
      duration,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as PackageFilters;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { available: true };

    if (destination) where.destinations = { has: destination };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (duration) where.duration = parseInt(duration);
    if (rating) where.rating = { gte: parseFloat(rating) };

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
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
      prisma.package.count({ where })
    ]);

    // Transform available to isActive for frontend compatibility
    const transformedPackages = packages.map(pkg => ({
      ...pkg,
      isActive: pkg.available,
      available: undefined
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        packages: transformedPackages,
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

export const getPackageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const travelPackage = await prisma.package.findUnique({
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

    if (!travelPackage) {
      return next(createError('Package not found', 404));
    }

    // Transform available to isActive for frontend compatibility
    const transformedPackage = {
      ...travelPackage,
      isActive: travelPackage.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPackage
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const createData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const travelPackage = await prisma.package.create({
      data: createData
    });

    // Transform available to isActive for frontend compatibility
    const transformedPackage = {
      ...travelPackage,
      isActive: travelPackage.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPackage,
      message: 'Package created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive, ...otherData } = req.body;

    // Map isActive to available field
    const updateData = {
      ...otherData,
      ...(isActive !== undefined && { available: isActive })
    };

    const travelPackage = await prisma.package.update({
      where: { id },
      data: updateData
    });

    // Transform available to isActive for frontend compatibility
    const transformedPackage = {
      ...travelPackage,
      isActive: travelPackage.available,
      available: undefined
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPackage,
      message: 'Package updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.package.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Package deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getPackageReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { packageId: id },
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
      prisma.review.count({ where: { packageId: id } })
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

export const addPackageReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: packageId } = req.params;
    const { rating, comment } = req.body as ReviewRequest;
    const userId = req.userId!;

    const existingReview = await prisma.review.findFirst({
      where: { userId, packageId }
    });

    if (existingReview) {
      return next(createError('You have already reviewed this package', 400));
    }

    const review = await prisma.review.create({
      data: {
        userId,
        packageId,
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
      where: { packageId },
      _avg: { rating: true }
    });

    await prisma.package.update({
      where: { id: packageId },
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