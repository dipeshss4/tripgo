import api from './api';

export interface CruiseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cruises: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const cruiseCategoryService = {
  async getCategories(query: CategoriesQuery = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());

    const response = await api.get(`/cruise-categories?${params.toString()}`);
    return response.data.data;
  },

  async getCategory(id: string) {
    const response = await api.get(`/cruise-categories/${id}`);
    return response.data.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await api.get(`/cruise-categories/slug/${slug}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryData) {
    const response = await api.post('/cruise-categories', data);
    return response.data.data;
  },

  async updateCategory(id: string, data: UpdateCategoryData) {
    const response = await api.put(`/cruise-categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string) {
    const response = await api.delete(`/cruise-categories/${id}`);
    return response.data;
  },

  async toggleCategoryStatus(id: string) {
    const response = await api.patch(`/cruise-categories/${id}/toggle-status`);
    return response.data.data;
  },
};