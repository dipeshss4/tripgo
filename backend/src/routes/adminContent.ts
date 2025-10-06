import express from 'express';
import {
  getAllCruises,
  createCruise,
  updateCruise,
  deleteCruise,
  getAllHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  bulkPublishContent,
  bulkUnpublishContent,
  bulkDeleteContent,
  bulkDuplicateContent,
  getContentStatistics,
  getPopularContent,
  getContentRevenue,
  getFeaturedContent,
  toggleFeaturedContent,
  reorderFeaturedContent,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSEOAnalysis,
  updateSEOSettings,
  getContentTemplates,
  createContentTemplate,
  updateContentTemplate,
  deleteContentTemplate
} from '../controllers/contentController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/roleAuth';
import {
  validatePaginationParams,
  validateSearchParams
} from '../middleware/adminValidation';

const router = express.Router();

// CRUISE MANAGEMENT ROUTES
router.get('/cruises', authenticateToken, requireAdmin, validatePaginationParams, validateSearchParams, getAllCruises);
router.post('/cruises', authenticateToken, requirePermission('CREATE_CRUISE'), createCruise);
router.put('/cruises/:cruiseId', authenticateToken, requirePermission('UPDATE_CRUISE'), updateCruise);
router.delete('/cruises/:cruiseId', authenticateToken, requirePermission('DELETE_CRUISE'), deleteCruise);

// HOTEL MANAGEMENT ROUTES
router.get('/hotels', authenticateToken, requireAdmin, validatePaginationParams, validateSearchParams, getAllHotels);
router.post('/hotels', authenticateToken, requirePermission('CREATE_HOTEL'), createHotel);
router.put('/hotels/:hotelId', authenticateToken, requirePermission('UPDATE_HOTEL'), updateHotel);
router.delete('/hotels/:hotelId', authenticateToken, requirePermission('DELETE_HOTEL'), deleteHotel);

// PACKAGE MANAGEMENT ROUTES
router.get('/packages', authenticateToken, requireAdmin, validatePaginationParams, validateSearchParams, getAllPackages);
router.post('/packages', authenticateToken, requirePermission('CREATE_PACKAGE'), createPackage);
router.put('/packages/:packageId', authenticateToken, requirePermission('UPDATE_PACKAGE'), updatePackage);
router.delete('/packages/:packageId', authenticateToken, requirePermission('DELETE_PACKAGE'), deletePackage);

// BULK CONTENT OPERATIONS
router.post('/bulk-publish', authenticateToken, requireAdmin, bulkPublishContent);
router.post('/bulk-unpublish', authenticateToken, requireAdmin, bulkUnpublishContent);
router.post('/bulk-delete', authenticateToken, requireAdmin, bulkDeleteContent);
router.post('/bulk-duplicate', authenticateToken, requireAdmin, bulkDuplicateContent);

// CONTENT STATISTICS
router.get('/statistics/overview', authenticateToken, requireAdmin, getContentStatistics);
router.get('/statistics/popular', authenticateToken, requireAdmin, getPopularContent);
router.get('/statistics/revenue', authenticateToken, requireAdmin, getContentRevenue);

// FEATURED CONTENT MANAGEMENT
router.get('/featured', authenticateToken, requireAdmin, getFeaturedContent);
router.put('/featured/:contentId', authenticateToken, requireAdmin, toggleFeaturedContent);
router.post('/featured/reorder', authenticateToken, requireAdmin, reorderFeaturedContent);

// CATEGORY MANAGEMENT
router.get('/categories', authenticateToken, requireAdmin, getAllCategories);
router.post('/categories', authenticateToken, requireAdmin, createCategory);
router.put('/categories/:categoryId', authenticateToken, requireAdmin, updateCategory);
router.delete('/categories/:categoryId', authenticateToken, requireAdmin, deleteCategory);

// SEO MANAGEMENT
router.get('/seo/analysis', authenticateToken, requireAdmin, getSEOAnalysis);
router.put('/seo/:contentId', authenticateToken, requireAdmin, updateSEOSettings);

// CONTENT TEMPLATES
router.get('/templates', authenticateToken, requireAdmin, getContentTemplates);
router.post('/templates', authenticateToken, requireAdmin, createContentTemplate);
router.put('/templates/:templateId', authenticateToken, requireAdmin, updateContentTemplate);
router.delete('/templates/:templateId', authenticateToken, requireAdmin, deleteContentTemplate);

export default router;