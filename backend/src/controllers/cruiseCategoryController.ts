import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cruiseCategoryController = {
  // Get all cruise categories
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { page = 1, limit = 10, search, isActive } = req.query;

      const where: any = { tenantId };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const [categories, total] = await Promise.all([
        prisma.cruiseCategory.findMany({
          where,
          include: {
            _count: {
              select: { cruises: true },
            },
          },
          orderBy: [
            { displayOrder: 'asc' },
            { name: 'asc' },
          ],
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.cruiseCategory.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          categories,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error('Get cruise categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cruise categories',
        error: error.message,
      });
    }
  },

  // Get single cruise category
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const category = await prisma.cruiseCategory.findFirst({
        where: { id, tenantId },
        include: {
          cruises: {
            where: { isActive: true },
            include: {
              _count: {
                select: { departures: true },
              },
            },
          },
          _count: {
            select: { cruises: true },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Cruise category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Get cruise category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cruise category',
        error: error.message,
      });
    }
  },

  // Get category by slug
  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = (req as any).tenantId;

      const category = await prisma.cruiseCategory.findFirst({
        where: { slug, tenantId },
        include: {
          cruises: {
            where: { isActive: true },
            include: {
              departures: {
                where: {
                  departureDate: {
                    gte: new Date(),
                  },
                },
                orderBy: {
                  departureDate: 'asc',
                },
                take: 5,
              },
            },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Cruise category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Get cruise category by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cruise category',
        error: error.message,
      });
    }
  },

  // Create cruise category
  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { name, description, image, icon, displayOrder, isActive } = req.body;

      // Generate slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Check if slug already exists
      const existing = await prisma.cruiseCategory.findUnique({
        where: { slug },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists',
        });
      }

      const category = await prisma.cruiseCategory.create({
        data: {
          name,
          slug,
          description,
          image,
          icon,
          displayOrder: displayOrder || 0,
          isActive: isActive !== undefined ? isActive : true,
          tenantId,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Cruise category created successfully',
        data: category,
      });
    } catch (error: any) {
      console.error('Create cruise category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create cruise category',
        error: error.message,
      });
    }
  },

  // Update cruise category
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;
      const { name, description, image, icon, displayOrder, isActive } = req.body;

      const existing = await prisma.cruiseCategory.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Cruise category not found',
        });
      }

      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (icon !== undefined) updateData.icon = icon;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      if (isActive !== undefined) updateData.isActive = isActive;

      const category = await prisma.cruiseCategory.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Cruise category updated successfully',
        data: category,
      });
    } catch (error: any) {
      console.error('Update cruise category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cruise category',
        error: error.message,
      });
    }
  },

  // Delete cruise category
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const existing = await prisma.cruiseCategory.findFirst({
        where: { id, tenantId },
        include: {
          _count: {
            select: { cruises: true },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Cruise category not found',
        });
      }

      if (existing._count.cruises > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${existing._count.cruises} cruises. Please reassign or delete the cruises first.`,
        });
      }

      await prisma.cruiseCategory.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Cruise category deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete cruise category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete cruise category',
        error: error.message,
      });
    }
  },

  // Toggle category status
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const existing = await prisma.cruiseCategory.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Cruise category not found',
        });
      }

      const category = await prisma.cruiseCategory.update({
        where: { id },
        data: {
          isActive: !existing.isActive,
        },
      });

      res.json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        data: category,
      });
    } catch (error: any) {
      console.error('Toggle category status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle category status',
        error: error.message,
      });
    }
  },
};