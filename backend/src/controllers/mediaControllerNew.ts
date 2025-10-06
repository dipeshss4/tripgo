import { Request, Response, NextFunction } from 'express';
import { PrismaClient, MediaCategory } from '@prisma/client';
import { AuthRequest } from '@/middleware/auth';
import { TenantRequest } from '@/middleware/tenantIsolation';
import { createError } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';
import { MediaService } from '@/services/mediaService';
import fs from 'fs';
import path from 'path';

// Combined request type for media routes
interface MediaRequest extends AuthRequest, TenantRequest {}

const prisma = new PrismaClient();
const mediaService = new MediaService();

// Get all media files with pagination and filtering
export const getMediaFiles = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    // Provide fallback tenantId for development
    const tenantId = req.tenantId || 'default-tenant';
    const {
      page = 1,
      limit = 20,
      category,
      search,
      folder,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const result = await mediaService.getMediaFiles(tenantId, {
      category: category as string,
      search: search as string,
      folder: folder as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    const response: ApiResponse = {
      success: true,
      data: result
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Upload single or multiple files
export const uploadFiles = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const userId = req.userId; // Can be undefined in development mode
    const files = req.files as Express.Multer.File[];
    const { folder, tags, title, description } = req.body;

    if (!files || files.length === 0) {
      return next(createError('No files uploaded', 400));
    }

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : [];
      }
    }

    const result = await mediaService.saveMultipleMediaFiles(files, userId, req, {
      description,
      folder,
      tags: parsedTags,
      tenantId
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `${result.savedFiles.length} file(s) uploaded successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Upload single file
export const uploadSingle = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const userId = req.userId; // Can be undefined in development mode
    const file = req.file;
    const { folder, tags, title, description, alt, category } = req.body;

    if (!file) {
      return next(createError('No file uploaded', 400));
    }

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : [];
      }
    }

    const mediaFile = await mediaService.saveMediaFile(file, userId, req, {
      title,
      description,
      alt,
      category,
      folder,
      tags: parsedTags,
      tenantId
    });

    const response: ApiResponse = {
      success: true,
      data: mediaFile,
      message: 'File uploaded successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get single media file
export const getMediaFile = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const { id } = req.params;

    const mediaFile = await mediaService.getMediaFileById(id, tenantId);

    const response: ApiResponse = {
      success: true,
      data: mediaFile
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Update media file metadata
export const updateMediaFile = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const { id } = req.params;
    const { title, description, alt, tags, folder } = req.body;

    // Parse tags if provided
    let parsedTags: string[] | undefined;
    if (tags !== undefined) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : [];
      }
    }

    const updatedFile = await mediaService.updateMediaFile(id, tenantId, {
      title,
      description,
      alt,
      folder,
      tags: parsedTags
    });

    const response: ApiResponse = {
      success: true,
      data: updatedFile,
      message: 'Media file updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete media file
export const deleteMediaFile = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const { id } = req.params;

    const result = await mediaService.deleteMediaFile(id, tenantId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Media file deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get media statistics
export const getMediaStats = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';

    const stats = await mediaService.getStorageStats(tenantId);

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get folders
export const getFolders = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';

    const folders = await mediaService.getFolders(tenantId);

    const response: ApiResponse = {
      success: true,
      data: folders
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Bulk delete media files
export const bulkDeleteFiles = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId || 'default-tenant';
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return next(createError('File IDs are required', 400));
    }

    const result = await mediaService.bulkDeleteFiles(fileIds, tenantId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `${result.deletedCount} file(s) deleted successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Serve media files
export const serveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, category, filename } = req.params;

    const filePath = path.join(process.cwd(), 'uploads', tenantId, category, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(createError('File not found', 404));
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      contentType = `image/${ext.slice(1) === 'jpg' ? 'jpeg' : ext.slice(1)}`;
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) {
      contentType = `video/${ext.slice(1)}`;
    } else if (['.mp3', '.wav', '.ogg', '.flac'].includes(ext)) {
      contentType = `audio/${ext.slice(1)}`;
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// Get file by ID and serve it
export const serveFileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!mediaFile) {
      return next(createError('File not found', 404));
    }

    // Check if file exists
    if (!fs.existsSync(mediaFile.path)) {
      return next(createError('File not found on disk', 404));
    }

    // Set appropriate headers
    const ext = path.extname(mediaFile.filename).toLowerCase();
    let contentType = mediaFile.mimetype || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Disposition', `inline; filename="${mediaFile.originalName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(mediaFile.path);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};


// ADMIN MEDIA MANAGEMENT
export const getMediaOverview = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalFiles,
      totalSize,
      recentFiles,
      filesByType,
      largestFiles
    ] = await Promise.all([
      prisma.mediaFile.count(),
      prisma.mediaFile.aggregate({
        _sum: { size: true }
      }),
      prisma.mediaFile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.mediaFile.groupBy({
        by: ['mimetype'],
        _count: { mimetype: true },
        _sum: { size: true }
      }),
      prisma.mediaFile.findMany({
        take: 10,
        orderBy: { size: 'desc' },
        include: {
          uploader: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        totalFiles,
        totalSize: Number(totalSize._sum.size) || 0,
        recentFiles,
        filesByType,
        largestFiles
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMediaUsageStats = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const usageStats = await prisma.mediaFile.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      _count: { category: true },
      _sum: { size: true }
    });

    const response: ApiResponse = {
      success: true,
      data: usageStats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaIds } = req.body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return next(createError('Media IDs are required', 400));
    }

    const files = await prisma.mediaFile.findMany({
      where: { id: { in: mediaIds } }
    });

    // Delete files from filesystem
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    const result = await prisma.mediaFile.deleteMany({
      where: { id: { in: mediaIds } }
    });

    const response: ApiResponse = {
      success: true,
      data: { deleted: result.count },
      message: `${result.count} media files deleted successfully`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const optimizeMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement media optimization logic
    const response: ApiResponse = {
      success: true,
      message: 'Media optimization functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// MEDIA CATEGORIES
export const getMediaCategories = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const categories = Object.values(MediaCategory);

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.mediaFile.count({
          where: { category }
        });
        return { category, count };
      })
    );

    const response: ApiResponse = {
      success: true,
      data: categoriesWithCounts
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createMediaCategory = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when custom categories are supported
    const response: ApiResponse = {
      success: true,
      message: 'Custom media categories not yet supported'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateMediaCategory = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when custom categories are supported
    const response: ApiResponse = {
      success: true,
      message: 'Custom media categories not yet supported'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteMediaCategory = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    // Placeholder - implement when custom categories are supported
    const response: ApiResponse = {
      success: true,
      message: 'Custom media categories not yet supported'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// MEDIA PROCESSING
export const resizeMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.params;
    const { width, height, quality } = req.body;

    // Placeholder - implement image resizing logic
    const response: ApiResponse = {
      success: true,
      message: 'Media resizing functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const compressMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.params;
    const { quality } = req.body;

    // Placeholder - implement media compression logic
    const response: ApiResponse = {
      success: true,
      message: 'Media compression functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const generateThumbnails = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.params;
    const { sizes } = req.body;

    // Placeholder - implement thumbnail generation logic
    const response: ApiResponse = {
      success: true,
      message: 'Thumbnail generation functionality not yet implemented'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// MEDIA APPROVAL WORKFLOW
export const getPendingMediaApproval = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [pendingMedia, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where: {
          approved: false
        },
        skip,
        take: limitNum,
        include: {
          uploader: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mediaFile.count({
        where: { approved: false }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        media: pendingMedia,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const approveMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.params;

    const mediaFile = await prisma.mediaFile.update({
      where: { id: mediaId },
      data: { approved: true },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: mediaFile,
      message: 'Media approved successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectMedia = async (req: MediaRequest, res: Response, next: NextFunction) => {
  try {
    const { mediaId } = req.params;
    const { reason } = req.body;

    const mediaFile = await prisma.mediaFile.update({
      where: { id: mediaId },
      data: {
        approved: false,
        rejectionReason: reason
      },
      include: {
        uploader: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: mediaFile,
      message: 'Media rejected successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};