import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelReviews,
  addHotelReview
} from '@/controllers/hotelController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requirePermission, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', optionalAuth, getHotels);
router.get('/:id', optionalAuth, getHotelById);
router.post('/', authenticateToken, requirePermission('CREATE_HOTEL'), createHotel);
router.put('/:id', authenticateToken, requirePermission('UPDATE_HOTEL'), updateHotel);
router.delete('/:id', authenticateToken, requirePermission('DELETE_HOTEL'), deleteHotel);
router.get('/:id/reviews', getHotelReviews);
router.post('/:id/reviews', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), addHotelReview);

export default router;