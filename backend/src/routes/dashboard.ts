import express from 'express';
import {
  getAdminDashboard,
  getEmployeeDashboard,
  quickCheckIn,
  quickCheckOut,
  getEmployeeProfile,
  updateEmployeeProfile
} from '@/controllers/dashboardController';
import { authenticateToken } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Admin dashboard route
router.get('/', authenticateToken, requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getAdminDashboard);

// Employee dashboard routes
router.get('/employee', authenticateToken, requireRole([UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.ADMIN]), getEmployeeDashboard);
router.post('/employee/checkin', authenticateToken, requireRole([UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.ADMIN]), quickCheckIn);
router.post('/employee/checkout', authenticateToken, requireRole([UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.ADMIN]), quickCheckOut);

// Employee profile routes
router.get('/employee/profile', authenticateToken, requireRole([UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.ADMIN]), getEmployeeProfile);
router.put('/employee/profile', authenticateToken, requireRole([UserRole.EMPLOYEE, UserRole.HR_MANAGER, UserRole.ADMIN]), updateEmployeeProfile);

export default router;