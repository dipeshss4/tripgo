import express from 'express';
import {
  getDashboardStats,
  getAllUsersAdmin,
  getAllBookingsAdmin,
  getAnalytics,
  getReports,
  updateBookingStatusAdmin,
  promoteUserToAdmin,
  demoteUser,
  banUser,
  unbanUser,
  getSystemHealth,
  bulkUserActions,
  bulkBookingActions,
  bulkContentActions,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getRevenueReport,
  getBookingsSummary,
  getPopularDestinations,
  getPendingContent,
  approveContent,
  rejectContent,
  getUserActivityLogs,
  getAdminActivityLogs,
  getSystemErrorLogs,
  exportUsers,
  exportBookings,
  exportRevenueData,
  importUsers,
  importContent
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/roleAuth';
import {
  validatePaginationParams,
  validateSearchParams,
  validateAnalyticsParams,
  validateReportsParams,
  validateBookingStatusUpdate,
  validateUserRoleUpdate
} from '../middleware/adminValidation';

const router = express.Router();

// Dashboard and Analytics
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);
router.get('/analytics', authenticateToken, requirePermission('VIEW_ANALYTICS'), validateAnalyticsParams, getAnalytics);
router.get('/reports', authenticateToken, requirePermission('VIEW_REPORTS'), validateReportsParams, getReports);
router.get('/system/health', authenticateToken, requireAdmin, getSystemHealth);

// User Management
router.get('/users', authenticateToken, requirePermission('VIEW_ALL_USERS'), validatePaginationParams, validateSearchParams, getAllUsersAdmin);
router.put('/users/:userId/promote', authenticateToken, requirePermission('UPDATE_USER_ROLE'), validateUserRoleUpdate, promoteUserToAdmin);
router.put('/users/:userId/demote', authenticateToken, requirePermission('UPDATE_USER_ROLE'), validateUserRoleUpdate, demoteUser);
router.put('/users/:userId/ban', authenticateToken, requireAdmin, validateUserRoleUpdate, banUser);
router.put('/users/:userId/unban', authenticateToken, requireAdmin, validateUserRoleUpdate, unbanUser);

// Booking Management
router.get('/bookings', authenticateToken, requirePermission('VIEW_ALL_BOOKINGS'), validatePaginationParams, getAllBookingsAdmin);
router.put('/bookings/:bookingId/status', authenticateToken, requirePermission('UPDATE_BOOKING_STATUS'), validateBookingStatusUpdate, updateBookingStatusAdmin);

// Bulk Operations
router.post('/users/bulk-actions', authenticateToken, requireAdmin, bulkUserActions);
router.post('/bookings/bulk-actions', authenticateToken, requireAdmin, bulkBookingActions);
router.post('/content/bulk-actions', authenticateToken, requireAdmin, bulkContentActions);

// Reviews Management
router.get('/reviews', authenticateToken, requirePermission('VIEW_ALL_REVIEWS'), validatePaginationParams, getAllReviews);
router.put('/reviews/:reviewId/status', authenticateToken, requirePermission('MODERATE_REVIEWS'), updateReviewStatus);
router.delete('/reviews/:reviewId', authenticateToken, requirePermission('DELETE_REVIEWS'), deleteReview);

// Financial Reports
router.get('/financial/revenue', authenticateToken, requirePermission('VIEW_FINANCIAL_REPORTS'), getRevenueReport);
router.get('/financial/bookings-summary', authenticateToken, requirePermission('VIEW_FINANCIAL_REPORTS'), getBookingsSummary);
router.get('/financial/popular-destinations', authenticateToken, requirePermission('VIEW_ANALYTICS'), getPopularDestinations);

// Content Moderation
router.get('/content/pending-approval', authenticateToken, requirePermission('MODERATE_CONTENT'), getPendingContent);
router.put('/content/:contentId/approve', authenticateToken, requirePermission('MODERATE_CONTENT'), approveContent);
router.put('/content/:contentId/reject', authenticateToken, requirePermission('MODERATE_CONTENT'), rejectContent);

// Activity Logs
router.get('/logs/user-activity', authenticateToken, requireAdmin, getUserActivityLogs);
router.get('/logs/admin-activity', authenticateToken, requireAdmin, getAdminActivityLogs);
router.get('/logs/system-errors', authenticateToken, requireAdmin, getSystemErrorLogs);

// Export/Import
router.post('/export/users', authenticateToken, requireAdmin, exportUsers);
router.post('/export/bookings', authenticateToken, requireAdmin, exportBookings);
router.post('/export/revenue', authenticateToken, requireAdmin, exportRevenueData);
router.post('/import/users', authenticateToken, requireAdmin, importUsers);
router.post('/import/content', authenticateToken, requireAdmin, importContent);

export default router;