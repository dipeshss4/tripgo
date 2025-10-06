import express from 'express';
import {
  getSettings,
  getPublicSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  bulkUpdateSettings,
  initializeDefaultSettings
} from '@/controllers/settingsController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);

// Protected routes - Admin only
router.get('/', authenticateToken, requireRole([UserRole.ADMIN]), getSettings);
router.get('/:key', optionalAuth, getSettingByKey);
router.post('/', authenticateToken, requireRole([UserRole.ADMIN]), createSetting);
router.put('/:key', authenticateToken, requireRole([UserRole.ADMIN]), updateSetting);
router.delete('/:key', authenticateToken, requireRole([UserRole.ADMIN]), deleteSetting);
router.put('/bulk/update', authenticateToken, requireRole([UserRole.ADMIN]), bulkUpdateSettings);
router.post('/initialize/defaults', authenticateToken, requireRole([UserRole.ADMIN]), initializeDefaultSettings);

export default router;