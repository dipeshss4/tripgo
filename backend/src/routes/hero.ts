import { Router } from 'express';
import {
  getHeroSettings,
  getAllHeroSettings,
  upsertHeroSettings,
  deleteHeroSettings
} from '@/controllers/heroController';
import { authenticateToken, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/:page', getHeroSettings); // Get hero settings for a specific page (e.g., /hero/home)

// Admin routes - require authentication and admin role
router.get('/', authenticateToken, requireRole(UserRole.ADMIN), getAllHeroSettings);
router.put('/:page', authenticateToken, requireRole(UserRole.ADMIN), upsertHeroSettings);
router.delete('/:page', authenticateToken, requireRole(UserRole.ADMIN), deleteHeroSettings);

export default router;