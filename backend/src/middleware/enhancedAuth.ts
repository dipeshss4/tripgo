import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';
import { logger, auditLogger } from './logging';

const prisma = new PrismaClient();

export interface EnhancedAuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  tenantId?: string;
  user?: any;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  securityContext?: SecurityContext;
}

export interface DeviceInfo {
  userAgent: string;
  ip: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser?: string;
  os?: string;
  fingerprint?: string;
}

export interface SecurityContext {
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: Date;
  sessionDuration: number;
  loginAttempts: number;
  suspiciousActivity: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId?: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Token blacklist for logout functionality
const tokenBlacklist = new Set<string>();

// Session store for active sessions
const activeSessions = new Map<string, {
  userId: string;
  deviceInfo: DeviceInfo;
  lastActivity: Date;
  loginTime: Date;
}>();

// Rate limiting for failed login attempts
const loginAttempts = new Map<string, {
  count: number;
  lastAttempt: Date;
  lockUntil?: Date;
}>();

class EnhancedAuth {
  // Generate device fingerprint
  generateDeviceFingerprint(req: Request): string {
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';
    const ip = req.ip;

    return Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}:${ip}`).toString('base64');
  }

  // Parse device information
  parseDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip;

    let deviceType: DeviceInfo['deviceType'] = 'unknown';
    let browser = 'unknown';
    let os = 'unknown';

    // Simple device detection
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    } else {
      deviceType = 'desktop';
    }

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
      userAgent,
      ip,
      deviceType,
      browser,
      os,
      fingerprint: this.generateDeviceFingerprint(req)
    };
  }

  // Calculate security trust score
  calculateTrustScore(deviceInfo: DeviceInfo, user: any, sessionHistory: any[]): number {
    let score = 50; // Base score

    // Known device bonus
    const knownDevice = sessionHistory.some(session =>
      session.deviceFingerprint === deviceInfo.fingerprint
    );
    if (knownDevice) score += 20;

    // Location consistency
    const recentLocations = sessionHistory.slice(-5).map(s => s.ip);
    const locationConsistency = recentLocations.filter(ip => ip === deviceInfo.ip).length / recentLocations.length;
    score += locationConsistency * 15;

    // Time-based factors
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour <= 22) score += 10; // Normal hours bonus

    // Account age bonus
    const accountAgeMonths = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    score += Math.min(accountAgeMonths * 2, 20);

    return Math.min(100, Math.max(0, score));
  }

  // Enhanced token generation with security metadata
  async generateTokens(userId: string, deviceInfo: DeviceInfo): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
  }> {
    const sessionId = Math.random().toString(36).substring(2, 15);

    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    const payload: JWTPayload = {
      userId,
      email: user.email,
      tenantId: user.tenantId,
      sessionId,
      roles,
      permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };

    const refreshPayload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!);
    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET!);

    // Store session
    activeSessions.set(sessionId, {
      userId,
      deviceInfo,
      lastActivity: new Date(),
      loginTime: new Date()
    });

    // Log security event
    auditLogger.logSecurityEvent('TOKEN_GENERATED', {
      userId,
      sessionId,
      deviceInfo
    });

    return { accessToken, refreshToken, sessionId };
  }

  // Enhanced authentication middleware
  enhancedAuth = async (req: EnhancedAuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return next(createError('Access token required', 401));
      }

      // Check if token is blacklisted
      if (tokenBlacklist.has(token)) {
        auditLogger.logSecurityEvent('BLACKLISTED_TOKEN_USED', {
          token: token.substring(0, 20) + '...',
          ip: req.ip
        });
        return next(createError('Token has been revoked', 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Check if session is still active
      const session = activeSessions.get(decoded.sessionId);
      if (!session) {
        return next(createError('Session expired', 401));
      }

      // Get user with current data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!user || !user.isActive) {
        return next(createError('User not found or inactive', 401));
      }

      // Parse device info
      const deviceInfo = this.parseDeviceInfo(req);

      // Get session history for trust score calculation
      const sessionHistory = await prisma.userSession.findMany({
        where: { userId: decoded.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Calculate security context
      const trustScore = this.calculateTrustScore(deviceInfo, user, sessionHistory);
      const securityContext: SecurityContext = {
        trustScore,
        riskLevel: trustScore > 70 ? 'low' : trustScore > 40 ? 'medium' : 'high',
        lastActivity: session.lastActivity,
        sessionDuration: Date.now() - session.loginTime.getTime(),
        loginAttempts: loginAttempts.get(req.ip)?.count || 0,
        suspiciousActivity: this.detectSuspiciousActivity(deviceInfo, session.deviceInfo)
      };

      // Update session activity
      session.lastActivity = new Date();
      activeSessions.set(decoded.sessionId, session);

      // Attach to request
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.tenantId = decoded.tenantId;
      req.user = user;
      req.sessionId = decoded.sessionId;
      req.deviceInfo = deviceInfo;
      req.securityContext = securityContext;

      // Log data access
      auditLogger.logDataAccess(decoded.userId, req.path, req.method);

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        auditLogger.logSecurityEvent('INVALID_TOKEN', {
          error: error.message,
          ip: req.ip
        });
        return next(createError('Invalid token', 401));
      }
      next(error);
    }
  };

  // Multi-factor authentication check
  requireMFA = (req: EnhancedAuthRequest, res: Response, next: NextFunction) => {
    if (!req.securityContext) {
      return next(createError('Authentication required', 401));
    }

    if (req.securityContext.riskLevel === 'high' || req.securityContext.trustScore < 30) {
      return res.status(403).json({
        success: false,
        message: 'Multi-factor authentication required',
        error: 'MFA_REQUIRED',
        trustScore: req.securityContext.trustScore,
        riskLevel: req.securityContext.riskLevel
      });
    }

    next();
  };

  // Permission-based authorization
  requirePermission = (permission: string) => {
    return (req: EnhancedAuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(createError('Authentication required', 401));
      }

      const userPermissions = req.user.userRoles.flatMap((ur: any) =>
        ur.role.rolePermissions.map((rp: any) => rp.permission.name)
      );

      if (!userPermissions.includes(permission)) {
        auditLogger.logSecurityEvent('PERMISSION_DENIED', {
          userId: req.userId,
          requiredPermission: permission,
          userPermissions
        });
        return next(createError('Insufficient permissions', 403));
      }

      next();
    };
  };

  // Rate limiting for authentication
  rateLimitAuth = (maxAttempts: number = 5, lockoutMinutes: number = 15) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = req.ip; // Could also use email
      const now = new Date();

      const attempts = loginAttempts.get(identifier);

      if (attempts) {
        // Check if still locked out
        if (attempts.lockUntil && now < attempts.lockUntil) {
          const remainingTime = Math.ceil((attempts.lockUntil.getTime() - now.getTime()) / 1000 / 60);
          return res.status(429).json({
            success: false,
            message: `Account locked. Try again in ${remainingTime} minutes.`,
            lockoutRemaining: remainingTime
          });
        }

        // Reset if lockout period has passed
        if (attempts.lockUntil && now >= attempts.lockUntil) {
          loginAttempts.delete(identifier);
        }
      }

      next();
    };
  };

  // Track login attempts
  trackLoginAttempt = (identifier: string, success: boolean) => {
    const now = new Date();
    const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: now };

    if (success) {
      loginAttempts.delete(identifier);
      return;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    if (attempts.count >= 5) {
      attempts.lockUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
      auditLogger.logSecurityEvent('ACCOUNT_LOCKED', {
        identifier,
        attempts: attempts.count,
        lockUntil: attempts.lockUntil
      });
    }

    loginAttempts.set(identifier, attempts);
  };

  // Detect suspicious activity
  detectSuspiciousActivity = (current: DeviceInfo, stored: DeviceInfo): boolean => {
    // Different IP and device fingerprint
    if (current.ip !== stored.ip && current.fingerprint !== stored.fingerprint) {
      return true;
    }

    // Completely different user agent
    if (current.userAgent !== stored.userAgent && current.fingerprint !== stored.fingerprint) {
      return true;
    }

    return false;
  };

  // Logout and blacklist token
  logout = (token: string, sessionId?: string) => {
    tokenBlacklist.add(token);
    if (sessionId) {
      activeSessions.delete(sessionId);
    }

    // Clean up old blacklisted tokens periodically
    if (tokenBlacklist.size > 10000) {
      // In production, implement proper token blacklist with TTL
      tokenBlacklist.clear();
    }
  };

  // Get active sessions for a user
  getUserSessions = (userId: string) => {
    const userSessions = [];
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        userSessions.push({
          sessionId,
          ...session
        });
      }
    }
    return userSessions;
  };

  // Revoke specific session
  revokeSession = (sessionId: string) => {
    activeSessions.delete(sessionId);
  };

  // Revoke all sessions for a user
  revokeAllUserSessions = (userId: string) => {
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        activeSessions.delete(sessionId);
      }
    }
  };
}

export const enhancedAuth = new EnhancedAuth();

// Export middleware functions
export const {
  enhancedAuth: authenticate,
  requireMFA,
  requirePermission,
  rateLimitAuth,
  trackLoginAttempt,
  logout,
  getUserSessions,
  revokeSession,
  revokeAllUserSessions
} = enhancedAuth;

// Cleanup expired sessions every hour
setInterval(() => {
  const now = new Date();
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now.getTime() - session.lastActivity.getTime() > maxSessionAge) {
      activeSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);