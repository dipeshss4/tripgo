import api from './api'
import { Package, PackageItinerary, ApiResponse } from '../types'

export interface CreatePackageData {
  name: string
  description: string
  duration: number
  price: number
  images?: string[]
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: PackageItinerary[]
  isActive?: boolean
}

export interface UpdatePackageData {
  name?: string
  description?: string
  duration?: number
  price?: number
  images?: string[]
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: PackageItinerary[]
  isActive?: boolean
}

export interface PackagesQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  minDuration?: number
  maxDuration?: number
  minPrice?: number
  maxPrice?: number
}

export interface PackagesResponse {
  packages: Package[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const packagesService = {
  getPackages: async (query: PackagesQuery = {}): Promise<PackagesResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query.minDuration) params.append('minDuration', query.minDuration.toString())
    if (query.maxDuration) params.append('maxDuration', query.maxDuration.toString())
    if (query.minPrice) params.append('minPrice', query.minPrice.toString())
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString())

    const { data } = await api.get<ApiResponse<PackagesResponse>>(`/packages?${params}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch packages')
  },

  getPackage: async (id: string): Promise<Package> => {
    const { data } = await api.get<ApiResponse<Package>>(`/packages/${id}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch package')
  },

  createPackage: async (packageData: CreatePackageData): Promise<Package> => {
    const { data } = await api.post<ApiResponse<Package>>('/packages', packageData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to create package')
  },

  updatePackage: async (id: string, packageData: UpdatePackageData): Promise<Package> => {
    const { data } = await api.put<ApiResponse<Package>>(`/packages/${id}`, packageData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to update package')
  },

  deletePackage: async (id: string): Promise<void> => {
    const { data } = await api.delete<ApiResponse>(`/packages/${id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete package')
    }
  },

  togglePackageStatus: async (id: string): Promise<Package> => {
    const { data } = await api.patch<ApiResponse<Package>>(`/packages/${id}/toggle-status`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to toggle package status')
  },
}