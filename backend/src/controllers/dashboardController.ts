import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole, EmployeeStatus, LeaveStatus, AttendanceStatus } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';
import { RoleAuthRequest } from '@/middleware/roleAuth';
import { ApiResponse } from '@/types';

const prisma = new PrismaClient();

// Admin Dashboard - overview stats for admins
export const getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;

    const [
      totalUsers,
      totalBookings,
      totalCruises,
      totalHotels,
      totalPackages,
      recentBookings,
      totalRevenue
    ] = await Promise.all([
      // Total users in tenant
      prisma.user.count({
        where: { tenantId, role: 'CUSTOMER' }
      }),

      // Total bookings in tenant
      prisma.booking.count({
        where: { tenantId }
      }),

      // Total cruises in tenant
      prisma.cruise.count({
        where: { tenantId }
      }),

      // Total hotels in tenant
      prisma.hotel.count({
        where: { tenantId }
      }),

      // Total packages in tenant
      prisma.package.count({
        where: { tenantId }
      }),

      // Recent bookings with user details
      prisma.booking.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Total revenue from confirmed bookings
      prisma.booking.aggregate({
        where: {
          tenantId,
          status: 'CONFIRMED'
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    const dashboard = {
      totalUsers,
      totalBookings,
      totalCruises,
      totalHotels,
      totalPackages,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentBookings
    };

    const response: ApiResponse = {
      success: true,
      data: dashboard
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Employee Dashboard - for individual employees
export const getEmployeeDashboard = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Get employee record
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!employee) {
      return next(createError('Employee record not found', 404));
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      todayAttendance,
      monthlyAttendance,
      pendingLeaves,
      approvedLeaves,
      recentPerformance,
      monthlyStats
    ] = await Promise.all([
      // Today's attendance
      prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999))
          }
        }
      }),

      // Monthly attendance summary
      prisma.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: { gte: startOfMonth }
        },
        select: { status: true }
      }),

      // Pending leave requests
      prisma.leaveRequest.count({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.PENDING
        }
      }),

      // Approved leaves this year
      prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: { gte: startOfYear }
        },
        select: { days: true, type: true }
      }),

      // Recent performance reviews
      prisma.performance.findMany({
        where: { employeeId: employee.id },
        take: 3,
        orderBy: { reviewDate: 'desc' }
      }),

      // Monthly attendance statistics
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('day', date) as date,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
          COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late
        FROM attendance
        WHERE "employeeId" = ${employee.id}
        AND date >= ${startOfMonth}
        GROUP BY DATE_TRUNC('day', date)
        ORDER BY date DESC
      `
    ]);

    // Calculate attendance metrics
    const totalWorkingDays = monthlyAttendance.length;
    const presentDays = monthlyAttendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

    // Calculate leave statistics
    const totalLeaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);
    const leaveByType = approvedLeaves.reduce((acc, leave) => {
      acc[leave.type] = (acc[leave.type] || 0) + leave.days;
      return acc;
    }, {} as Record<string, number>);

    const dashboard = {
      employee: {
        ...employee,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      },
      todayAttendance,
      attendanceStats: {
        totalWorkingDays,
        presentDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      },
      leaveStats: {
        pendingRequests: pendingLeaves,
        totalLeaveDays,
        leaveByType
      },
      recentPerformance,
      monthlyStats
    };

    const response: ApiResponse = {
      success: true,
      data: dashboard
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Quick actions for employees
export const quickCheckIn = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return next(createError('Employee record not found', 404));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      }
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return next(createError('Already checked in today', 400));
    }

    const checkInTime = new Date();
    const workStartTime = new Date();
    workStartTime.setHours(9, 0, 0, 0); // Assuming 9 AM start time

    const status = checkInTime > workStartTime ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      },
      update: {
        checkIn: checkInTime,
        status
      },
      create: {
        employeeId: employee.id,
        date: today,
        checkIn: checkInTime,
        status
      }
    });

    const response: ApiResponse = {
      success: true,
      data: attendance,
      message: `Checked in successfully at ${checkInTime.toLocaleTimeString()}`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const quickCheckOut = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return next(createError('Employee record not found', 404));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      }
    });

    if (!attendance || !attendance.checkIn) {
      return next(createError('Please check in first', 400));
    }

    if (attendance.checkOut) {
      return next(createError('Already checked out today', 400));
    }

    const checkOutTime = new Date();

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: checkOutTime }
    });

    const response: ApiResponse = {
      success: true,
      data: updatedAttendance,
      message: `Checked out successfully at ${checkOutTime.toLocaleTimeString()}`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Employee profile and settings
export const getEmployeeProfile = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    if (!employee) {
      return next(createError('Employee record not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: employee
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeProfile = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { bio, skills, address, emergencyContact } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { userId }
    });

    if (!employee) {
      return next(createError('Employee record not found', 404));
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        bio,
        skills,
        address,
        emergencyContact
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: updatedEmployee,
      message: 'Profile updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};