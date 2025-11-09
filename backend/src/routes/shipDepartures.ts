import express from 'express';
import { shipDepartureController } from '../controllers/shipDepartureController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/ship/:shipId', shipDepartureController.getByShipId);
router.get('/:id', shipDepartureController.getById);

// Admin routes (require authentication)
router.post('/', authenticateToken, requireRole(UserRole.ADMIN), shipDepartureController.create);
router.post('/bulk', authenticateToken, requireRole(UserRole.ADMIN), shipDepartureController.createBulk);
router.put('/:id', authenticateToken, requireRole(UserRole.ADMIN), shipDepartureController.update);
router.delete('/:id', authenticateToken, requireRole(UserRole.ADMIN), shipDepartureController.delete);
router.patch('/:id/update-seats', authenticateToken, requireRole(UserRole.ADMIN), shipDepartureController.updateSeats);

export default router;