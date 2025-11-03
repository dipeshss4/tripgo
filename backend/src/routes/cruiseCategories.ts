import express from 'express';
import { cruiseCategoryController } from '../controllers/cruiseCategoryController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/', cruiseCategoryController.getAll);
router.get('/:id', cruiseCategoryController.getById);
router.get('/slug/:slug', cruiseCategoryController.getBySlug);

// Admin routes (require authentication)
router.post('/', authenticateToken, requireRole(UserRole.ADMIN), cruiseCategoryController.create);
router.put('/:id', authenticateToken, requireRole(UserRole.ADMIN), cruiseCategoryController.update);
router.delete('/:id', authenticateToken, requireRole(UserRole.ADMIN), cruiseCategoryController.delete);
router.patch('/:id/toggle-status', authenticateToken, requireRole(UserRole.ADMIN), cruiseCategoryController.toggleStatus);

export default router;