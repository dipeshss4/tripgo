import { Request, Response, NextFunction } from 'express';
import { PrismaClient, BookingType } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { BookingRequest, ApiResponse } from '@/types';

const prisma = new PrismaClient();

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cruiseId, shipId, hotelId, packageId } = req.params;
    const { guests, checkIn, checkOut, specialRequests } = req.body as BookingRequest;
    const userId = req.userId!;

    let bookingType: BookingType;
    let itemId: string;
    let totalAmount: number;

    if (cruiseId) {
      const cruise = await prisma.cruise.findUnique({ where: { id: cruiseId } });
      if (!cruise || !cruise.available) {
        return next(createError('Cruise not found or not available', 404));
      }
      bookingType = BookingType.CRUISE;
      itemId = cruiseId;
      totalAmount = Number(cruise.price) * guests;
    } else if (shipId) {
      const ship = await prisma.ship.findUnique({ where: { id: shipId } });
      if (!ship || !ship.available) {
        return next(createError('Ship not found or not available', 404));
      }
      bookingType = BookingType.SHIP;
      itemId = shipId;
      totalAmount = Number(ship.price) * guests;
    } else if (hotelId) {
      const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel || !hotel.available) {
        return next(createError('Hotel not found or not available', 404));
      }
      if (!checkIn || !checkOut) {
        return next(createError('Check-in and check-out dates are required for hotel bookings', 400));
      }
      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
      bookingType = BookingType.HOTEL;
      itemId = hotelId;
      totalAmount = Number(hotel.pricePerNight) * nights * guests;
    } else if (packageId) {
      const travelPackage = await prisma.package.findUnique({ where: { id: packageId } });
      if (!travelPackage || !travelPackage.available) {
        return next(createError('Package not found or not available', 404));
      }
      bookingType = BookingType.PACKAGE;
      itemId = packageId;
      totalAmount = Number(travelPackage.price) * guests;
    } else {
      return next(createError('Invalid booking type', 400));
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        bookingType,
        cruiseId: bookingType === BookingType.CRUISE ? itemId : undefined,
        shipId: bookingType === BookingType.SHIP ? itemId : undefined,
        hotelId: bookingType === BookingType.HOTEL ? itemId : undefined,
        packageId: bookingType === BookingType.PACKAGE ? itemId : undefined,
        guests,
        totalAmount,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        specialRequests,
      },
      include: {
        cruise: true,
        ship: true,
        hotel: true,
        package: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          cruise: true,
          ship: true,
          hotel: true,
          package: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count(),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        include: {
          cruise: true,
          hotel: true,
          package: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where: { userId } }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const booking = await prisma.booking.findFirst({
      where: { id, userId },
      include: {
        cruise: true,
        hotel: true,
        package: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: booking,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const existingBooking = await prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!existingBooking) {
      return next(createError('Booking not found', 404));
    }

    if (existingBooking.status === 'CONFIRMED' || existingBooking.status === 'COMPLETED') {
      return next(createError('Cannot update confirmed or completed booking', 400));
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: req.body,
      include: {
        cruise: true,
        hotel: true,
        package: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: booking,
      message: 'Booking updated successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const booking = await prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    if (booking.status === 'CANCELLED') {
      return next(createError('Booking is already cancelled', 400));
    }

    if (booking.status === 'COMPLETED') {
      return next(createError('Cannot cancel completed booking', 400));
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Booking cancelled successfully',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { stripePaymentId } = req.body;
    const userId = req.userId!;

    const booking = await prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    // Here you would verify the payment with Stripe
    // const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   return next(createError('Payment not successful', 400));
    // }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        stripePaymentId,
      },
      include: {
        cruise: true,
        hotel: true,
        package: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: updatedBooking,
      message: 'Payment confirmed and booking updated',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// ADMIN BOOKING OPERATIONS
export const getBookingsOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      recentBookings
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalAmount: true }
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
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
        recentBookings
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBookingRevenue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30', groupBy = 'day' } = req.query;
    const days = parseInt(period as string);

    const revenueData = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(${groupBy}, "createdAt") as period,
        SUM("totalAmount") as revenue,
        COUNT(*) as bookings
      FROM "Booking"
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        AND "status" = 'CONFIRMED'
      GROUP BY DATE_TRUNC(${groupBy}, "createdAt")
      ORDER BY period ASC
    `;

    const response: ApiResponse = {
      success: true,
      data: revenueData
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const assignBookingAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { assignedAgentId: agentId },
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
      message: 'Agent assigned to booking successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingIds, updateData } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return next(createError('Invalid booking IDs', 400));
    }

    const result = await prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: updateData
    });

    const response: ApiResponse = {
      success: true,
      data: { updated: result.count },
      message: 'Bookings updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovalBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { status: 'PENDING' },
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
      prisma.booking.count({ where: { status: 'PENDING' } })
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

export const approveBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        adminNotes: notes
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
      message: 'Booking approved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        adminNotes: reason
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
      message: 'Booking rejected successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// BOOKING NOTIFICATIONS
export const sendBookingReminder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, message } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    // Implement email/SMS sending logic here
    // await sendEmail(booking.user.email, 'Booking Reminder', message);

    const response: ApiResponse = {
      success: true,
      message: 'Booking reminder sent successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const sendBookingConfirmation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        cruise: { select: { name: true } },
        hotel: { select: { name: true } },
        package: { select: { name: true } }
      }
    });

    if (!booking) {
      return next(createError('Booking not found', 404));
    }

    // Implement email sending logic here
    // await sendBookingConfirmationEmail(booking);

    const response: ApiResponse = {
      success: true,
      message: 'Booking confirmation sent successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// BOOKING REPORTS
export const getDailyBookingReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalBookings,
      totalRevenue,
      bookingsByStatus,
      bookingsByType
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),
      prisma.booking.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: 'CONFIRMED'
        },
        _sum: { totalAmount: true }
      }),
      prisma.booking.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _count: { status: true }
      }),
      prisma.booking.groupBy({
        by: ['bookingType'],
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _count: { bookingType: true }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        totalBookings,
        totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
        bookingsByStatus,
        bookingsByType
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyBookingReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const targetDate = new Date(
      parseInt(year as string) || new Date().getFullYear(),
      parseInt(month as string) - 1 || new Date().getMonth(),
      1
    );

    const startOfMonth = new Date(targetDate);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyData = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as day,
        COUNT(*) as bookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN "totalAmount" ELSE 0 END) as revenue
      FROM "Booking"
      WHERE "createdAt" >= ${startOfMonth} AND "createdAt" <= ${endOfMonth}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `;

    const response: ApiResponse = {
      success: true,
      data: {
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        dailyData: monthlyData
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCancellationReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const [
      totalCancellations,
      cancellationsByType,
      cancellationTrend
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          status: 'CANCELLED',
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.booking.groupBy({
        by: ['bookingType'],
        where: {
          status: 'CANCELLED',
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        },
        _count: { bookingType: true }
      }),
      prisma.$queryRaw`
        SELECT
          DATE("createdAt") as date,
          COUNT(*) as cancellations
        FROM "Booking"
        WHERE status = 'CANCELLED'
          AND "createdAt" >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        totalCancellations,
        cancellationsByType,
        cancellationTrend
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};