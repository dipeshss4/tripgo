import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get hero settings for a specific page
export const getHeroSettings = async (req: Request, res: Response) => {
  try {
    const { page } = req.params;
    const tenantId = (req as any).tenantId || 'default';

    const heroSettings = await prisma.heroSettings.findFirst({
      where: {
        page,
        tenantId,
        isActive: true
      }
    });

    if (!heroSettings) {
      return res.status(404).json({
        success: false,
        message: `No hero settings found for page: ${page}`
      });
    }

    res.json({
      success: true,
      data: heroSettings
    });
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all hero settings
export const getAllHeroSettings = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || 'default';

    const heroSettings = await prisma.heroSettings.findMany({
      where: {
        tenantId
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    res.json({
      success: true,
      data: heroSettings
    });
  } catch (error) {
    console.error('Error fetching all hero settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create or update hero settings for a page
export const upsertHeroSettings = async (req: Request, res: Response) => {
  try {
    const { page } = req.params;
    const tenantId = (req as any).tenantId || 'default';
    const {
      videoUrl,
      videoType,
      videoFile,
      videoPoster,
      videoLoop,
      videoAutoplay,
      videoMuted,
      fallbackImage,
      overlayOpacity,
      overlayColor,
      title,
      subtitle,
      ctaText,
      ctaLink,
      isActive,
      displayOrder
    } = req.body;

    // Get tenant
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const heroSettings = await prisma.heroSettings.upsert({
      where: {
        page
      },
      update: {
        videoUrl,
        videoType,
        videoFile,
        videoPoster,
        videoLoop,
        videoAutoplay,
        videoMuted,
        fallbackImage,
        overlayOpacity,
        overlayColor,
        title,
        subtitle,
        ctaText,
        ctaLink,
        isActive,
        displayOrder
      },
      create: {
        page,
        videoUrl,
        videoType,
        videoFile,
        videoPoster,
        videoLoop,
        videoAutoplay,
        videoMuted,
        fallbackImage,
        overlayOpacity,
        overlayColor,
        title,
        subtitle,
        ctaText,
        ctaLink,
        isActive,
        displayOrder,
        tenantId: tenant.id
      }
    });

    res.json({
      success: true,
      data: heroSettings,
      message: 'Hero settings saved successfully'
    });
  } catch (error) {
    console.error('Error upserting hero settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save hero settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete hero settings for a page
export const deleteHeroSettings = async (req: Request, res: Response) => {
  try {
    const { page } = req.params;

    await prisma.heroSettings.delete({
      where: {
        page
      }
    });

    res.json({
      success: true,
      message: 'Hero settings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};