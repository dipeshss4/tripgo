import express from 'express';
import {
  getShips,
  getShipBySlug,
  createShip,
  updateShip,
  deleteShip,
  getShipReviews,
  addShipReview,
  checkShipAvailability,
  getShipRoute
} from '@/controllers/shipController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requirePermission, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', optionalAuth, getShips);
router.get('/:slug', optionalAuth, getShipBySlug);

router.post('/', authenticateToken, requirePermission('CREATE_SHIP'), createShip);
router.put('/:id', authenticateToken, requirePermission('UPDATE_SHIP'), updateShip);
router.delete('/:id', authenticateToken, requirePermission('DELETE_SHIP'), deleteShip);
router.get('/:id/reviews', getShipReviews);
router.post('/:id/reviews', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), addShipReview);
router.get('/:id/availability', checkShipAvailability);
router.get('/:id/route', getShipRoute);

export default router;