import express from 'express';
import { shipCategoryController } from '../controllers/shipCategoryController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/', shipCategoryController.getAll);
router.get('/:id', shipCategoryController.getById);
router.get('/slug/:slug', shipCategoryController.getBySlug);

// Admin routes (require authentication)
router.post('/', authenticateToken, requireRole(UserRole.ADMIN), shipCategoryController.create);
router.put('/:id', authenticateToken, requireRole(UserRole.ADMIN), shipCategoryController.update);
router.delete('/:id', authenticateToken, requireRole(UserRole.ADMIN), shipCategoryController.delete);
router.patch('/:id/toggle-status', authenticateToken, requireRole(UserRole.ADMIN), shipCategoryController.toggleStatus);

export default router;