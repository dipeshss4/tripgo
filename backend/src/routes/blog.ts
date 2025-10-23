import express from 'express';
import {
  getBlogs,
  getAllBlogsAdmin,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  getAllComments,
  moderateComment,
  deleteComment,
  getCategories,
  getTags
} from '@/controllers/blogController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { requirePermission, requireRole } from '@/middleware/roleAuth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/:slug', getBlogBySlug);

// Authenticated routes - Comments
router.post('/:blogId/comments', authenticateToken, addComment);

// Admin routes - Blogs
router.get('/admin/all', authenticateToken, requireRole([UserRole.ADMIN]), getAllBlogsAdmin);
router.get('/admin/:id', authenticateToken, requireRole([UserRole.ADMIN]), getBlogById);
router.post('/admin', authenticateToken, requireRole([UserRole.ADMIN]), createBlog);
router.put('/admin/:id', authenticateToken, requireRole([UserRole.ADMIN]), updateBlog);
router.delete('/admin/:id', authenticateToken, requireRole([UserRole.ADMIN]), deleteBlog);

// Admin routes - Comments
router.get('/admin/comments/all', authenticateToken, requireRole([UserRole.ADMIN]), getAllComments);
router.patch('/admin/comments/:id/moderate', authenticateToken, requireRole([UserRole.ADMIN]), moderateComment);
router.delete('/admin/comments/:id', authenticateToken, requireRole([UserRole.ADMIN]), deleteComment);

export default router;
