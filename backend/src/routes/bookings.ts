import express from 'express';
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmPayment,
  getBookingsOverview,
  getBookingRevenue,
  assignBookingAgent,
  bulkUpdateBookings,
  getPendingApprovalBookings,
  approveBooking,
  rejectBooking,
  sendBookingReminder,
  sendBookingConfirmation,
  getDailyBookingReport,
  getMonthlyBookingReport,
  getCancellationReport
} from '../controllers/bookingController';
import { authenticateToken } from '../middleware/auth';
import { requireRole, checkBookingOwnership } from '../middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Admin route to get all bookings
router.get('/', authenticateToken, requireRole([UserRole.ADMIN]), getAllBookings);
router.post('/cruise/:cruiseId', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), createBooking);
router.post('/hotel/:hotelId', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), createBooking);
router.post('/package/:packageId', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), createBooking);
router.get('/user', authenticateToken, getUserBookings);
router.get('/:id', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), checkBookingOwnership, getBookingById);
router.put('/:id', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), checkBookingOwnership, updateBooking);
router.delete('/:id', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), checkBookingOwnership, cancelBooking);
router.post('/:id/confirm-payment', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), checkBookingOwnership, confirmPayment);

// ADMIN ONLY BOOKING OPERATIONS
router.get('/admin/overview', authenticateToken, requireRole([UserRole.ADMIN]), getBookingsOverview);
router.get('/admin/revenue', authenticateToken, requireRole([UserRole.ADMIN]), getBookingRevenue);
router.put('/admin/:id/assign-agent', authenticateToken, requireRole([UserRole.ADMIN]), assignBookingAgent);
router.post('/admin/bulk-update', authenticateToken, requireRole([UserRole.ADMIN]), bulkUpdateBookings);
router.get('/admin/pending-approval', authenticateToken, requireRole([UserRole.ADMIN]), getPendingApprovalBookings);
router.put('/admin/:id/approve', authenticateToken, requireRole([UserRole.ADMIN]), approveBooking);
router.put('/admin/:id/reject', authenticateToken, requireRole([UserRole.ADMIN]), rejectBooking);

// BOOKING NOTIFICATIONS
router.post('/:id/send-reminder', authenticateToken, requireRole([UserRole.ADMIN]), sendBookingReminder);
router.post('/:id/send-confirmation', authenticateToken, requireRole([UserRole.ADMIN]), sendBookingConfirmation);

// BOOKING REPORTS
router.get('/reports/daily', authenticateToken, requireRole([UserRole.ADMIN]), getDailyBookingReport);
router.get('/reports/monthly', authenticateToken, requireRole([UserRole.ADMIN]), getMonthlyBookingReport);
router.get('/reports/cancellations', authenticateToken, requireRole([UserRole.ADMIN]), getCancellationReport);

export default router;