import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  markAttendance,
  getAttendance,
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
  createDepartment,
  getDepartments,
  getHRDashboard
} from '@/controllers/hrController';
import { authenticateToken } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// HR Dashboard
router.get('/dashboard', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN]), getHRDashboard);

// Employee Management
router.post('/employees', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN]), createEmployee);
router.get('/employees', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), getEmployees);
router.get('/employees/:id', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), getEmployeeById);
router.put('/employees/:id', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN]), updateEmployee);

// Attendance Management
router.post('/attendance', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), markAttendance);
router.get('/attendance', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), getAttendance);

// Leave Management
router.post('/leave-requests', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), createLeaveRequest);
router.get('/leave-requests', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), getLeaveRequests);
router.put('/leave-requests/:id/status', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN]), updateLeaveRequestStatus);

// Department Management
router.post('/departments', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN]), createDepartment);
router.get('/departments', authenticateToken, requireRole([UserRole.HR_MANAGER, UserRole.ADMIN, UserRole.EMPLOYEE]), getDepartments);

export default router;