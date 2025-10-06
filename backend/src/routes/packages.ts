import express from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageReviews,
  addPackageReview
} from '@/controllers/packageController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requirePermission, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/', optionalAuth, getPackages);
router.get('/:id', optionalAuth, getPackageById);
router.post('/', authenticateToken, requirePermission('CREATE_PACKAGE'), createPackage);
router.put('/:id', authenticateToken, requirePermission('UPDATE_PACKAGE'), updatePackage);
router.delete('/:id', authenticateToken, requirePermission('DELETE_PACKAGE'), deletePackage);
router.get('/:id/reviews', getPackageReviews);
router.post('/:id/reviews', authenticateToken, requireRole([UserRole.CUSTOMER, UserRole.ADMIN]), addPackageReview);

export default router;