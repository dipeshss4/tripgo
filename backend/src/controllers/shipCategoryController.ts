import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const shipCategoryController = {
  // Get all ship categories
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
        prisma.shipCategory.findMany({
          where,
          include: {
            _count: {
              select: { ships: true },
            },
          },
          orderBy: [
            { displayOrder: 'asc' },
            { name: 'asc' },
          ],
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.shipCategory.count({ where }),
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
      console.error('Get ship categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ship categories',
        error: error.message,
      });
    }
  },

  // Get single ship category
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const category = await prisma.shipCategory.findFirst({
        where: { id, tenantId },
        include: {
          ships: {
            where: { isActive: true },
            include: {
              _count: {
                select: { departures: true },
              },
            },
          },
          _count: {
            select: { ships: true },
          },
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Ship category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Get ship category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ship category',
        error: error.message,
      });
    }
  },

  // Get category by slug
  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const tenantId = (req as any).tenantId;

      const category = await prisma.shipCategory.findFirst({
        where: { slug, tenantId },
        include: {
          ships: {
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
          message: 'Ship category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('Get ship category by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ship category',
        error: error.message,
      });
    }
  },

  // Create ship category
  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).tenantId;
      const { name, description, image, icon, displayOrder, isActive } = req.body;

      // Generate slug from name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Check if slug already exists
      const existing = await prisma.shipCategory.findUnique({
        where: { slug },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists',
        });
      }

      const category = await prisma.shipCategory.create({
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
        message: 'Ship category created successfully',
        data: category,
      });
    } catch (error: any) {
      console.error('Create ship category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create ship category',
        error: error.message,
      });
    }
  },

  // Update ship category
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;
      const { name, description, image, icon, displayOrder, isActive } = req.body;

      const existing = await prisma.shipCategory.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Ship category not found',
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

      const category = await prisma.shipCategory.update({
        where: { id },
        data: updateData,
      });

      res.json({
        success: true,
        message: 'Ship category updated successfully',
        data: category,
      });
    } catch (error: any) {
      console.error('Update ship category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ship category',
        error: error.message,
      });
    }
  },

  // Delete ship category
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const existing = await prisma.shipCategory.findFirst({
        where: { id, tenantId },
        include: {
          _count: {
            select: { ships: true },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Ship category not found',
        });
      }

      if (existing._count.ships > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${existing._count.ships} ships. Please reassign or delete the ships first.`,
        });
      }

      await prisma.shipCategory.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Ship category deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete ship category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ship category',
        error: error.message,
      });
    }
  },

  // Toggle category status
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = (req as any).tenantId;

      const existing = await prisma.shipCategory.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Ship category not found',
        });
      }

      const category = await prisma.shipCategory.update({
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