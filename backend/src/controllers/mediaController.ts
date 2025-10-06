import { Request, Response, NextFunction } from 'express';
import { MediaService } from '@/services/mediaService';
import { createError } from '@/middleware/errorHandler';
import { RoleAuthRequest } from '@/middleware/roleAuth';
import { ApiResponse } from '@/types';
import fs from 'fs';
import path from 'path';

const mediaService = new MediaService();

export const uploadSingle = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    const userId = req.userId!;
    const tenantId = req.tenantId!;
    const { title, description, alt, category, folder, tags } = req.body;

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : [];
      }
    }

    const mediaFile = await mediaService.saveMediaFile(req.file, userId, req, {
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

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const uploadMultiple = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return next(createError('No files uploaded', 400));
    }

    const userId = req.userId!;
    const { description, isPublic } = req.body;

    const result = await mediaService.saveMultipleMediaFiles(req.files, userId, req, {
      description,
      isPublic: isPublic === 'true'
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `${result.savedFiles.length} files uploaded successfully`
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const uploadFields = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files) {
      return next(createError('No files uploaded', 400));
    }

    const userId = req.userId!;
    const { description, isPublic } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const result: any = {
      images: { savedFiles: [], failedFiles: [] },
      videos: { savedFiles: [], failedFiles: [] },
      documents: { savedFiles: [], failedFiles: [] }
    };

    // Process each field type
    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && Array.isArray(fileArray)) {
        const fieldResult = await mediaService.saveMultipleMediaFiles(fileArray, userId, req, {
          description,
          isPublic: isPublic === 'true'
        });
        result[fieldName] = fieldResult;
      }
    }

    const totalSaved = Object.values(result).reduce((sum: number, field: any) =>
      sum + field.savedFiles.length, 0);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `${totalSaved} files uploaded successfully`
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMediaFiles = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const {
      category,
      isPublic,
      page = '1',
      limit = '20'
    } = req.query;

    const filters = {
      category: category as string,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await mediaService.getMediaFiles(userId, filters);

    const response: ApiResponse = {
      success: true,
      data: result
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMediaFileById = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const mediaFile = await mediaService.getMediaFileById(id, userId);

    const response: ApiResponse = {
      success: true,
      data: mediaFile
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateMediaFile = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { description, alt, isPublic } = req.body;

    const mediaFile = await mediaService.updateMediaFile(id, userId, {
      description,
      alt,
      isPublic
    });

    const response: ApiResponse = {
      success: true,
      data: mediaFile,
      message: 'Media file updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteMediaFile = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await mediaService.deleteMediaFile(id, userId);

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

export const getStorageStats = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userRole === 'ADMIN' ? undefined : req.userId!;

    const stats = await mediaService.getStorageStats(userId);

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const serveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const { category = 'images' } = req.query;

    const filePath = path.join(process.cwd(), 'uploads', category as string, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(createError('File not found', 404));
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      contentType = `image/${ext.slice(1) === 'jpg' ? 'jpeg' : ext.slice(1)}`;
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) {
      contentType = `video/${ext.slice(1)}`;
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

export const cleanupOrphanedFiles = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await mediaService.cleanupOrphanedFiles();

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Cleaned up ${result.cleanedCount} orphaned files`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Gallery endpoints for frontend
export const getGalleryImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '12',
      category = 'image'
    } = req.query;

    const filters = {
      category: category as string,
      isPublic: true,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    // For public gallery, we don't need user authentication
    const result = await mediaService.getMediaFiles('', filters);

    const response: ApiResponse = {
      success: true,
      data: result
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getHeroMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get hero section media from settings or default media
    const heroImages = await mediaService.getMediaFiles('', {
      category: 'image',
      isPublic: true,
      page: 1,
      limit: 5
    });

    const heroVideos = await mediaService.getMediaFiles('', {
      category: 'video',
      isPublic: true,
      page: 1,
      limit: 3
    });

    const response: ApiResponse = {
      success: true,
      data: {
        images: heroImages.files,
        videos: heroVideos.files
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};