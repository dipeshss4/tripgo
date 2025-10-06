import express from 'express';
import {
  createTenant,
  getTenants,
  getTenantById,
  getTenantByDomain,
  updateTenant,
  deleteTenant,
  getTenantStats,
  suspendTenant,
  activateTenant,
  initializeDefaultTenants
} from '@/controllers/tenantController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes for tenant discovery
router.get('/domain/:domain', getTenantByDomain);

// Admin-only tenant management routes
router.get('/', authenticateToken, requireRole([UserRole.ADMIN]), getTenants);
router.post('/', authenticateToken, requireRole([UserRole.ADMIN]), createTenant);
router.get('/:id', authenticateToken, requireRole([UserRole.ADMIN]), getTenantById);
router.put('/:id', authenticateToken, requireRole([UserRole.ADMIN]), updateTenant);
router.delete('/:id', authenticateToken, requireRole([UserRole.ADMIN]), deleteTenant);

// Tenant operations
router.get('/:id/stats', authenticateToken, requireRole([UserRole.ADMIN]), getTenantStats);
router.put('/:id/suspend', authenticateToken, requireRole([UserRole.ADMIN]), suspendTenant);
router.put('/:id/activate', authenticateToken, requireRole([UserRole.ADMIN]), activateTenant);

// System initialization
router.post('/initialize/defaults', authenticateToken, requireRole([UserRole.ADMIN]), initializeDefaultTenants);

export default router;