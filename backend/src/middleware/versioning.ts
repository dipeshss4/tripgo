import { Request, Response, NextFunction, Router } from 'express';

export interface VersionedRequest extends Request {
  apiVersion?: string;
}

export interface VersionConfig {
  version: string;
  deprecated?: boolean;
  deprecationDate?: Date;
  sunset?: Date;
  description?: string;
}

export interface ApiVersionManager {
  versions: Map<string, VersionConfig>;
  defaultVersion: string;
  router: Router;
}

class ApiVersioning {
  private versions = new Map<string, VersionConfig>();
  private defaultVersion = 'v1';
  private routers = new Map<string, Router>();

  // Register a new API version
  registerVersion(config: VersionConfig): Router {
    this.versions.set(config.version, config);
    const router = Router();
    this.routers.set(config.version, router);
    return router;
  }

  // Set the default version
  setDefaultVersion(version: string): void {
    if (!this.versions.has(version)) {
      throw new Error(`Version ${version} is not registered`);
    }
    this.defaultVersion = version;
  }

  // Get version information
  getVersionInfo(version?: string): VersionConfig | null {
    if (version) {
      return this.versions.get(version) || null;
    }
    return this.versions.get(this.defaultVersion) || null;
  }

  // Get all versions
  getAllVersions(): Array<VersionConfig & { version: string }> {
    return Array.from(this.versions.entries()).map(([version, config]) => ({
      version,
      ...config
    }));
  }

  // Check if version is deprecated
  isDeprecated(version: string): boolean {
    const versionConfig = this.versions.get(version);
    return versionConfig?.deprecated || false;
  }

  // Check if version is sunset
  isSunset(version: string): boolean {
    const versionConfig = this.versions.get(version);
    if (!versionConfig?.sunset) return false;
    return new Date() > versionConfig.sunset;
  }

  // Get router for specific version
  getRouter(version: string): Router | null {
    return this.routers.get(version) || null;
  }

  // Version detection middleware
  versionDetector = (req: VersionedRequest, res: Response, next: NextFunction) => {
    let version = this.defaultVersion;

    // Check for version in header
    const headerVersion = req.headers['api-version'] as string;
    if (headerVersion && this.versions.has(headerVersion)) {
      version = headerVersion;
    }

    // Check for version in Accept header
    const acceptHeader = req.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/application\/vnd\.api\+json;version=([^,\s]+)/);
      if (versionMatch && versionMatch[1] && this.versions.has(versionMatch[1])) {
        version = versionMatch[1];
      }
    }

    // Check for version in URL path
    const pathVersion = req.path.match(/^\/v(\d+(?:\.\d+)?)/);
    if (pathVersion && pathVersion[1]) {
      const versionString = `v${pathVersion[1]}`;
      if (this.versions.has(versionString)) {
        version = versionString;
      }
    }

    // Check for version in query parameter
    const queryVersion = req.query.version as string;
    if (queryVersion && this.versions.has(queryVersion)) {
      version = queryVersion;
    }

    req.apiVersion = version;

    // Add version info to response headers
    res.setHeader('API-Version', version);

    // Check if version is sunset
    if (this.isSunset(version)) {
      return res.status(410).json({
        success: false,
        message: `API version ${version} has been sunset and is no longer available`,
        error: 'VERSION_SUNSET'
      });
    }

    // Add deprecation warnings
    if (this.isDeprecated(version)) {
      const versionConfig = this.getVersionInfo(version);
      res.setHeader('Deprecation', 'true');

      if (versionConfig?.sunset) {
        res.setHeader('Sunset', versionConfig.sunset.toISOString());
      }

      res.setHeader('Warning', `299 - "API version ${version} is deprecated"`);
    }

    next();
  };

  // Version routing middleware
  versionRouter = (req: VersionedRequest, res: Response, next: NextFunction) => {
    const version = req.apiVersion || this.defaultVersion;
    const versionRouter = this.getRouter(version);

    if (!versionRouter) {
      return res.status(400).json({
        success: false,
        message: `Unsupported API version: ${version}`,
        supportedVersions: Array.from(this.versions.keys())
      });
    }

    // Execute the version-specific router
    versionRouter(req, res, next);
  };
}

// Global version manager instance
export const apiVersioning = new ApiVersioning();

// Helper function to create version-aware routes
export const createVersionedRoute = (version: string, config?: Partial<VersionConfig>): Router => {
  const fullConfig: VersionConfig = {
    version,
    deprecated: false,
    description: `API version ${version}`,
    ...config
  };

  return apiVersioning.registerVersion(fullConfig);
};

// Middleware to enforce minimum version
export const requireMinVersion = (minVersion: string) => {
  return (req: VersionedRequest, res: Response, next: NextFunction) => {
    const currentVersion = req.apiVersion || apiVersioning.getVersionInfo()?.version || 'v1';

    // Simple version comparison (assumes format like v1, v2, v1.1, etc.)
    const parseVersion = (v: string): number[] => {
      return v.replace('v', '').split('.').map(Number);
    };

    const current = parseVersion(currentVersion);
    const minimum = parseVersion(minVersion);

    // Compare version numbers
    for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
      const currentPart = current[i] || 0;
      const minimumPart = minimum[i] || 0;

      if (currentPart < minimumPart) {
        return res.status(400).json({
          success: false,
          message: `This endpoint requires minimum API version ${minVersion}. Current version: ${currentVersion}`,
          error: 'VERSION_TOO_LOW'
        });
      } else if (currentPart > minimumPart) {
        break;
      }
    }

    next();
  };
};

// Response transformation based on version
export const versionedResponse = (transformers: Record<string, (data: any) => any>) => {
  return (req: VersionedRequest, res: Response, next: NextFunction) => {
    const version = req.apiVersion || 'v1';
    const transformer = transformers[version];

    if (transformer) {
      const originalJson = res.json;
      res.json = function(data: any) {
        const transformedData = transformer(data);
        return originalJson.call(this, transformedData);
      };
    }

    next();
  };
};

// Backward compatibility helpers
export const deprecatedEndpoint = (
  replacementEndpoint: string,
  sunsetDate?: Date
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Warning', `299 - "Endpoint deprecated. Use ${replacementEndpoint} instead"`);

    if (sunsetDate) {
      res.setHeader('Sunset', sunsetDate.toISOString());
    }

    next();
  };
};

// Version info endpoint
export const versionInfoEndpoint = (req: Request, res: Response) => {
  const versions = apiVersioning.getAllVersions();
  const currentVersion = apiVersioning.getVersionInfo();

  res.json({
    success: true,
    data: {
      currentVersion: currentVersion?.version,
      supportedVersions: versions,
      versioningStrategy: 'header, accept, path, query',
      headers: {
        'API-Version': 'Specifies the API version to use',
        'Accept': 'Use application/vnd.api+json;version=v1 format',
        'Deprecation': 'Indicates if the version is deprecated',
        'Sunset': 'Date when the version will be sunset'
      }
    }
  });
};

// Initialize default versions
export const initializeVersioning = () => {
  // Register v1 as default
  createVersionedRoute('v1', {
    description: 'Initial API version',
    deprecated: false
  });

  // Register v2 (current)
  createVersionedRoute('v2', {
    description: 'Enhanced API with improved functionality',
    deprecated: false
  });

  // Set v2 as default
  apiVersioning.setDefaultVersion('v2');

  return {
    v1: apiVersioning.getRouter('v1')!,
    v2: apiVersioning.getRouter('v2')!,
    versionDetector: apiVersioning.versionDetector,
    versionRouter: apiVersioning.versionRouter
  };
};