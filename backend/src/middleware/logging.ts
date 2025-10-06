import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: any;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
}

export interface LoggingRequest extends Request {
  requestId?: string;
  startTime?: number;
}

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  private writeLog(entry: LogEntry): void {
    const logLine = JSON.stringify(entry) + '\n';

    // Write to level-specific file
    const levelFile = this.getLogFileName(entry.level);
    fs.appendFileSync(levelFile, logLine);

    // Also write to combined log
    const combinedFile = this.getLogFileName('combined');
    fs.appendFileSync(combinedFile, logLine);

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const colorMap = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m'    // Magenta
      };

      const reset = '\x1b[0m';
      const color = colorMap[entry.level] || '';

      console.log(`${color}[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${reset}`);

      if (entry.metadata) {
        console.log(color + JSON.stringify(entry.metadata, null, 2) + reset);
      }
    }
  }

  info(message: string, metadata?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      metadata
    });
  }

  warn(message: string, metadata?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      metadata
    });
  }

  error(message: string, metadata?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      metadata
    });
  }

  debug(message: string, metadata?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        metadata
      });
    }
  }

  logRequest(req: LoggingRequest, res: Response, responseTime: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'error' : 'info',
      message: `${req.method} ${req.url} - ${res.statusCode}`,
      requestId: req.requestId,
      userId: (req as any).user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime
    };

    this.writeLog(entry);
  }

  // Query performance logging
  logQuery(query: string, duration: number, metadata?: any): void {
    this.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      ...metadata
    });
  }

  // Security event logging
  logSecurityEvent(event: string, details: any): void {
    this.warn(`Security Event: ${event}`, details);
  }

  // Business event logging
  logBusinessEvent(event: string, details: any): void {
    this.info(`Business Event: ${event}`, details);
  }
}

export const logger = new Logger();

// Request ID middleware
export const requestId = (req: LoggingRequest, res: Response, next: NextFunction) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Request logging middleware
export const requestLogger = (req: LoggingRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  // Log request start
  logger.info(`${req.method} ${req.url} - Started`, {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });

  // Hook into response finish event
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - (req.startTime || 0);
    logger.logRequest(req, res, responseTime);
    return originalSend.call(this, data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: LoggingRequest, res: Response, next: NextFunction) => {
  logger.error('Request Error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id
  });

  next(err);
};

// Performance monitoring
export const performanceMonitor = (threshold: number = 1000) => {
  return (req: LoggingRequest, res: Response, next: NextFunction) => {
    req.startTime = Date.now();

    const originalSend = res.send;
    res.send = function(data) {
      const responseTime = Date.now() - (req.startTime || 0);

      if (responseTime > threshold) {
        logger.warn('Slow Request Detected', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          responseTime: `${responseTime}ms`,
          threshold: `${threshold}ms`
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// API usage analytics
const apiUsageStats = new Map<string, {
  count: number;
  totalResponseTime: number;
  errorCount: number;
  lastAccessed: Date;
}>();

export const analyticsLogger = (req: LoggingRequest, res: Response, next: NextFunction) => {
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  req.startTime = Date.now();

  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - (req.startTime || 0);

    const stats = apiUsageStats.get(endpoint) || {
      count: 0,
      totalResponseTime: 0,
      errorCount: 0,
      lastAccessed: new Date()
    };

    stats.count++;
    stats.totalResponseTime += responseTime;
    stats.lastAccessed = new Date();

    if (res.statusCode >= 400) {
      stats.errorCount++;
    }

    apiUsageStats.set(endpoint, stats);

    return originalSend.call(this, data);
  };

  next();
};

export const getApiUsageStats = () => {
  const stats: any = {};

  for (const [endpoint, data] of apiUsageStats.entries()) {
    stats[endpoint] = {
      ...data,
      averageResponseTime: data.totalResponseTime / data.count,
      errorRate: (data.errorCount / data.count) * 100
    };
  }

  return stats;
};

// Audit logging for sensitive operations
export const auditLogger = {
  logUserAction: (userId: string, action: string, resource: string, details?: any) => {
    logger.info('User Action', {
      userId,
      action,
      resource,
      details,
      type: 'audit'
    });
  },

  logAdminAction: (adminId: string, action: string, target: string, details?: any) => {
    logger.warn('Admin Action', {
      adminId,
      action,
      target,
      details,
      type: 'admin_audit'
    });
  },

  logSecurityEvent: (event: string, details: any) => {
    logger.error('Security Event', {
      event,
      details,
      type: 'security'
    });
  },

  logDataAccess: (userId: string, resource: string, operation: string) => {
    logger.info('Data Access', {
      userId,
      resource,
      operation,
      type: 'data_access'
    });
  }
};

// Log rotation (daily)
const rotateLogDaily = () => {
  const oldLogsDir = path.join(process.cwd(), 'logs', 'archive');

  if (!fs.existsSync(oldLogsDir)) {
    fs.mkdirSync(oldLogsDir, { recursive: true });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateString = yesterday.toISOString().split('T')[0];

  const logTypes = ['info', 'warn', 'error', 'debug', 'combined'];

  logTypes.forEach(type => {
    const filename = `${type}-${dateString}.log`;
    const filePath = path.join(process.cwd(), 'logs', filename);
    const archivePath = path.join(oldLogsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.renameSync(filePath, archivePath);
    }
  });
};

// Schedule daily log rotation at midnight
const scheduleLogRotation = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    rotateLogDaily();
    setInterval(rotateLogDaily, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msUntilMidnight);
};

// Initialize log rotation if not in test environment
if (process.env.NODE_ENV !== 'test') {
  scheduleLogRotation();
}