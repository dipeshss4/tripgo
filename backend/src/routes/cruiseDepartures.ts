import express from 'express';
import { cruiseDepartureController } from '../controllers/cruiseDepartureController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/cruise/:cruiseId', cruiseDepartureController.getByCruiseId);
router.get('/:id', cruiseDepartureController.getById);

// Admin routes (require authentication)
router.post('/', authenticateToken, requireRole(UserRole.ADMIN), cruiseDepartureController.create);
router.post('/bulk', authenticateToken, requireRole(UserRole.ADMIN), cruiseDepartureController.createBulk);
router.put('/:id', authenticateToken, requireRole(UserRole.ADMIN), cruiseDepartureController.update);
router.delete('/:id', authenticateToken, requireRole(UserRole.ADMIN), cruiseDepartureController.delete);
router.patch('/:id/update-seats', authenticateToken, requireRole(UserRole.ADMIN), cruiseDepartureController.updateSeats);

export default router;