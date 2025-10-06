import express from 'express';
import {
  uploadSingle,
  uploadFiles,
  getMediaFiles,
  getMediaFile,
  updateMediaFile,
  deleteMediaFile,
  getMediaStats,
  getFolders,
  bulkDeleteFiles,
  serveFile,
  serveFileById,
  getMediaOverview,
  getMediaUsageStats,
  bulkDeleteMedia,
  optimizeMedia,
  getMediaCategories,
  createMediaCategory,
  updateMediaCategory,
  deleteMediaCategory,
  resizeMedia,
  compressMedia,
  generateThumbnails,
  getPendingMediaApproval,
  approveMedia,
  rejectMedia
} from '@/controllers/mediaControllerNew';
import { authenticateToken } from '@/middleware/auth';
import {
  uploadSingle as uploadSingleMW,
  uploadMultiple as uploadMultipleMW
} from '@/middleware/upload';

const router = express.Router();

// Public routes for serving files
router.get('/serve/:tenantId/:category/:filename', serveFile);
router.get('/file/:id', serveFileById);

// Protected routes - require authentication only (no tenant middleware for now)
// Temporarily bypass authentication in development
if (process.env.NODE_ENV === 'production') {
  router.use(authenticateToken);
} else {
  console.log('🔧 Bypassing authentication for media routes in development mode');
}

// Media management routes
router.get('/', getMediaFiles);
router.get('/stats', getMediaStats);
router.get('/folders', getFolders);

// Upload routes
router.post('/upload', uploadSingleMW, uploadSingle);
router.post('/upload-multiple', uploadMultipleMW, uploadFiles);

// Individual file operations
router.get('/:id', getMediaFile);
router.put('/:id', updateMediaFile);
router.delete('/:id', deleteMediaFile);

// Bulk operations
router.delete('/bulk', bulkDeleteFiles);

// ADMIN MEDIA MANAGEMENT
router.get('/admin/overview', getMediaOverview);
router.get('/admin/usage-stats', getMediaUsageStats);
router.post('/admin/bulk-delete', bulkDeleteMedia);
router.post('/admin/optimize', optimizeMedia);

// MEDIA CATEGORIES
router.get('/categories', getMediaCategories);
router.post('/categories', createMediaCategory);
router.put('/categories/:categoryId', updateMediaCategory);
router.delete('/categories/:categoryId', deleteMediaCategory);

// MEDIA PROCESSING
router.post('/:mediaId/resize', resizeMedia);
router.post('/:mediaId/compress', compressMedia);
router.post('/:mediaId/generate-thumbnails', generateThumbnails);

// MEDIA APPROVAL WORKFLOW
router.get('/pending-approval', getPendingMediaApproval);
router.put('/:mediaId/approve', approveMedia);
router.put('/:mediaId/reject', rejectMedia);

export default router;