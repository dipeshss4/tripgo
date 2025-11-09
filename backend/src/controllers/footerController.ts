import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Get footer configuration (Public endpoint)
 */
export const getFooterConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || process.env.DEFAULT_TENANT_ID || 'default';

    const footerConfig = await prisma.footerConfig.findUnique({
      where: {
        tenantId,
        isActive: true
      },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            links: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!footerConfig) {
      return res.json({
        success: true,
        data: null,
        message: 'No footer configuration found'
      });
    }

    return res.json({
      success: true,
      data: footerConfig
    });

  } catch (error) {
    console.error('Get footer config error:', error);
    next(error);
  }
};

/**
 * Get or create footer configuration (Admin only)
 */
export const getOrCreateFooterConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || process.env.DEFAULT_TENANT_ID || 'default';

    let footerConfig = await prisma.footerConfig.findUnique({
      where: { tenantId },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
          include: {
            links: {
              orderBy: { displayOrder: 'asc' }
            }
          }
        }
      }
    });

    // Create default footer if it doesn't exist
    if (!footerConfig) {
      footerConfig = await prisma.footerConfig.create({
        data: {
          tenantId,
          companyName: 'TripGo',
          companyTagline: 'Your Journey, Our Passion',
          description: 'We specialize in creating unforgettable travel experiences through cruises, ships, hotels, and custom packages.',
          copyrightText: `© ${new Date().getFullYear()} TripGo. All rights reserved.`,
          email: 'info@tripgo.com',
          phone: '+1 (555) 123-4567',
          showNewsletter: true,
          newsletterTitle: 'Subscribe to Our Newsletter',
          newsletterText: 'Get the latest deals and travel tips delivered to your inbox.',
          sections: {
            create: [
              {
                title: 'Quick Links',
                displayOrder: 0,
                links: {
                  create: [
                    { label: 'Home', url: '/', displayOrder: 0 },
                    { label: 'Cruises', url: '/cruises', displayOrder: 1 },
                    { label: 'Ships', url: '/ships', displayOrder: 2 },
                    { label: 'Hotels', url: '/hotels', displayOrder: 3 },
                    { label: 'Packages', url: '/packages', displayOrder: 4 }
                  ]
                }
              },
              {
                title: 'Company',
                displayOrder: 1,
                links: {
                  create: [
                    { label: 'About Us', url: '/about', displayOrder: 0 },
                    { label: 'Contact', url: '/contact', displayOrder: 1 },
                    { label: 'Careers', url: '/careers', displayOrder: 2 },
                    { label: 'Blog', url: '/blog', displayOrder: 3 }
                  ]
                }
              },
              {
                title: 'Support',
                displayOrder: 2,
                links: {
                  create: [
                    { label: 'Help Center', url: '/help', displayOrder: 0 },
                    { label: 'FAQs', url: '/faq', displayOrder: 1 },
                    { label: 'Terms & Conditions', url: '/terms', displayOrder: 2 },
                    { label: 'Privacy Policy', url: '/privacy', displayOrder: 3 }
                  ]
                }
              }
            ]
          }
        },
        include: {
          sections: {
            orderBy: { displayOrder: 'asc' },
            include: {
              links: {
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      });
    }

    return res.json({
      success: true,
      data: footerConfig
    });

  } catch (error) {
    console.error('Get or create footer config error:', error);
    next(error);
  }
};

/**
 * Update footer configuration
 */
export const updateFooterConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || process.env.DEFAULT_TENANT_ID || 'default';
    const {
      companyName,
      companyTagline,
      description,
      logo,
      copyrightText,
      email,
      phone,
      address,
      facebook,
      twitter,
      instagram,
      linkedin,
      youtube,
      pinterest,
      showNewsletter,
      newsletterTitle,
      newsletterText,
      backgroundColor,
      textColor,
      accentColor,
      isActive
    } = req.body;

    const footerConfig = await prisma.footerConfig.update({
      where: { tenantId },
      data: {
        companyName,
        companyTagline,
        description,
        logo,
        copyrightText,
        email,
        phone,
        address,
        facebook,
        twitter,
        instagram,
        linkedin,
        youtube,
        pinterest,
        showNewsletter,
        newsletterTitle,
        newsletterText,
        backgroundColor,
        textColor,
        accentColor,
        isActive
      },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
          include: {
            links: {
              orderBy: { displayOrder: 'asc' }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      data: footerConfig,
      message: 'Footer configuration updated successfully'
    });

  } catch (error) {
    console.error('Update footer config error:', error);
    next(error);
  }
};

/**
 * Create footer section
 */
export const createFooterSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId || process.env.DEFAULT_TENANT_ID || 'default';
    const { title, displayOrder, isActive } = req.body;

    if (!title) {
      return next(createError('Section title is required', 400));
    }

    // Get footer config
    const footerConfig = await prisma.footerConfig.findUnique({
      where: { tenantId }
    });

    if (!footerConfig) {
      return next(createError('Footer configuration not found', 404));
    }

    const section = await prisma.footerSection.create({
      data: {
        title,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        footerConfigId: footerConfig.id
      },
      include: {
        links: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: section,
      message: 'Footer section created successfully'
    });

  } catch (error) {
    console.error('Create footer section error:', error);
    next(error);
  }
};

/**
 * Update footer section
 */
export const updateFooterSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, displayOrder, isActive } = req.body;

    const section = await prisma.footerSection.update({
      where: { id },
      data: {
        title,
        displayOrder,
        isActive
      },
      include: {
        links: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return res.json({
      success: true,
      data: section,
      message: 'Footer section updated successfully'
    });

  } catch (error) {
    console.error('Update footer section error:', error);
    next(error);
  }
};

/**
 * Delete footer section
 */
export const deleteFooterSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.footerSection.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Footer section deleted successfully'
    });

  } catch (error) {
    console.error('Delete footer section error:', error);
    next(error);
  }
};

/**
 * Create footer link
 */
export const createFooterLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;
    const { label, url, icon, openInNewTab, displayOrder, isActive } = req.body;

    if (!label || !url) {
      return next(createError('Label and URL are required', 400));
    }

    const link = await prisma.footerLink.create({
      data: {
        label,
        url,
        icon,
        openInNewTab: openInNewTab ?? false,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        sectionId
      }
    });

    return res.status(201).json({
      success: true,
      data: link,
      message: 'Footer link created successfully'
    });

  } catch (error) {
    console.error('Create footer link error:', error);
    next(error);
  }
};

/**
 * Update footer link
 */
export const updateFooterLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { label, url, icon, openInNewTab, displayOrder, isActive } = req.body;

    const link = await prisma.footerLink.update({
      where: { id },
      data: {
        label,
        url,
        icon,
        openInNewTab,
        displayOrder,
        isActive
      }
    });

    return res.json({
      success: true,
      data: link,
      message: 'Footer link updated successfully'
    });

  } catch (error) {
    console.error('Update footer link error:', error);
    next(error);
  }
};

/**
 * Delete footer link
 */
export const deleteFooterLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.footerLink.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Footer link deleted successfully'
    });

  } catch (error) {
    console.error('Delete footer link error:', error);
    next(error);
  }
};