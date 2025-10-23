import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AuthRequest } from '@/middleware/auth';

const prisma = new PrismaClient();

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get all blogs (public - only published)
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      category,
      tag,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { published: true };

    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }

    if (tag) {
      where.tags = { has: tag as string };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.blog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all blogs for admin (includes unpublished)
export const getAllBlogsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '10',
      published,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (published !== undefined) {
      where.published = published === 'true';
    }

    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.blog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single blog by slug
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          where: { approved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!blog) {
      throw createError('Blog not found', 404);
    }

    // Only allow unpublished blogs to be viewed by authenticated users (admins)
    if (!blog.published) {
      throw createError('Blog not found', 404);
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// Get single blog by ID (admin)
export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!blog) {
      throw createError('Blog not found', 404);
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// Create blog
export const createBlog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, excerpt, featuredImage, category, tags, published } = req.body;

    if (!title || !content) {
      throw createError('Title and content are required', 400);
    }

    if (!req.userId || !req.tenantId) {
      throw createError('Authentication required', 401);
    }

    const slug = generateSlug(title);

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug }
    });

    if (existingBlog) {
      throw createError('A blog with this title already exists', 400);
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        category,
        tags: tags || [],
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: req.userId,
        tenantId: req.tenantId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// Update blog
export const updateBlog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featuredImage, category, tags, published } = req.body;

    const existingBlog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!existingBlog) {
      throw createError('Blog not found', 404);
    }

    let slug = existingBlog.slug;

    // If title changed, generate new slug
    if (title && title !== existingBlog.title) {
      slug = generateSlug(title);

      // Check if new slug already exists
      const slugExists = await prisma.blog.findUnique({
        where: { slug }
      });

      if (slugExists && slugExists.id !== id) {
        throw createError('A blog with this title already exists', 400);
      }
    }

    const updateData: any = {
      ...(title && { title, slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags })
    };

    // Handle publish status
    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingBlog.published) {
        updateData.publishedAt = new Date();
      } else if (!published) {
        updateData.publishedAt = null;
      }
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog
export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blog) {
      throw createError('Blog not found', 404);
    }

    await prisma.blog.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add comment to blog
export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw createError('Comment content is required', 400);
    }

    if (!req.userId) {
      throw createError('Authentication required', 401);
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId }
    });

    if (!blog || !blog.published) {
      throw createError('Blog not found', 404);
    }

    const comment = await prisma.blogComment.create({
      data: {
        content,
        userId: req.userId,
        blogId,
        approved: false // Requires moderation
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Get all comments for admin
export const getAllComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      approved,
      blogId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (approved !== undefined) {
      where.approved = approved === 'true';
    }

    if (blogId) {
      where.blogId = blogId as string;
    }

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              email: true
            }
          },
          blog: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      }),
      prisma.blogComment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Approve/reject comment
export const moderateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      throw createError('Approved status must be a boolean', 400);
    }

    const comment = await prisma.blogComment.update({
      where: { id },
      data: { approved },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.blogComment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get blog categories (unique categories from all published blogs)
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        published: true,
        category: { not: null }
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categories = blogs
      .map(blog => blog.category)
      .filter((category): category is string => category !== null);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Get popular tags
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      select: { tags: true }
    });

    const tagCount: Record<string, number> = {};

    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};
