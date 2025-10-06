import { Request, Response, NextFunction } from 'express';
import { PrismaClient, SettingType } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { RoleAuthRequest } from '@/middleware/roleAuth';
import { ApiResponse } from '@/types';

const prisma = new PrismaClient();

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, isPublic } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, any[]>);

    const response: ApiResponse = {
      success: true,
      data: {
        settings,
        grouped: groupedSettings
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        type: true,
        category: true,
        label: true
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group by category for easy frontend consumption
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        type: setting.type,
        label: setting.label
      };
      return acc;
    }, {} as Record<string, any>);

    const response: ApiResponse = {
      success: true,
      data: groupedSettings
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const setting = await prisma.siteSetting.findUnique({
      where: { key }
    });

    if (!setting) {
      return next(createError('Setting not found', 404));
    }

    const response: ApiResponse = {
      success: true,
      data: setting
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createSetting = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      key,
      value,
      type = SettingType.TEXT,
      category = 'general',
      label,
      description,
      isPublic = false
    } = req.body;

    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key }
    });

    if (existingSetting) {
      return next(createError('Setting with this key already exists', 400));
    }

    const setting = await prisma.siteSetting.create({
      data: {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        type,
        category,
        label,
        description,
        isPublic
      }
    });

    const response: ApiResponse = {
      success: true,
      data: setting,
      message: 'Setting created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const {
      value,
      type,
      category,
      label,
      description,
      isPublic
    } = req.body;

    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return next(createError('Setting not found', 404));
    }

    const setting = await prisma.siteSetting.update({
      where: { key },
      data: {
        value: typeof value === 'string' ? value : JSON.stringify(value),
        ...(type && { type }),
        ...(category && { category }),
        ...(label && { label }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      }
    });

    const response: ApiResponse = {
      success: true,
      data: setting,
      message: 'Setting updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteSetting = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return next(createError('Setting not found', 404));
    }

    await prisma.siteSetting.delete({
      where: { key }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Setting deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return next(createError('Settings must be an array', 400));
    }

    const updatePromises = settings.map(async (setting: any) => {
      const { key, value, type, category, label, description, isPublic } = setting;

      return prisma.siteSetting.upsert({
        where: { key },
        update: {
          value: typeof value === 'string' ? value : JSON.stringify(value),
          ...(type && { type }),
          ...(category && { category }),
          ...(label && { label }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic })
        },
        create: {
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          type: type || SettingType.TEXT,
          category: category || 'general',
          label: label || key,
          description,
          isPublic: isPublic || false
        }
      });
    });

    const updatedSettings = await Promise.all(updatePromises);

    const response: ApiResponse = {
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Predefined setting categories and their default values
export const initializeDefaultSettings = async (req: RoleAuthRequest, res: Response, next: NextFunction) => {
  try {
    const defaultSettings = [
      // Site Information
      { key: 'site_name', value: 'TripGo', type: SettingType.TEXT, category: 'general', label: 'Site Name', isPublic: true },
      { key: 'site_description', value: 'Your premier travel booking platform', type: SettingType.TEXTAREA, category: 'general', label: 'Site Description', isPublic: true },
      { key: 'site_logo', value: '', type: SettingType.IMAGE, category: 'general', label: 'Site Logo', isPublic: true },
      { key: 'site_favicon', value: '', type: SettingType.IMAGE, category: 'general', label: 'Favicon', isPublic: true },
      { key: 'contact_email', value: 'contact@tripgo.com', type: SettingType.TEXT, category: 'contact', label: 'Contact Email', isPublic: true },
      { key: 'contact_phone', value: '+1-234-567-8900', type: SettingType.TEXT, category: 'contact', label: 'Contact Phone', isPublic: true },
      { key: 'contact_address', value: '123 Travel Street, Adventure City, AC 12345', type: SettingType.TEXTAREA, category: 'contact', label: 'Contact Address', isPublic: true },

      // Social Media
      { key: 'facebook_url', value: '', type: SettingType.TEXT, category: 'social', label: 'Facebook URL', isPublic: true },
      { key: 'twitter_url', value: '', type: SettingType.TEXT, category: 'social', label: 'Twitter URL', isPublic: true },
      { key: 'instagram_url', value: '', type: SettingType.TEXT, category: 'social', label: 'Instagram URL', isPublic: true },
      { key: 'linkedin_url', value: '', type: SettingType.TEXT, category: 'social', label: 'LinkedIn URL', isPublic: true },

      // Hero Section
      { key: 'hero_title', value: 'Discover Your Next Adventure', type: SettingType.TEXT, category: 'hero', label: 'Hero Title', isPublic: true },
      { key: 'hero_subtitle', value: 'Book amazing cruises, hotels, and travel packages', type: SettingType.TEXTAREA, category: 'hero', label: 'Hero Subtitle', isPublic: true },
      { key: 'hero_background_image', value: '', type: SettingType.IMAGE, category: 'hero', label: 'Hero Background Image', isPublic: true },
      { key: 'hero_background_video', value: '', type: SettingType.VIDEO, category: 'hero', label: 'Hero Background Video', isPublic: true },

      // Features
      { key: 'features_section_title', value: 'Why Choose TripGo?', type: SettingType.TEXT, category: 'features', label: 'Features Section Title', isPublic: true },
      { key: 'features_list', value: JSON.stringify([
        { title: 'Best Prices', description: 'Guaranteed lowest prices on all bookings', icon: 'price-tag' },
        { title: '24/7 Support', description: 'Round-the-clock customer support', icon: 'headset' },
        { title: 'Easy Booking', description: 'Simple and secure booking process', icon: 'booking' }
      ]), type: SettingType.JSON, category: 'features', label: 'Features List', isPublic: true },

      // Footer
      { key: 'footer_about', value: 'TripGo is your trusted partner for unforgettable travel experiences.', type: SettingType.TEXTAREA, category: 'footer', label: 'Footer About Text', isPublic: true },
      { key: 'footer_copyright', value: '© 2024 TripGo. All rights reserved.', type: SettingType.TEXT, category: 'footer', label: 'Footer Copyright', isPublic: true },

      // SEO
      { key: 'seo_title', value: 'TripGo - Book Your Dream Vacation', type: SettingType.TEXT, category: 'seo', label: 'SEO Title', isPublic: true },
      { key: 'seo_description', value: 'Discover amazing cruises, hotels, and travel packages with TripGo. Book your dream vacation today!', type: SettingType.TEXTAREA, category: 'seo', label: 'SEO Description', isPublic: true },
      { key: 'seo_keywords', value: 'travel, cruise, hotel, vacation, booking', type: SettingType.TEXT, category: 'seo', label: 'SEO Keywords', isPublic: true },

      // Business Settings
      { key: 'currency', value: 'USD', type: SettingType.TEXT, category: 'business', label: 'Default Currency', isPublic: true },
      { key: 'timezone', value: 'America/New_York', type: SettingType.TEXT, category: 'business', label: 'Default Timezone', isPublic: false },
      { key: 'booking_cancellation_hours', value: '24', type: SettingType.NUMBER, category: 'business', label: 'Cancellation Hours', isPublic: false },
      { key: 'commission_rate', value: '10', type: SettingType.NUMBER, category: 'business', label: 'Commission Rate (%)', isPublic: false },

      // Email Settings
      { key: 'email_from_name', value: 'TripGo Team', type: SettingType.TEXT, category: 'email', label: 'Email From Name', isPublic: false },
      { key: 'email_signature', value: 'Best regards,\nThe TripGo Team', type: SettingType.TEXTAREA, category: 'email', label: 'Email Signature', isPublic: false },

      // Maintenance
      { key: 'maintenance_mode', value: 'false', type: SettingType.BOOLEAN, category: 'maintenance', label: 'Maintenance Mode', isPublic: false },
      { key: 'maintenance_message', value: 'We are currently performing maintenance. Please check back soon!', type: SettingType.TEXTAREA, category: 'maintenance', label: 'Maintenance Message', isPublic: true }
    ];

    const createdSettings = [];

    for (const setting of defaultSettings) {
      const existing = await prisma.siteSetting.findUnique({
        where: { key: setting.key }
      });

      if (!existing) {
        const created = await prisma.siteSetting.create({
          data: setting
        });
        createdSettings.push(created);
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        created: createdSettings.length,
        settings: createdSettings
      },
      message: 'Default settings initialized successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};