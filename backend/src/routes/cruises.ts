import express from 'express';
import {
  getCruises,
  getCruiseBySlug,
  createCruise,
  updateCruise,
  deleteCruise,
  getCruiseReviews,
  addCruiseReview,
  checkCruiseAvailability,
  getCruiseRoute
} from '@/controllers/cruiseController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requirePermission, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', optionalAuth, getCruises);
router.get('/:slug', optionalAuth, getCruiseBySlug);

router.post('/', authenticateToken, requirePermission('CREATE_CRUISE'), createCruise);
router.put('/:id', authenticateToken, requirePermission('UPDATE_CRUISE'), updateCruise);
router.delete('/:id', authenticateToken, requirePermission('DELETE_CRUISE'), deleteCruise);
router.get('/:id/reviews', getCruiseReviews);
router.post('/:id/reviews', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), addCruiseReview);
router.get('/:id/availability', checkCruiseAvailability);
router.get('/:id/route', getCruiseRoute);

export default router;