import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Verify employee document by employee ID and additional details
 * Public endpoint - no auth required for verification
 */
export const verifyEmployeeDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      fullName,
      email,
      phone,
      position,
      department,
      passportNumber
    } = req.body;

    // Validate required fields
    if (!employeeId) {
      return next(createError('Employee ID is required', 400));
    }

    // Find employee by employeeId
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        departmentRef: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!employee) {
      return res.json({
        success: false,
        verified: false,
        message: 'Employee not found',
        matchDetails: null
      });
    }

    // Check if employee is active
    if (employee.status !== 'ACTIVE') {
      return res.json({
        success: true,
        verified: false,
        message: `Employee status: ${employee.status}`,
        matchDetails: {
          employeeId: true,
          status: employee.status
        }
      });
    }

    // Verify each provided field
    const matchDetails: any = {
      employeeId: true, // Already matched
      fullName: false,
      firstName: false,
      lastName: false,
      passportNumber: false,
      email: false,
      phone: false,
      position: false,
      department: false
    };

    let matchCount = 1; // employeeId already matched
    let totalProvided = 1;

    // Check full name (if provided, check against firstName + lastName)
    if (fullName) {
      totalProvided++;
      const dbFullName = `${employee.user.firstName} ${employee.user.lastName}`.toLowerCase();
      const match = dbFullName === fullName.toLowerCase().trim();
      matchDetails.fullName = match;
      if (match) matchCount++;
    }

    // Check first name (case insensitive)
    if (firstName) {
      totalProvided++;
      const match = employee.user.firstName.toLowerCase() === firstName.toLowerCase();
      matchDetails.firstName = match;
      if (match) matchCount++;
    }

    // Check last name (case insensitive)
    if (lastName) {
      totalProvided++;
      const match = employee.user.lastName.toLowerCase() === lastName.toLowerCase();
      matchDetails.lastName = match;
      if (match) matchCount++;
    }

    // Check passport number (exact match, case insensitive)
    if (passportNumber) {
      totalProvided++;
      const match = employee.passportNumber?.toLowerCase() === passportNumber.toLowerCase().trim();
      matchDetails.passportNumber = match;
      if (match) matchCount++;
    }

    // Check email (case insensitive)
    if (email) {
      totalProvided++;
      const match = employee.user.email.toLowerCase() === email.toLowerCase();
      matchDetails.email = match;
      if (match) matchCount++;
    }

    // Check phone
    if (phone) {
      totalProvided++;
      const cleanPhone = phone.replace(/\D/g, '');
      const dbPhone = employee.user.phone?.replace(/\D/g, '') || '';
      const match = cleanPhone === dbPhone;
      matchDetails.phone = match;
      if (match) matchCount++;
    }

    // Check position (case insensitive, partial match)
    if (position) {
      totalProvided++;
      const match = employee.position.toLowerCase().includes(position.toLowerCase()) ||
                    position.toLowerCase().includes(employee.position.toLowerCase());
      matchDetails.position = match;
      if (match) matchCount++;
    }

    // Check department
    if (department) {
      totalProvided++;
      const deptName = employee.departmentRef?.name || employee.department || '';
      const match = deptName.toLowerCase().includes(department.toLowerCase()) ||
                    department.toLowerCase().includes(deptName.toLowerCase());
      matchDetails.department = match;
      if (match) matchCount++;
    }

    // Calculate match percentage
    const matchPercentage = Math.round((matchCount / totalProvided) * 100);
    const verified = matchPercentage >= 80; // 80% or higher = verified

    // Return verification result
    return res.json({
      success: true,
      verified,
      matchPercentage,
      matchCount,
      totalProvided,
      message: verified
        ? 'Document verified successfully'
        : `Verification failed. Only ${matchCount} out of ${totalProvided} fields matched.`,
      matchDetails,
      employeeInfo: verified ? {
        name: `${employee.user.firstName} ${employee.user.lastName}`,
        position: employee.position,
        department: employee.departmentRef?.name || employee.department,
        hireDate: employee.hireDate,
        status: employee.status,
        avatar: employee.user.avatar
      } : null
    });

  } catch (error) {
    console.error('Verification error:', error);
    next(error);
  }
};

/**
 * Verify employee by QR code or document ID
 */
export const verifyByDocumentId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return next(createError('Document ID is required', 400));
    }

    // Try to find employee by employeeId
    const employee = await prisma.employee.findUnique({
      where: { employeeId: documentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        departmentRef: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!employee) {
      return res.json({
        success: false,
        verified: false,
        message: 'Document ID not found'
      });
    }

    if (employee.status !== 'ACTIVE') {
      return res.json({
        success: true,
        verified: false,
        message: `Employee is ${employee.status}`,
        employeeInfo: {
          name: `${employee.user.firstName} ${employee.user.lastName}`,
          status: employee.status
        }
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Document verified successfully',
      employeeInfo: {
        employeeId: employee.employeeId,
        name: `${employee.user.firstName} ${employee.user.lastName}`,
        position: employee.position,
        department: employee.departmentRef?.name || employee.department,
        hireDate: employee.hireDate,
        status: employee.status,
        avatar: employee.user.avatar
      }
    });

  } catch (error) {
    console.error('Document verification error:', error);
    next(error);
  }
};

/**
 * Get verification statistics (admin only)
 */
export const getVerificationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalEmployees, activeEmployees, inactiveEmployees] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count({ where: { status: { not: 'ACTIVE' } } })
    ]);

    return res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        verificationEnabled: true
      }
    });

  } catch (error) {
    next(error);
  }
};