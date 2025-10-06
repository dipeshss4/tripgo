import express from 'express';
import {
  getSiteSettings,
  updateSiteSetting,
  deleteSiteSetting,
  getAllTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getMediaFiles,
  deleteMediaFile,
  createSystemBackup,
  getSystemLogs,
  getSystemPerformance,
  getDetailedHealthCheck,
  getDatabaseStatus,
  getCacheStatus,
  getNotificationSettings,
  updateNotificationSettings,
  testNotificationSystem,
  getEmailTemplates,
  updateEmailTemplate,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAPIUsageStats,
  getRateLimitSettings,
  updateRateLimitSettings,
  getAPIKeys,
  createAPIKey,
  revokeAPIKey,
  getSystemConfig,
  updateSystemConfig,
  resetSystemConfig,
  getMaintenanceStatus,
  enableMaintenanceMode,
  disableMaintenanceMode
} from '../controllers/systemController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requirePermission } from '../middleware/roleAuth';
import {
  validatePaginationParams
} from '../middleware/adminValidation';

const router = express.Router();

// SITE SETTINGS ROUTES
router.get('/settings', authenticateToken, requireAdmin, getSiteSettings);
router.put('/settings/:key', authenticateToken, requireAdmin, updateSiteSetting);
router.delete('/settings/:key', authenticateToken, requireAdmin, deleteSiteSetting);

// TENANT MANAGEMENT ROUTES
router.get('/tenants', authenticateToken, requireAdmin, validatePaginationParams, getAllTenants);
router.post('/tenants', authenticateToken, requireAdmin, createTenant);
router.put('/tenants/:tenantId', authenticateToken, requireAdmin, updateTenant);
router.delete('/tenants/:tenantId', authenticateToken, requireAdmin, deleteTenant);

// MEDIA FILE MANAGEMENT ROUTES
router.get('/media', authenticateToken, requireAdmin, validatePaginationParams, getMediaFiles);
router.delete('/media/:fileId', authenticateToken, requireAdmin, deleteMediaFile);

// SYSTEM MAINTENANCE ROUTES
router.post('/backup', authenticateToken, requireAdmin, createSystemBackup);
router.get('/logs', authenticateToken, requireAdmin, getSystemLogs);

// SYSTEM MONITORING
router.get('/performance', authenticateToken, requireAdmin, getSystemPerformance);
router.get('/health-check', authenticateToken, requireAdmin, getDetailedHealthCheck);
router.get('/database/status', authenticateToken, requireAdmin, getDatabaseStatus);
router.get('/cache/status', authenticateToken, requireAdmin, getCacheStatus);

// EMAIL & NOTIFICATIONS
router.get('/notifications/settings', authenticateToken, requireAdmin, getNotificationSettings);
router.put('/notifications/settings', authenticateToken, requireAdmin, updateNotificationSettings);
router.post('/notifications/test', authenticateToken, requireAdmin, testNotificationSystem);
router.get('/email/templates', authenticateToken, requireAdmin, getEmailTemplates);
router.put('/email/templates/:templateId', authenticateToken, requireAdmin, updateEmailTemplate);

// SECURITY & PERMISSIONS
router.get('/permissions', authenticateToken, requireAdmin, getAllPermissions);
router.post('/permissions', authenticateToken, requireAdmin, createPermission);
router.put('/permissions/:permissionId', authenticateToken, requireAdmin, updatePermission);
router.delete('/permissions/:permissionId', authenticateToken, requireAdmin, deletePermission);
router.get('/roles', authenticateToken, requireAdmin, getAllRoles);
router.post('/roles', authenticateToken, requireAdmin, createRole);
router.put('/roles/:roleId', authenticateToken, requireAdmin, updateRole);
router.delete('/roles/:roleId', authenticateToken, requireAdmin, deleteRole);

// API MANAGEMENT
router.get('/api/usage', authenticateToken, requireAdmin, getAPIUsageStats);
router.get('/api/rate-limits', authenticateToken, requireAdmin, getRateLimitSettings);
router.put('/api/rate-limits', authenticateToken, requireAdmin, updateRateLimitSettings);
router.get('/api/keys', authenticateToken, requireAdmin, getAPIKeys);
router.post('/api/keys', authenticateToken, requireAdmin, createAPIKey);
router.delete('/api/keys/:keyId', authenticateToken, requireAdmin, revokeAPIKey);

// SYSTEM CONFIGURATION
router.get('/config', authenticateToken, requireAdmin, getSystemConfig);
router.put('/config', authenticateToken, requireAdmin, updateSystemConfig);
router.post('/config/reset', authenticateToken, requireAdmin, resetSystemConfig);

// MAINTENANCE MODE
router.get('/maintenance', authenticateToken, requireAdmin, getMaintenanceStatus);
router.post('/maintenance/enable', authenticateToken, requireAdmin, enableMaintenanceMode);
router.post('/maintenance/disable', authenticateToken, requireAdmin, disableMaintenanceMode);

export default router;