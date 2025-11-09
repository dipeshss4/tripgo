import { Router } from 'express';
import {
  getFooterConfig,
  getOrCreateFooterConfig,
  updateFooterConfig,
  createFooterSection,
  updateFooterSection,
  deleteFooterSection,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink
} from '@/controllers/footerController';
import { authenticateToken, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getFooterConfig);

// Admin routes - require authentication and admin role
router.get('/admin', authenticateToken, requireRole(UserRole.ADMIN), getOrCreateFooterConfig);
router.put('/admin', authenticateToken, requireRole(UserRole.ADMIN), updateFooterConfig);

// Section management
router.post('/admin/sections', authenticateToken, requireRole(UserRole.ADMIN), createFooterSection);
router.put('/admin/sections/:id', authenticateToken, requireRole(UserRole.ADMIN), updateFooterSection);
router.delete('/admin/sections/:id', authenticateToken, requireRole(UserRole.ADMIN), deleteFooterSection);

// Link management
router.post('/admin/sections/:sectionId/links', authenticateToken, requireRole(UserRole.ADMIN), createFooterLink);
router.put('/admin/links/:id', authenticateToken, requireRole(UserRole.ADMIN), updateFooterLink);
router.delete('/admin/links/:id', authenticateToken, requireRole(UserRole.ADMIN), deleteFooterLink);

export default router;