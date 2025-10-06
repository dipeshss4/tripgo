import api from './api'
import { ApiResponse } from '../types'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'
  isActive: boolean
  avatar?: string
  phone?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  userId: string
  type: 'CRUISE' | 'HOTEL' | 'PACKAGE'
  itemId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalAmount: number
  bookingDate: string
  checkIn: string
  checkOut: string
  guests: number
  notes?: string
  tenantId: string
  createdAt: string
  updatedAt: string
  user: User
}

export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  monthlyRevenue: number
  recentBookings: Booking[]
  userGrowth: Array<{
    date: string
    count: number
  }>
  bookingTrends: Array<{
    date: string
    bookings: number
    revenue: number
  }>
  topServices: Array<{
    name: string
    type: string
    bookings: number
  }>
}

export interface AnalyticsParams {
  period?: 'week' | 'month' | 'quarter' | 'year'
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
  type?: 'revenue' | 'bookings' | 'users'
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

export const adminService = {
  // Dashboard and Analytics
  dashboard: {
    getStats: async (): Promise<AdminDashboardStats> => {
      const { data } = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch dashboard statistics')
    },

    getAnalytics: async (params: AnalyticsParams = {}): Promise<any> => {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      const { data } = await api.get<ApiResponse<any>>(`/admin/analytics?${queryParams.toString()}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch analytics')
    },
  },

  // User Management
  users: {
    getAll: async (params: ListParams = {}): Promise<ListResponse<User>> => {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const { data } = await api.get<ApiResponse<ListResponse<User>>>(
        `/admin/users?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch users')
    },

    getById: async (id: string): Promise<User> => {
      const { data } = await api.get<ApiResponse<User>>(`/admin/users/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch user')
    },

    create: async (userData: Partial<User>): Promise<User> => {
      const { data } = await api.post<ApiResponse<User>>('/admin/users', userData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create user')
    },

    update: async (id: string, userData: Partial<User>): Promise<User> => {
      const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}`, userData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update user')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/users/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete user')
      }
    },

    updateStatus: async (id: string, isActive: boolean): Promise<User> => {
      const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { isActive })

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update user status')
    },
  },

  // Booking Management
  bookings: {
    getAll: async (params: ListParams = {}): Promise<ListResponse<Booking>> => {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const { data } = await api.get<ApiResponse<ListResponse<Booking>>>(
        `/admin/bookings?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch bookings')
    },

    getById: async (id: string): Promise<Booking> => {
      const { data } = await api.get<ApiResponse<Booking>>(`/admin/bookings/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch booking')
    },

    updateStatus: async (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): Promise<Booking> => {
      const { data } = await api.patch<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, { status })

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update booking status')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/bookings/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete booking')
      }
    },
  },

  // Reports and Export
  reports: {
    generate: async (params: {
      type: 'revenue' | 'bookings' | 'users' | 'services'
      startDate: string
      endDate: string
      format?: 'json' | 'csv' | 'excel'
      filters?: Record<string, any>
    }): Promise<any> => {
      const { data } = await api.post<ApiResponse<any>>('/admin/reports/generate', params)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to generate report')
    },

    export: async (params: {
      type: 'users' | 'bookings' | 'revenue'
      format: 'csv' | 'excel' | 'pdf'
      startDate?: string
      endDate?: string
    }): Promise<string> => {
      const { data } = await api.post<ApiResponse<{ downloadUrl: string }>>('/admin/export', params)

      if (data.success && data.data) {
        return data.data.downloadUrl
      }

      throw new Error(data.message || 'Failed to export data')
    },
  },

  // System Monitoring
  system: {
    getHealthCheck: async (): Promise<{
      status: 'healthy' | 'warning' | 'critical'
      services: Record<string, 'up' | 'down' | 'degraded'>
      metrics: {
        uptime: number
        memoryUsage: number
        cpuUsage: number
        dbConnections: number
      }
    }> => {
      const { data } = await api.get<ApiResponse<any>>('/admin/system/health')

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch system health')
    },

    getAuditLogs: async (params: ListParams = {}): Promise<ListResponse<any>> => {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const { data } = await api.get<ApiResponse<ListResponse<any>>>(
        `/admin/audit-logs?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch audit logs')
    },
  },
}

export default adminService