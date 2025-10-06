import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { createError } from '@/middleware/errorHandler';
import { getFileCategory, generateFileUrl } from '@/middleware/upload';

const prisma = new PrismaClient();

export class MediaService {
  async saveMediaFile(
    file: Express.Multer.File,
    userId: string | undefined,
    req: any,
    options: {
      description?: string;
      alt?: string;
      title?: string;
      category?: string;
      folder?: string;
      tags?: string[];
      tenantId: string;
    }
  ) {
    try {
      const url = generateFileUrl(req, file.path);
      const category = options.category || getFileCategory(file.mimetype);

      // Process image to get dimensions if it's an image
      let width: number | undefined;
      let height: number | undefined;
      let thumbnailUrl: string | undefined;

      if (category === 'IMAGE') {
        try {
          const sharp = require('sharp');
          const metadata = await sharp(file.path).metadata();
          width = metadata.width;
          height = metadata.height;

          // Generate thumbnail
          const thumbnailPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
          await sharp(file.path)
            .resize(200, 200, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

          thumbnailUrl = generateFileUrl(req, thumbnailPath);
        } catch (error) {
          console.warn('Failed to process image:', error); // Schema updated
        }
      }

      // Create media file data - handle case where no user is authenticated (development mode)
      const mediaFileData: any = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url,
        category: category as any,
        title: options.title,
        description: options.description,
        alt: options.alt,
        folder: options.folder,
        tags: options.tags || [],
        width,
        height,
        thumbnailUrl,
        tenantId: options.tenantId,
      };

      // Only set uploadedBy if userId is provided (when authenticated)
      if (userId) {
        mediaFileData.uploadedBy = userId;
      }

      const includeClause: any = {};
      // Only include uploader if userId is provided
      if (userId) {
        includeClause.uploader = {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        };
      }

      const mediaFile = await prisma.mediaFile.create({
        data: mediaFileData,
        include: includeClause
      });

      return mediaFile;
    } catch (error) {
      // Clean up file if database save fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  async saveMultipleMediaFiles(
    files: Express.Multer.File[],
    userId: string | undefined,
    req: any,
    options: {
      description?: string;
      folder?: string;
      tags?: string[];
      tenantId: string;
    }
  ) {
    const savedFiles = [];
    const failedFiles = [];

    for (const file of files) {
      try {
        const mediaFile = await this.saveMediaFile(file, userId, req, {
          ...options,
          category: getFileCategory(file.mimetype)
        });
        savedFiles.push(mediaFile);
      } catch (error) {
        failedFiles.push({ filename: file.originalname, error: (error as Error).message });
      }
    }

    return { savedFiles, failedFiles };
  }

  async getMediaFiles(
    tenantId: string,
    filters: {
      category?: string;
      folder?: string;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    const {
      category,
      folder,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (category && category !== 'ALL') where.category = category;
    if (folder) where.folder = folder;

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploader: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.mediaFile.count({ where })
    ]);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getMediaFileById(id: string, tenantId: string) {
    const file = await prisma.mediaFile.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!file) {
      throw createError('Media file not found', 404);
    }

    return file;
  }

  async updateMediaFile(
    id: string,
    tenantId: string,
    updates: {
      title?: string;
      description?: string;
      alt?: string;
      folder?: string;
      tags?: string[];
    }
  ) {
    const file = await prisma.mediaFile.findFirst({
      where: { id, tenantId }
    });

    if (!file) {
      throw createError('Media file not found', 404);
    }

    const updatedFile = await prisma.mediaFile.update({
      where: { id },
      data: updates,
      include: {
        uploader: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return updatedFile;
  }

  async deleteMediaFile(id: string, tenantId: string) {
    const file = await prisma.mediaFile.findFirst({
      where: { id, tenantId }
    });

    if (!file) {
      throw createError('Media file not found', 404);
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete thumbnail if exists
    if (file.thumbnailUrl) {
      const thumbnailPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Delete database record
    await prisma.mediaFile.delete({
      where: { id }
    });

    return { message: 'Media file deleted successfully' };
  }

  async getStorageStats(tenantId: string) {
    const where = { tenantId };

    const stats = await prisma.mediaFile.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
      _sum: { size: true }
    });

    const totalFiles = await prisma.mediaFile.count({ where });
    const totalSize = await prisma.mediaFile.aggregate({
      where,
      _sum: { size: true }
    });

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      byCategory: stats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
        size: stat._sum.size || 0
      }))
    };
  }

  async getFolders(tenantId: string) {
    const folders = await prisma.mediaFile.findMany({
      where: {
        tenantId,
        folder: { not: null }
      },
      select: { folder: true },
      distinct: ['folder']
    });

    return folders
      .map(f => f.folder)
      .filter(Boolean)
      .sort();
  }

  async bulkDeleteFiles(fileIds: string[], tenantId: string) {
    const filesToDelete = await prisma.mediaFile.findMany({
      where: {
        id: { in: fileIds },
        tenantId
      }
    });

    // Delete files from filesystem
    for (const file of filesToDelete) {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        // Delete thumbnail if exists
        if (file.thumbnailUrl) {
          const thumbnailPath = file.path.replace(/(\.[^.]+)$/, '_thumb$1');
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        }
      } catch (error) {
        console.warn(`Failed to delete file ${file.path}:`, error);
      }
    }

    // Delete from database
    const deleteResult = await prisma.mediaFile.deleteMany({
      where: {
        id: { in: fileIds },
        tenantId
      }
    });

    return { deletedCount: deleteResult.count };
  }

  async cleanupOrphanedFiles() {
    // This would be run as a scheduled job
    const mediaFiles = await prisma.mediaFile.findMany({
      select: { id: true, path: true }
    });

    const orphanedFiles = [];

    for (const file of mediaFiles) {
      if (!fs.existsSync(file.path)) {
        orphanedFiles.push(file.id);
      }
    }

    if (orphanedFiles.length > 0) {
      await prisma.mediaFile.deleteMany({
        where: { id: { in: orphanedFiles } }
      });
    }

    return {
      cleanedCount: orphanedFiles.length,
      orphanedFiles
    };
  }
}