import api from './api'
import { AuthResponse, LoginCredentials, User, ApiResponse } from '../types'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<{ token: string; admin: any; tenant?: any }>>('/admin/auth/login', credentials)

    if (data.success && data.data) {
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.admin))
      if (data.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(data.data.tenant))
        localStorage.setItem('tenantId', data.data.tenant.id)
      }
      return {
        token: data.data.token,
        user: data.data.admin,
        tenant: data.data.tenant
      }
    }

    throw new Error(data.message || 'Login failed')
  },

  // Admin-specific login
  adminLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/admin/auth/login', credentials)

    if (data.success && data.data) {
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      if (data.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(data.data.tenant))
        localStorage.setItem('tenantId', data.data.tenant.id)
      }
      return data.data
    }

    throw new Error(data.message || 'Admin login failed')
  },

  // Setup admin account
  setupAdmin: async (setupData: any): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/admin/auth/setup', setupData)

    if (data.success && data.data) {
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      if (data.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(data.data.tenant))
        localStorage.setItem('tenantId', data.data.tenant.id)
      }
      return data.data
    }

    throw new Error(data.message || 'Admin setup failed')
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    localStorage.removeItem('tenantId')
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to get current user')
  },

  refreshToken: async (): Promise<string> => {
    const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/refresh')

    if (data.success && data.data) {
      localStorage.setItem('authToken', data.data.token)
      return data.data.token
    }

    throw new Error(data.message || 'Failed to refresh token')
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const { data } = await api.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    })

    if (!data.success) {
      throw new Error(data.message || 'Failed to change password')
    }
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null
    }
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.warn('Failed to parse user data from localStorage:', error)
      return null
    }
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken')
  },

  getStoredTenant: (): any | null => {
    const tenantStr = localStorage.getItem('tenant')
    if (!tenantStr || tenantStr === 'undefined' || tenantStr === 'null') {
      return null
    }
    try {
      return JSON.parse(tenantStr)
    } catch (error) {
      console.warn('Failed to parse tenant data from localStorage:', error)
      return null
    }
  },

  switchTenant: async (tenantSubdomain: string): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/switch-tenant', {
      tenantSubdomain,
    })

    if (data.success && data.data) {
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      if (data.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(data.data.tenant))
        localStorage.setItem('tenantId', data.data.tenant.id)
      }
      return data.data
    }

    throw new Error(data.message || 'Failed to switch tenant')
  },
}