import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Enhanced middleware imports
import { queryEnhancer } from './middleware/queryEnhancer';
import { cacheMiddleware, invalidateCache } from './middleware/caching';
import { validate, sanitizeInput, rateLimitByUser } from './middleware/validation';
import {
  requestId,
  requestLogger,
  errorLogger,
  performanceMonitor,
  analyticsLogger,
  logger
} from './middleware/logging';
import {
  initializeVersioning,
  versionInfoEndpoint
} from './middleware/versioning';
import { enhancedAuth } from './middleware/enhancedAuth';

// Route imports
import authRoutes from './routes/auth';
import adminAuthRoutes from './routes/adminAuth';
import cruiseRoutes from './routes/cruises';
import hotelRoutes from './routes/hotels';
import packageRoutes from './routes/packages';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import adminContentRoutes from './routes/adminContent';
import adminSystemRoutes from './routes/adminSystem';
import hrRoutes from './routes/hr';
import settingsRoutes from './routes/settings';
import mediaRoutes from './routes/media';
import dashboardRoutes from './routes/dashboard';
import tenantRoutes from './routes/tenants';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Initialize API versioning
const { v1, v2, versionDetector } = initializeVersioning();

// Basic security and utility middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

app.use(compression());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://162.159.140.98',
      'https://162.159.140.98',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'API-Version', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'API-Version', 'X-Cache', 'X-Rate-Limit-Remaining']
}));

// Body parsing with size limits
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request tracking and logging
app.use(requestId);
app.use(requestLogger);
app.use(performanceMonitor(2000)); // Alert on requests > 2 seconds
app.use(analyticsLogger);

// Input sanitization
app.use(sanitizeInput());

// API versioning
app.use(versionDetector);

// Rate limiting
app.use(rateLimitByUser(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes per user

// Health check endpoint
app.get('/health', cacheMiddleware({ ttl: 60 }), (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// API version info endpoint
app.get('/api/version', versionInfoEndpoint);

// Cache management endpoints (admin only)
app.delete('/api/cache', enhancedAuth.enhancedAuth, enhancedAuth.requirePermission('MANAGE_CACHE'), (req, res) => {
  const { pattern } = req.query;
  invalidateCache(pattern as string);

  logger.info('Cache invalidated', {
    pattern,
    userId: (req as any).userId
  });

  res.json({
    success: true,
    message: pattern ? `Cache invalidated for pattern: ${pattern}` : 'All cache cleared'
  });
});

// Enhanced API routes with middleware

// V1 Routes (legacy support)
v1.use('/auth', authRoutes);
v1.use('/admin/auth', adminAuthRoutes);
v1.use('/cruises',
  queryEnhancer(['name', 'price', 'duration', 'createdAt'], ['available', 'destination']),
  cacheMiddleware({ ttl: 300 }),
  cruiseRoutes
);
v1.use('/hotels',
  queryEnhancer(['name', 'price', 'rating', 'createdAt'], ['available', 'location']),
  cacheMiddleware({ ttl: 300 }),
  hotelRoutes
);
v1.use('/packages',
  queryEnhancer(['name', 'price', 'duration', 'createdAt'], ['available', 'type']),
  cacheMiddleware({ ttl: 300 }),
  packageRoutes
);

// V2 Routes (current version with all enhancements)
v2.use('/auth', authRoutes);
v2.use('/admin/auth', adminAuthRoutes);

// Enhanced public routes with caching and query enhancement
v2.use('/cruises',
  queryEnhancer(
    ['name', 'price', 'duration', 'rating', 'createdAt', 'updatedAt'],
    ['available', 'destination', 'departure', 'capacity']
  ),
  cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => `cruises:${JSON.stringify(req.query)}`,
    varyBy: ['accept-language']
  }),
  cruiseRoutes
);

v2.use('/hotels',
  queryEnhancer(
    ['name', 'price', 'rating', 'createdAt', 'updatedAt'],
    ['available', 'location', 'amenities', 'starRating']
  ),
  cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => `hotels:${JSON.stringify(req.query)}`,
    varyBy: ['accept-language']
  }),
  hotelRoutes
);

v2.use('/packages',
  queryEnhancer(
    ['name', 'price', 'duration', 'rating', 'createdAt', 'updatedAt'],
    ['available', 'type', 'destination', 'includes']
  ),
  cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => `packages:${JSON.stringify(req.query)}`,
    varyBy: ['accept-language']
  }),
  packageRoutes
);

// Authenticated routes
v2.use('/bookings',
  enhancedAuth.enhancedAuth,
  queryEnhancer(
    ['createdAt', 'updatedAt', 'totalAmount', 'status'],
    ['status', 'userId', 'bookingType']
  ),
  bookingRoutes
);

v2.use('/users',
  enhancedAuth.enhancedAuth,
  queryEnhancer(['firstName', 'lastName', 'createdAt'], ['isActive', 'role']),
  userRoutes
);

// Admin routes with enhanced security
v2.use('/admin',
  enhancedAuth.enhancedAuth,
  enhancedAuth.requireMFA,
  enhancedAuth.requirePermission('ADMIN_ACCESS'),
  queryEnhancer(
    ['createdAt', 'updatedAt', 'name', 'email'],
    ['status', 'type', 'category']
  ),
  adminRoutes
);

v2.use('/admin/content',
  enhancedAuth.enhancedAuth,
  enhancedAuth.requirePermission('CONTENT_MANAGEMENT'),
  queryEnhancer(['title', 'createdAt', 'updatedAt'], ['status', 'category', 'featured']),
  adminContentRoutes
);

v2.use('/admin/system',
  enhancedAuth.enhancedAuth,
  enhancedAuth.requirePermission('SYSTEM_MANAGEMENT'),
  adminSystemRoutes
);

// Other routes
v2.use('/hr',
  enhancedAuth.enhancedAuth,
  enhancedAuth.requirePermission('HR_ACCESS'),
  hrRoutes
);

v2.use('/settings',
  enhancedAuth.enhancedAuth,
  queryEnhancer(['name', 'category'], ['isActive', 'scope']),
  cacheMiddleware({ ttl: 600 }), // Cache settings for 10 minutes
  settingsRoutes
);

v2.use('/media',
  enhancedAuth.enhancedAuth,
  queryEnhancer(['filename', 'createdAt', 'size'], ['mimetype', 'approved']),
  mediaRoutes
);

v2.use('/dashboard',
  enhancedAuth.enhancedAuth,
  cacheMiddleware({
    ttl: 180, // Cache dashboard data for 3 minutes
    keyGenerator: (req) => `dashboard:${(req as any).userId}:${req.path}`
  }),
  dashboardRoutes
);

v2.use('/tenants',
  enhancedAuth.enhancedAuth,
  enhancedAuth.requirePermission('TENANT_MANAGEMENT'),
  queryEnhancer(['name', 'createdAt'], ['isActive', 'plan']),
  tenantRoutes
);

// Mount versioned routes
app.use('/api/v1', v1);
app.use('/api/v2', v2);
app.use('/api', v2); // Default to v2

// Serve uploaded files with caching headers
app.use('/uploads',
  cacheMiddleware({ ttl: 3600 }), // Cache uploads for 1 hour
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  },
  express.static('uploads', {
    maxAge: '1h',
    etag: true,
    lastModified: true
  })
);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'TripGo API Documentation',
      version: '2.0.0',
      description: 'Enhanced REST API for TripGo travel booking platform',
      features: [
        'API Versioning (v1, v2)',
        'Advanced Query Parameters (filtering, sorting, pagination)',
        'Intelligent Caching',
        'Enhanced Authentication & Authorization',
        'Request/Response Logging',
        'Rate Limiting',
        'Input Validation & Sanitization',
        'Performance Monitoring'
      ],
      endpoints: {
        health: 'GET /health',
        version: 'GET /api/version',
        auth: 'POST /api/auth/login',
        cruises: 'GET /api/cruises?page=1&limit=10&sort=price:asc&filter={"available":true}',
        hotels: 'GET /api/hotels?search=luxury&include=amenities',
        packages: 'GET /api/packages?select=name,price&filter={"type":"adventure"}',
        bookings: 'GET /api/bookings (authenticated)',
        admin: 'GET /api/admin/* (admin only)'
      },
      queryParameters: {
        page: 'Page number for pagination (default: 1)',
        limit: 'Items per page (default: 10, max: 100)',
        sort: 'Sort fields with direction (e.g., price:asc,name:desc)',
        search: 'Search term for text fields',
        filter: 'JSON object for complex filtering',
        include: 'Comma-separated list of relations to include',
        select: 'Comma-separated list of fields to select'
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh'
      }
    }
  });
});

// Error handling middleware
app.use(errorLogger);

// Enhanced error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't log 404s as errors
  if (err.status !== 404) {
    logger.error('Request Error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err
    } : undefined,
    requestId: (req as any).requestId
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check /api/docs for available endpoints',
    requestId: (req as any).requestId
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`🚀 Enhanced server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS enabled for multiple origins`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`🔍 Health Check: http://localhost:${PORT}/health`);
  logger.info(`⚡ Features: Caching, Logging, Versioning, Enhanced Auth, Rate Limiting`);
});

export default app;