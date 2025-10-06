import api from './api'
import { User, ApiResponse } from '../types'

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE' | 'CUSTOMER'
  isActive?: boolean
}

export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  role?: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE' | 'CUSTOMER'
  isActive?: boolean
}

export interface UsersQuery {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
}

export interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const usersService = {
  getUsers: async (query: UsersQuery = {}): Promise<UsersResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)
    if (query.role) params.append('role', query.role)
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())

    const { data } = await api.get<ApiResponse<UsersResponse>>(`/users?${params}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch users')
  },

  getUser: async (id: string): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch user')
  },

  createUser: async (userData: CreateUserData): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>('/users', userData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to create user')
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, userData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to update user')
  },

  deleteUser: async (id: string): Promise<void> => {
    const { data } = await api.delete<ApiResponse>(`/users/${id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete user')
    }
  },

  bulkDeleteUsers: async (ids: string[]): Promise<void> => {
    const { data } = await api.delete<ApiResponse>('/users/bulk', { data: { ids } })

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete users')
    }
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to toggle user status')
  },
}