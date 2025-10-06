import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Enhanced middleware imports
import { QueryRequest, buildPrismaQuery, formatPaginatedResponse } from '../middleware/queryEnhancer';
import { cacheMiddleware, invalidateCacheByResource } from '../middleware/caching';
import { validate, commonSchemas } from '../middleware/validation';
import { EnhancedAuthRequest, requirePermission } from '../middleware/enhancedAuth';
import { logger, auditLogger } from '../middleware/logging';
import { requireMinVersion, versionedResponse } from '../middleware/versioning';

// Utils imports
import { ResponseBuilder, ApiError, asyncHandler, responses } from '../utils/apiHelpers';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createCruiseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  duration: z.number().int().min(1, 'Duration must be at least 1 day').max(365, 'Duration too long'),
  capacity: z.number().int().positive('Capacity must be positive'),
  departure: z.string().min(1, 'Departure location required'),
  destination: z.string().min(1, 'Destination required'),
  amenities: z.array(z.string()).optional(),
  itinerary: z.record(z.any()).optional()
});

const updateCruiseSchema = createCruiseSchema.partial();

// Enhanced GET /cruises - Demonstrates advanced querying, caching, and versioning
router.get('/',
  // Cache for 5 minutes with intelligent key generation
  cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => `cruises:${JSON.stringify(req.query)}:${req.headers['api-version']}`,
    varyBy: ['accept-language', 'api-version']
  }),
  // Version-specific response transformation
  versionedResponse({
    v1: (data) => {
      // Legacy format - remove new fields for v1 compatibility
      if (data.data) {
        data.data = data.data.map((cruise: any) => {
          const { amenities, itinerary, ...legacy } = cruise;
          return legacy;
        });
      }
      return data;
    },
    v2: (data) => {
      // Enhanced format with computed fields
      if (data.data) {
        data.data = data.data.map((cruise: any) => ({
          ...cruise,
          pricePerDay: cruise.price / cruise.duration,
          availability: cruise.capacity > 0 ? 'available' : 'full',
          popularityScore: Math.random() * 100 // Mock popularity
        }));
      }
      return data;
    }
  }),
  asyncHandler(async (req: QueryRequest, res: express.Response) => {
    try {
      // Build Prisma query from enhanced query parameters
      const prismaQuery = buildPrismaQuery(
        req.enhancedQuery,
        ['name', 'description', 'departure', 'destination'] // Search fields
      );

      // Add default includes for v2
      if (req.headers['api-version'] === 'v2' || !req.headers['api-version']) {
        prismaQuery.include = {
          reviews: {
            select: { rating: true },
            take: 5
          },
          _count: {
            select: { bookings: true, reviews: true }
          }
        };
      }

      // Execute queries in parallel
      const [cruises, total] = await Promise.all([
        prisma.cruise.findMany(prismaQuery),
        prisma.cruise.count({ where: prismaQuery.where })
      ]);

      // Format response with pagination
      const response = formatPaginatedResponse(
        cruises,
        total,
        req.enhancedQuery,
        'Cruises retrieved successfully'
      );

      // Add metadata
      response.metadata = {
        searchApplied: !!req.enhancedQuery.search,
        filtersApplied: Object.keys(req.enhancedQuery.filters).length,
        cached: res.get('X-Cache') === 'HIT'
      };

      res.json(response);
    } catch (error) {
      throw new ApiError('Failed to retrieve cruises', 500, 'DATABASE_ERROR', error);
    }
  })
);

// Enhanced GET /cruises/:id - Demonstrates caching and error handling
router.get('/:id',
  validate({ params: commonSchemas.id }),
  cacheMiddleware({ ttl: 600 }), // Cache individual cruises for 10 minutes
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { id } = req.params;

    const cruise = await prisma.cruise.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        bookings: {
          select: { id: true, status: true },
          where: { status: 'CONFIRMED' }
        },
        _count: {
          select: { reviews: true, bookings: true }
        }
      }
    });

    if (!cruise) {
      throw ApiError.notFound('Cruise not found');
    }

    // Calculate average rating
    const avgRating = cruise.reviews.length > 0
      ? cruise.reviews.reduce((sum, review) => sum + review.rating, 0) / cruise.reviews.length
      : 0;

    const response = ResponseBuilder.success({
      ...cruise,
      averageRating: Math.round(avgRating * 10) / 10,
      availableSpots: cruise.capacity - cruise.bookings.length,
      popularityScore: cruise._count.bookings * 2 + cruise._count.reviews * 5
    })
      .message('Cruise retrieved successfully')
      .build();

    res.json(response);
  })
);

// Enhanced POST /cruises - Demonstrates validation, authentication, and audit logging
router.post('/',
  requirePermission('CREATE_CRUISE'),
  validate({ body: createCruiseSchema }),
  requireMinVersion('v2'), // This endpoint requires v2 or higher
  asyncHandler(async (req: EnhancedAuthRequest, res: express.Response) => {
    const cruiseData = req.validatedData!.body;

    // Add tenant isolation
    if (req.tenantId) {
      cruiseData.tenantId = req.tenantId;
    }

    const cruise = await prisma.cruise.create({
      data: cruiseData,
      include: {
        _count: {
          select: { reviews: true, bookings: true }
        }
      }
    });

    // Invalidate related caches
    invalidateCacheByResource('cruises');

    // Audit logging
    auditLogger.logUserAction(
      req.userId!,
      'CREATE',
      'cruise',
      { cruiseId: cruise.id, cruiseName: cruise.name }
    );

    logger.info('Cruise created', {
      cruiseId: cruise.id,
      userId: req.userId,
      tenantId: req.tenantId
    });

    const response = ResponseBuilder.success(cruise)
      .message('Cruise created successfully')
      .build();

    res.status(201).json(response);
  })
);

// Enhanced PUT /cruises/:id - Demonstrates optimistic locking and validation
router.put('/:id',
  requirePermission('UPDATE_CRUISE'),
  validate({
    params: commonSchemas.id,
    body: updateCruiseSchema
  }),
  asyncHandler(async (req: EnhancedAuthRequest, res: express.Response) => {
    const { id } = req.params;
    const updateData = req.validatedData!.body;

    // Check if cruise exists and user has permission
    const existingCruise = await prisma.cruise.findUnique({
      where: { id },
      select: { id: true, tenantId: true, updatedAt: true }
    });

    if (!existingCruise) {
      throw ApiError.notFound('Cruise not found');
    }

    // Tenant isolation check
    if (req.tenantId && existingCruise.tenantId !== req.tenantId) {
      throw ApiError.forbidden('Access denied to this cruise');
    }

    // Optimistic locking check (if client sends last known updatedAt)
    const lastKnownUpdate = req.headers['if-unmodified-since'];
    if (lastKnownUpdate) {
      const lastKnownDate = new Date(lastKnownUpdate as string);
      if (existingCruise.updatedAt > lastKnownDate) {
        throw ApiError.conflict('Cruise has been modified by another user');
      }
    }

    const updatedCruise = await prisma.cruise.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { reviews: true, bookings: true }
        }
      }
    });

    // Invalidate caches
    invalidateCacheByResource('cruises', id);

    // Audit logging
    auditLogger.logUserAction(
      req.userId!,
      'UPDATE',
      'cruise',
      { cruiseId: id, changes: Object.keys(updateData) }
    );

    const response = ResponseBuilder.success(updatedCruise)
      .message('Cruise updated successfully')
      .build();

    res.json(response);
  })
);

// Enhanced DELETE /cruises/:id - Demonstrates soft delete and cascade handling
router.delete('/:id',
  requirePermission('DELETE_CRUISE'),
  validate({ params: commonSchemas.id }),
  asyncHandler(async (req: EnhancedAuthRequest, res: express.Response) => {
    const { id } = req.params;

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        cruiseId: id,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    if (activeBookings > 0) {
      throw ApiError.badRequest(
        `Cannot delete cruise with ${activeBookings} active bookings`,
        { activeBookings }
      );
    }

    // Soft delete (mark as unavailable instead of actual deletion)
    const deletedCruise = await prisma.cruise.update({
      where: { id },
      data: {
        available: false,
        deletedAt: new Date(),
        deletedBy: req.userId
      }
    });

    // Invalidate caches
    invalidateCacheByResource('cruises', id);

    // Audit logging
    auditLogger.logUserAction(
      req.userId!,
      'DELETE',
      'cruise',
      { cruiseId: id, cruiseName: deletedCruise.name }
    );

    logger.warn('Cruise soft deleted', {
      cruiseId: id,
      userId: req.userId,
      activeBookings
    });

    const response = ResponseBuilder.success()
      .message('Cruise deleted successfully')
      .build();

    res.json(response);
  })
);

// Bulk operations endpoint - Demonstrates transaction handling
router.post('/bulk',
  requirePermission('BULK_CRUISE_OPERATIONS'),
  validate({
    body: z.object({
      operation: z.enum(['update', 'delete', 'activate', 'deactivate']),
      cruiseIds: z.array(z.string().uuid()).min(1).max(100),
      data: z.record(z.any()).optional()
    })
  }),
  asyncHandler(async (req: EnhancedAuthRequest, res: express.Response) => {
    const { operation, cruiseIds, data } = req.validatedData!.body;

    const results = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const cruiseId of cruiseIds) {
        try {
          let result;

          switch (operation) {
            case 'update':
              result = await tx.cruise.update({
                where: { id: cruiseId },
                data: data || {}
              });
              break;

            case 'delete':
              result = await tx.cruise.update({
                where: { id: cruiseId },
                data: {
                  available: false,
                  deletedAt: new Date(),
                  deletedBy: req.userId
                }
              });
              break;

            case 'activate':
              result = await tx.cruise.update({
                where: { id: cruiseId },
                data: { available: true }
              });
              break;

            case 'deactivate':
              result = await tx.cruise.update({
                where: { id: cruiseId },
                data: { available: false }
              });
              break;
          }

          results.push({ id: cruiseId, success: true, data: result });
        } catch (error) {
          results.push({
            id: cruiseId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    });

    // Invalidate caches
    invalidateCacheByResource('cruises');

    // Audit logging
    auditLogger.logUserAction(
      req.userId!,
      'BULK_OPERATION',
      'cruise',
      { operation, cruiseIds: cruiseIds.length, results: results.length }
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    const response = ResponseBuilder.success(results)
      .message(`Bulk operation completed: ${successCount} succeeded, ${failureCount} failed`)
      .metadata({ successCount, failureCount })
      .build();

    res.json(response);
  })
);

// Analytics endpoint - Demonstrates aggregation and caching
router.get('/analytics',
  requirePermission('VIEW_CRUISE_ANALYTICS'),
  cacheMiddleware({ ttl: 900 }), // Cache for 15 minutes
  asyncHandler(async (req: EnhancedAuthRequest, res: express.Response) => {
    const analytics = await prisma.$transaction(async (tx) => {
      const [
        totalCruises,
        activeCruises,
        totalBookings,
        avgRating,
        topDestinations,
        revenueByMonth
      ] = await Promise.all([
        tx.cruise.count(),
        tx.cruise.count({ where: { available: true } }),
        tx.booking.count({ where: { cruise: { isNot: null } } }),
        tx.review.aggregate({
          where: { cruise: { isNot: null } },
          _avg: { rating: true }
        }),
        tx.cruise.groupBy({
          by: ['destination'],
          _count: { destination: true },
          orderBy: { _count: { destination: 'desc' } },
          take: 5
        }),
        tx.booking.groupBy({
          by: ['createdAt'],
          where: {
            cruise: { isNot: null },
            createdAt: {
              gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
            }
          },
          _sum: { totalAmount: true },
          _count: { id: true }
        })
      ]);

      return {
        overview: {
          totalCruises,
          activeCruises,
          totalBookings,
          averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10
        },
        topDestinations,
        revenueByMonth: revenueByMonth.map(item => ({
          month: item.createdAt,
          revenue: item._sum.totalAmount || 0,
          bookings: item._count.id
        }))
      };
    });

    const response = ResponseBuilder.success(analytics)
      .message('Analytics data retrieved successfully')
      .metadata({ generatedAt: new Date().toISOString() })
      .build();

    res.json(response);
  })
);

export default router;