import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
  varyBy?: string[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  headers?: Record<string, string>;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number, headers?: Record<string, string>): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      headers
    });
  }

  get(key: string): any {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

const cache = new MemoryCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

const defaultKeyGenerator = (req: Request): string => {
  const baseKey = `${req.method}:${req.path}`;
  const queryKey = Object.keys(req.query).length > 0
    ? `:${JSON.stringify(req.query)}`
    : '';
  return baseKey + queryKey;
};

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    varyBy = []
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or when skipCache returns true
    if (req.method !== 'GET' || skipCache(req)) {
      return next();
    }

    // Generate cache key
    let cacheKey = keyGenerator(req);

    // Add vary by headers to cache key
    if (varyBy.length > 0) {
      const varyValues = varyBy.map(header => req.headers[header.toLowerCase()] || '').join(':');
      cacheKey += `:vary:${varyValues}`;
    }

    // Check if we have cached data
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry) {
      // Set cached headers if they exist
      if (cachedEntry.headers) {
        Object.entries(cachedEntry.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
      }

      // Add cache headers
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `max-age=${Math.floor((cachedEntry.ttl - (Date.now() - cachedEntry.timestamp)) / 1000)}`);

      return res.json(cachedEntry.data);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Capture response headers
        const headersToCache: Record<string, string> = {};
        ['content-type', 'etag', 'last-modified'].forEach(header => {
          const value = res.get(header);
          if (value) {
            headersToCache[header] = value;
          }
        });

        // Cache the response
        cache.set(cacheKey, data, ttl, headersToCache);
      }

      // Add cache headers
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `max-age=${ttl}`);

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

export const invalidateCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  const keys = cache.keys();
  const regex = new RegExp(pattern);

  keys.forEach(key => {
    if (regex.test(key)) {
      cache.delete(key);
    }
  });
};

export const getCacheStats = () => {
  return {
    size: cache.size(),
    keys: cache.keys().length
  };
};

// Cache invalidation helpers for specific resources
export const invalidateCacheByResource = (resource: string, id?: string) => {
  if (id) {
    invalidateCache(`.*/${resource}/${id}.*`);
  }
  invalidateCache(`.*/${resource}.*`);
};

// Cache warming - preload frequently accessed data
export const warmCache = async (routes: Array<{path: string, handler: Function}>) => {
  for (const route of routes) {
    try {
      // This would typically make internal API calls to warm the cache
      console.log(`Warming cache for: ${route.path}`);
    } catch (error) {
      console.error(`Failed to warm cache for ${route.path}:`, error);
    }
  }
};