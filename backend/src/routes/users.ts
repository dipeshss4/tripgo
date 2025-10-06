import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getAllBookings,
  updateBookingStatus
} from '@/controllers/userController';
import { authenticateToken } from '@/middleware/auth';
import { requirePermission, requireAdmin, checkResourceOwnership } from '@/middleware/roleAuth';

const router = express.Router();

router.get('/', authenticateToken, requirePermission('VIEW_ALL_USERS'), getUsers);
router.post('/', authenticateToken, requirePermission('CREATE_USER'), createUser);
router.get('/:id', authenticateToken, requirePermission('VIEW_USER_DETAILS'), getUserById);
router.put('/:id', authenticateToken, checkResourceOwnership, updateUser);
router.delete('/:id', authenticateToken, requirePermission('DELETE_USER'), deleteUser);
router.put('/:id/role', authenticateToken, requirePermission('UPDATE_USER_ROLE'), updateUserRole);
router.get('/bookings/all', authenticateToken, requirePermission('VIEW_ALL_BOOKINGS'), getAllBookings);
router.put('/bookings/:bookingId/status', authenticateToken, requirePermission('UPDATE_BOOKING_STATUS'), updateBookingStatus);

export default router;