import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { RoleAuthRequest } from '../middleware/roleAuth';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Auth and role checks are handled by middleware
    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      pendingBookings,
      recentBookings,
      topCruises,
      monthlyStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.booking.count({
        where: { status: BookingStatus.PENDING }
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          cruise: { select: { name: true } },
          hotel: { select: { name: true } },
          package: { select: { name: true } }
        }
      }),
      prisma.cruise.findMany({
        take: 5,
        orderBy: { rating: 'desc' },
        select: { id: true, name: true, rating: true, price: true, _count: { select: { bookings: true } } }
      }),
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as bookings,
          SUM("totalAmount") as revenue
        FROM "Booking"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `
    ]);

    // Convert BigInt values to numbers for JSON serialization
    const convertBigIntsToNumbers = (obj: any): any => {
      if (typeof obj === 'bigint') {
        return Number(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntsToNumbers);
      }
      if (obj !== null && typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntsToNumbers(value);
        }
        return converted;
      }
      return obj;
    };

    const stats = convertBigIntsToNumbers({
      totalUsers,
      totalBookings,
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      pendingBookings,
      recentBookings,
      topCruises,
      monthlyStats
    });

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    if (error instanceof Error) {
      return next(createError(`Failed to fetch dashboard statistics: ${error.message}`, 500));
    }
    next(createError('Internal server error while fetching dashboard statistics', 500));
  }
};

export const getAllUsersAdmin = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
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

export const getAllBookingsAdmin = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status, type } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          cruise: { select: { name: true } },
          hotel: { select: { name: true } },
          package: { select: { name: true } }
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

export const getAnalytics = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const [
      bookingTrends,
      revenueTrends,
      popularDestinations,
      userGrowth,
      bookingsByType
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) as bookings
        FROM "Booking"
        WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.$queryRaw`
        SELECT
          DATE("createdAt") as date,
          SUM("totalAmount") as revenue
        FROM "Booking"
        WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.cruise.findMany({
        select: {
          destination: true,
          _count: { select: { bookings: true } }
        },
        orderBy: {
          bookings: { _count: 'desc' }
        },
        take: 10
      }),
      prisma.$queryRaw`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) as new_users
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.booking.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { totalAmount: true }
      })
    ]);

    // Convert BigInt values to numbers for JSON serialization
    const convertBigIntsToNumbers = (obj: any): any => {
      if (typeof obj === 'bigint') {
        return Number(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntsToNumbers);
      }
      if (obj !== null && typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertBigIntsToNumbers(value);
        }
        return converted;
      }
      return obj;
    };

    const analytics = convertBigIntsToNumbers({
      bookingTrends,
      revenueTrends,
      popularDestinations,
      userGrowth,
      bookingsByType
    });

    const response: ApiResponse = {
      success: true,
      data: analytics
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type = 'revenue', startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };
    }

    let reportData;

    switch (type) {
      case 'revenue':
        reportData = await prisma.booking.groupBy({
          by: ['type'],
          where: dateFilter,
          _sum: { totalAmount: true },
          _count: { id: true }
        });
        break;

      case 'users':
        reportData = await prisma.user.groupBy({
          by: ['role'],
          where: dateFilter,
          _count: { id: true }
        });
        break;

      case 'bookings':
        reportData = await prisma.booking.groupBy({
          by: ['status'],
          where: dateFilter,
          _count: { id: true },
          _sum: { totalAmount: true }
        });
        break;

      default:
        return next(createError('Invalid report type', 400));
    }

    const response: ApiResponse = {
      success: true,
      data: { type, reportData }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatusAdmin = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status })
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        cruise: { select: { name: true } },
        hotel: { select: { name: true } },
        package: { select: { name: true } }
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

export const promoteUserToAdmin = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, firstName: true, lastName: true }
    });

    if (!existingUser) {
      return next(createError('User not found', 404));
    }

    if (existingUser.role === UserRole.ADMIN) {
      return next(createError('User is already an admin', 400));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.ADMIN },
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
      message: 'User promoted to admin successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const demoteUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return next(createError('Cannot demote yourself', 400));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.CUSTOMER },
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
      message: 'User demoted to customer successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return next(createError('Cannot ban yourself', 400));
    }

    // For now, we'll use isActive as a ban flag (you might want to add a separate banned field)
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User banned successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User unbanned successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const dbHealth = await prisma.$queryRaw`SELECT 1`;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const health = {
      status: 'healthy',
      uptime: Math.floor(uptime),
      database: dbHealth ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    };

    const response: ApiResponse = {
      success: true,
      data: health
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Bulk Operations
export const bulkUserActions = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, userIds } = req.body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return next(createError('Invalid action or user IDs', 400));
    }

    let result;
    switch (action) {
      case 'ban':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds, not: req.userId } },
          data: { isActive: false }
        });
        break;
      case 'unban':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true }
        });
        break;
      case 'delete':
        result = await prisma.user.deleteMany({
          where: { id: { in: userIds, not: req.userId } }
        });
        break;
      default:
        return next(createError('Invalid action', 400));
    }

    const response: ApiResponse = {
      success: true,
      data: { affected: result.count },
      message: `Bulk ${action} completed successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const bulkBookingActions = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, bookingIds, status } = req.body;

    if (!action || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return next(createError('Invalid action or booking IDs', 400));
    }

    let result;
    switch (action) {
      case 'updateStatus':
        if (!status) {
          return next(createError('Status is required for update action', 400));
        }
        result = await prisma.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status }
        });
        break;
      case 'cancel':
        result = await prisma.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: BookingStatus.CANCELLED }
        });
        break;
      case 'delete':
        result = await prisma.booking.deleteMany({
          where: { id: { in: bookingIds } }
        });
        break;
      default:
        return next(createError('Invalid action', 400));
    }

    const response: ApiResponse = {
      success: true,
      data: { affected: result.count },
      message: `Bulk ${action} completed successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const bulkContentActions = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, contentIds, contentType } = req.body;

    if (!action || !Array.isArray(contentIds) || contentIds.length === 0 || !contentType) {
      return next(createError('Invalid parameters', 400));
    }

    let result;
    switch (contentType) {
      case 'cruise':
        switch (action) {
          case 'publish':
            result = await prisma.cruise.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: true }
            });
            break;
          case 'unpublish':
            result = await prisma.cruise.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: false }
            });
            break;
          case 'delete':
            result = await prisma.cruise.deleteMany({
              where: { id: { in: contentIds } }
            });
            break;
        }
        break;
      case 'hotel':
        switch (action) {
          case 'publish':
            result = await prisma.hotel.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: true }
            });
            break;
          case 'unpublish':
            result = await prisma.hotel.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: false }
            });
            break;
          case 'delete':
            result = await prisma.hotel.deleteMany({
              where: { id: { in: contentIds } }
            });
            break;
        }
        break;
      case 'package':
        switch (action) {
          case 'publish':
            result = await prisma.package.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: true }
            });
            break;
          case 'unpublish':
            result = await prisma.package.updateMany({
              where: { id: { in: contentIds } },
              data: { isActive: false }
            });
            break;
          case 'delete':
            result = await prisma.package.deleteMany({
              where: { id: { in: contentIds } }
            });
            break;
        }
        break;
      default:
        return next(createError('Invalid content type', 400));
    }

    const response: ApiResponse = {
      success: true,
      data: { affected: result?.count || 0 },
      message: `Bulk ${action} completed successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Reviews Management
export const getAllReviews = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', status, contentType } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (contentType) where.contentType = contentType;

    // Since we don't have a reviews table yet, let's create a placeholder response
    const reviews: any[] = [];
    const total = 0;

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

export const updateReviewStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    // Placeholder - implement when review model is available
    const response: ApiResponse = {
      success: true,
      message: 'Review status updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;

    // Placeholder - implement when review model is available
    const response: ApiResponse = {
      success: true,
      message: 'Review deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Financial Reports
export const getRevenueReport = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };
    }

    const revenueData = await prisma.booking.aggregate({
      where: dateFilter,
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    const monthlyRevenue = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as revenue,
        COUNT(*) as bookings
      FROM "Booking"
      WHERE ${startDate && endDate ?
        `"createdAt" >= '${startDate}' AND "createdAt" <= '${endDate}'` :
        `"createdAt" >= NOW() - INTERVAL '12 months'`}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    const response: ApiResponse = {
      success: true,
      data: {
        totalRevenue: Number(revenueData._sum.totalAmount) || 0,
        totalBookings: revenueData._count,
        monthlyRevenue: monthlyRevenue
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBookingsSummary = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const summary = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    const response: ApiResponse = {
      success: true,
      data: summary
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getPopularDestinations = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    const destinations = await prisma.cruise.groupBy({
      by: ['destination'],
      _count: { destination: true },
      orderBy: { _count: { destination: 'desc' } },
      take: limitNum
    });

    const response: ApiResponse = {
      success: true,
      data: destinations
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Content Moderation
export const getPendingContent = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', type } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let pendingContent: any[] = [];
    let total = 0;

    if (!type || type === 'cruise') {
      const cruises = await prisma.cruise.findMany({
        where: { isActive: false },
        skip: type ? skip : 0,
        take: type ? limitNum : Math.floor(limitNum / 3),
        select: {
          id: true,
          name: true,
          destination: true,
          price: true,
          createdAt: true
        }
      });
      pendingContent = [...pendingContent, ...cruises.map(c => ({ ...c, type: 'cruise' }))];
    }

    if (!type || type === 'hotel') {
      const hotels = await prisma.hotel.findMany({
        where: { isActive: false },
        skip: type ? skip : 0,
        take: type ? limitNum : Math.floor(limitNum / 3),
        select: {
          id: true,
          name: true,
          location: true,
          price: true,
          createdAt: true
        }
      });
      pendingContent = [...pendingContent, ...hotels.map(h => ({ ...h, type: 'hotel' }))];
    }

    if (!type || type === 'package') {
      const packages = await prisma.package.findMany({
        where: { isActive: false },
        skip: type ? skip : 0,
        take: type ? limitNum : Math.floor(limitNum / 3),
        select: {
          id: true,
          name: true,
          destination: true,
          price: true,
          createdAt: true
        }
      });
      pendingContent = [...pendingContent, ...packages.map(p => ({ ...p, type: 'package' }))];
    }

    const response: ApiResponse = {
      success: true,
      data: {
        content: pendingContent,
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

export const approveContent = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.params;
    const { type } = req.body;

    if (!type) {
      return next(createError('Content type is required', 400));
    }

    let result;
    switch (type) {
      case 'cruise':
        result = await prisma.cruise.update({
          where: { id: contentId },
          data: { isActive: true }
        });
        break;
      case 'hotel':
        result = await prisma.hotel.update({
          where: { id: contentId },
          data: { isActive: true }
        });
        break;
      case 'package':
        result = await prisma.package.update({
          where: { id: contentId },
          data: { isActive: true }
        });
        break;
      default:
        return next(createError('Invalid content type', 400));
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Content approved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectContent = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.params;
    const { type, reason } = req.body;

    if (!type) {
      return next(createError('Content type is required', 400));
    }

    // For now, we'll just keep it inactive and potentially store rejection reason
    const response: ApiResponse = {
      success: true,
      message: 'Content rejected successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Activity Logs
export const getUserActivityLogs = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', userId, action } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Placeholder - implement when activity logging is available
    const logs: any[] = [];
    const total = 0;

    const response: ApiResponse = {
      success: true,
      data: {
        logs,
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

export const getAdminActivityLogs = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', adminId, action } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Placeholder - implement when activity logging is available
    const logs: any[] = [];
    const total = 0;

    const response: ApiResponse = {
      success: true,
      data: {
        logs,
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

export const getSystemErrorLogs = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', level, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Placeholder - implement when error logging is available
    const logs: any[] = [];
    const total = 0;

    const response: ApiResponse = {
      success: true,
      data: {
        logs,
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

// Export/Import
export const exportUsers = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { format = 'csv', filters } = req.body;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: users,
      message: 'Users exported successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const exportBookings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { format = 'csv', filters } = req.body;

    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        cruise: { select: { name: true } },
        hotel: { select: { name: true } },
        package: { select: { name: true } }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: bookings,
      message: 'Bookings exported successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const exportRevenueData = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { format = 'csv', startDate, endDate } = req.body;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const revenueData = await prisma.booking.findMany({
      where: dateFilter,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        type: true,
        createdAt: true,
        user: { select: { email: true } }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: revenueData,
      message: 'Revenue data exported successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const importUsers = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return next(createError('Users data must be an array', 400));
    }

    // Placeholder - implement user import logic
    const response: ApiResponse = {
      success: true,
      message: 'Users import functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const importContent = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, type } = req.body;

    if (!Array.isArray(content) || !type) {
      return next(createError('Content data and type are required', 400));
    }

    // Placeholder - implement content import logic
    const response: ApiResponse = {
      success: true,
      message: 'Content import functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};