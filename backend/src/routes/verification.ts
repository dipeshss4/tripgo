import express from 'express';
import {
  verifyEmployeeDocument,
  verifyByDocumentId,
  getVerificationStats
} from '@/controllers/verificationController';
import { authenticateToken } from '@/middleware/auth';
import { requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public verification endpoints (no auth required)
router.post('/verify', verifyEmployeeDocument);
router.get('/verify/:documentId', verifyByDocumentId);

// Admin only - verification statistics
router.get('/stats', authenticateToken, requireRole(UserRole.ADMIN), getVerificationStats);

export default router;