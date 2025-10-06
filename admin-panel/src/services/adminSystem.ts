import api from './api'
import { ApiResponse } from '../types'

export interface SiteSetting {
  id: string
  key: string
  value: string
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'IMAGE' | 'VIDEO' | 'FILE'
  description?: string
  category?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string
  subdomain: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL'
  plan: 'FREE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE'
  settings?: any
  createdAt: string
  updatedAt: string
}

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  path: string
  url: string
  size: number
  mimetype: string
  category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'ARCHIVE' | 'OTHER'
  alt?: string
  title?: string
  description?: string
  tags: string[]
  folder?: string
  width?: number
  height?: number
  duration?: number
  thumbnailUrl?: string
  uploadedBy?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface SystemLog {
  id: string
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  message: string
  metadata?: any
  userId?: string
  tenantId?: string
  createdAt: string
}

export interface BackupInfo {
  id: string
  filename: string
  size: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  downloadUrl?: string
}

export interface ListResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  filter?: Record<string, any>
}

export const adminSystemService = {
  // Site Settings management
  settings: {
    getAll: async (): Promise<SiteSetting[]> => {
      const { data } = await api.get<ApiResponse<SiteSetting[]>>('/admin/system/settings')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch settings')
    },

    update: async (key: string, value: string): Promise<SiteSetting> => {
      const { data } = await api.put<ApiResponse<SiteSetting>>(`/admin/system/settings/${key}`, { value })

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update setting')
    },

    delete: async (key: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/system/settings/${key}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete setting')
      }
    },
  },

  // Tenant management
  tenants: {
    getAll: async (params?: ListParams): Promise<ListResponse<Tenant>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const { data } = await api.get<ApiResponse<ListResponse<Tenant>>>(
        `/admin/system/tenants?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch tenants')
    },

    getById: async (id: string): Promise<Tenant> => {
      const { data } = await api.get<ApiResponse<Tenant>>(`/admin/system/tenants/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch tenant')
    },

    create: async (tenantData: Partial<Tenant>): Promise<Tenant> => {
      const { data } = await api.post<ApiResponse<Tenant>>('/admin/system/tenants', tenantData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create tenant')
    },

    update: async (id: string, tenantData: Partial<Tenant>): Promise<Tenant> => {
      const { data } = await api.put<ApiResponse<Tenant>>(`/admin/system/tenants/${id}`, tenantData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update tenant')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/system/tenants/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete tenant')
      }
    },
  },

  // Media file management
  media: {
    getAll: async (params?: ListParams): Promise<ListResponse<MediaFile>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const { data } = await api.get<ApiResponse<ListResponse<MediaFile>>>(
        `/admin/system/media?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch media files')
    },

    upload: async (file: File, metadata?: Partial<MediaFile>): Promise<MediaFile> => {
      const formData = new FormData()
      formData.append('file', file)

      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
          }
        })
      }

      const { data } = await api.post<ApiResponse<MediaFile>>('/admin/system/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to upload file')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/system/media/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete media file')
      }
    },
  },

  // System maintenance
  backup: {
    create: async (): Promise<BackupInfo> => {
      const { data } = await api.post<ApiResponse<BackupInfo>>('/admin/system/backup')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create backup')
    },

    getHistory: async (): Promise<BackupInfo[]> => {
      const { data } = await api.get<ApiResponse<BackupInfo[]>>('/admin/system/backup')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch backup history')
    },
  },

  // System logs
  logs: {
    getAll: async (params?: ListParams & { level?: string }): Promise<ListResponse<SystemLog>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.level) queryParams.append('level', params.level)

      const { data } = await api.get<ApiResponse<ListResponse<SystemLog>>>(
        `/admin/system/logs?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch system logs')
    },
  },
}

export default adminSystemService