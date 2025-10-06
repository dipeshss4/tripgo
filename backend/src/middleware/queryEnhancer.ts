import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface EnhancedQuery {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 'asc' | 'desc'>;
  filters: Record<string, any>;
  search?: string;
  include?: string[];
  select?: string[];
}

export interface QueryRequest extends Request {
  query: any;
  enhancedQuery: EnhancedQuery;
}

const querySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  sort: z.string().optional(),
  search: z.string().optional(),
  include: z.string().optional(),
  select: z.string().optional(),
  filter: z.string().optional(),
}).catchall(z.any());

export const queryEnhancer = (allowedSortFields: string[] = [], allowedFilterFields: string[] = []) => {
  return (req: QueryRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = querySchema.parse(req.query);

      const page = Math.max(1, parsed.page || 1);
      const limit = Math.min(100, Math.max(1, parsed.limit || 10));
      const skip = (page - 1) * limit;

      // Parse sorting
      let sort: Record<string, 'asc' | 'desc'> = {};
      if (parsed.sort) {
        const sortPairs = parsed.sort.split(',');
        for (const pair of sortPairs) {
          const [field, direction = 'asc'] = pair.split(':');
          if (allowedSortFields.length === 0 || allowedSortFields.includes(field)) {
            sort[field] = direction === 'desc' ? 'desc' : 'asc';
          }
        }
      }

      // Parse filters
      let filters: Record<string, any> = {};
      if (parsed.filter) {
        try {
          const filterObj = JSON.parse(parsed.filter);
          for (const [key, value] of Object.entries(filterObj)) {
            if (allowedFilterFields.length === 0 || allowedFilterFields.includes(key)) {
              // Handle different filter types
              if (typeof value === 'object' && value !== null) {
                filters[key] = value;
              } else {
                filters[key] = value;
              }
            }
          }
        } catch (e) {
          // If JSON parsing fails, treat as simple key-value filters
          for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'page' && key !== 'limit' && key !== 'sort' && key !== 'search' && key !== 'include' && key !== 'select') {
              if (allowedFilterFields.length === 0 || allowedFilterFields.includes(key)) {
                filters[key] = value;
              }
            }
          }
        }
      }

      // Parse includes
      const include = parsed.include ? parsed.include.split(',') : [];

      // Parse select fields
      const select = parsed.select ? parsed.select.split(',') : [];

      req.enhancedQuery = {
        page,
        limit,
        skip,
        sort,
        filters,
        search: parsed.search,
        include,
        select
      };

      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        error: error instanceof z.ZodError ? error.errors : 'Query validation failed'
      });
    }
  };
};

export const buildPrismaQuery = (enhancedQuery: EnhancedQuery, searchFields: string[] = []) => {
  const { skip, limit, sort, filters, search, include, select } = enhancedQuery;

  const query: any = {
    skip,
    take: limit,
  };

  // Add sorting
  if (Object.keys(sort).length > 0) {
    query.orderBy = Object.entries(sort).map(([field, direction]) => ({
      [field]: direction
    }));
  }

  // Add filters and search
  const where: any = {};

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle range filters
      if (typeof value === 'object' && !Array.isArray(value)) {
        where[key] = value;
      } else if (Array.isArray(value)) {
        where[key] = { in: value };
      } else {
        where[key] = value;
      }
    }
  });

  // Add search functionality
  if (search && searchFields.length > 0) {
    where.OR = searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }));
  }

  if (Object.keys(where).length > 0) {
    query.where = where;
  }

  // Add includes
  if (include.length > 0) {
    query.include = include.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  // Add select
  if (select.length > 0) {
    query.select = select.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  return query;
};

export const formatPaginatedResponse = (data: any[], total: number, enhancedQuery: EnhancedQuery) => {
  const { page, limit } = enhancedQuery;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};