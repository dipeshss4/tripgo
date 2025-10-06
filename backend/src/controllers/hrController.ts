import { Request, Response, NextFunction } from 'express';
import { PrismaClient, EmployeeStatus, AttendanceStatus, LeaveStatus, PayrollStatus } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { RoleAuthRequest } from '../middleware/roleAuth';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

// Employee Management
export const createEmployee = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      userId,
      employeeId,
      department,
      position,
      salary,
      hireDate,
      manager,
      skills,
      bio,
      address,
      emergencyContact
    } = req.body;

    // Check if user exists and is not already an employee
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createError('User not found', 404));
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { userId } });
    if (existingEmployee) {
      return next(createError('User is already an employee', 400));
    }

    // Check if employee ID is unique
    const existingEmpId = await prisma.employee.findUnique({ where: { employeeId } });
    if (existingEmpId) {
      return next(createError('Employee ID already exists', 400));
    }

    // Get tenantId from request or fallback to user's tenantId
    let tenantId = req.tenantId || user.tenantId;

    // If still no tenantId, find the first available tenant (for development)
    if (!tenantId) {
      const firstTenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
      if (firstTenant) {
        tenantId = firstTenant.id;
      }
    }

    if (!tenantId) {
      return next(createError('Tenant ID is required', 400));
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        position,
        salary: salary ? parseFloat(salary) : null,
        hireDate: new Date(hireDate),
        manager,
        skills: skills || [],
        bio,
        address,
        emergencyContact,
        department,
        tenantId,
        user: {
          connect: { id: userId }
        }
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
      data: employee,
      message: 'Employee created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      department,
      status,
      position,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (department) where.department = { contains: department as string, mode: 'insensitive' };
    if (status) where.status = status;
    if (position) where.position = { contains: position as string, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { employeeId: { contains: search as string, mode: 'insensitive' } },
        { user: {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        employees,
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

export const getEmployeeById = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
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
        },
        attendance: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        performance: {
          take: 3,
          orderBy: { reviewDate: 'desc' }
        }
      }
    });

    if (!employee) {
      return next(createError('Employee not found', 404));
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

export const updateEmployee = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.salary) {
      updateData.salary = parseFloat(updateData.salary);
    }

    if (updateData.hireDate) {
      updateData.hireDate = new Date(updateData.hireDate);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
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
      data: employee,
      message: 'Employee updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Attendance Management
export const markAttendance = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate
        }
      }
    });

    let attendance;

    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkIn: checkIn ? new Date(checkIn) : undefined,
          checkOut: checkOut ? new Date(checkOut) : undefined,
          status: status || AttendanceStatus.PRESENT,
          notes
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new attendance
      attendance = await prisma.attendance.create({
        data: {
          employeeId,
          date: attendanceDate,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          status: status || AttendanceStatus.PRESENT,
          notes
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      page = '1',
      limit = '30'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate as string) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate as string) };
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.attendance.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        attendance,
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

// Leave Management
export const createLeaveRequest = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        days,
        reason
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: leaveRequest,
      message: 'Leave request created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequests = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      employeeId,
      status,
      type,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.leaveRequest.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        leaveRequests,
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

export const updateLeaveRequestStatus = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const approvedBy = req.userId!;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: status !== LeaveStatus.PENDING ? approvedBy : null,
        approvedAt: status !== LeaveStatus.PENDING ? new Date() : null,
        comments
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: leaveRequest,
      message: 'Leave request updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Department Management
export const createDepartment = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, headId, budget } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        description,
        headId,
        budget: budget ? parseFloat(budget) : null
      }
    });

    const response: ApiResponse = {
      success: true,
      data: department,
      message: 'Department created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    const response: ApiResponse = {
      success: true,
      data: departments
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// HR Dashboard
export const getHRDashboard = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      departmentStats,
      recentJoiners
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } }),
      prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        _count: { departmentId: true },
        where: {
          departmentId: {
            not: null
          }
        }
      }),
      prisma.employee.findMany({
        take: 5,
        orderBy: { hireDate: 'desc' },
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
      })
    ]);

    // Transform department stats to include department names
    const departmentDetails = await prisma.department.findMany({
      select: { id: true, name: true }
    });

    const departmentStatsWithNames = await Promise.all(
      departmentStats.map(async (stat) => {
        const dept = departmentDetails.find(d => d.id === stat.departmentId);
        return {
          category: dept?.name || 'Unassigned',
          count: stat._count.departmentId,
          size: stat._count.departmentId // For now, using count as size
        };
      })
    );

    const dashboard = {
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      departmentStats: departmentStatsWithNames,
      recentJoiners
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