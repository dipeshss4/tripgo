import api from './api'
import { ApiResponse } from '../types'

export interface Cruise {
  id: string
  name: string
  description: string
  image: string
  images: string[]
  rating: number
  price: number
  duration: number
  capacity: number
  available: boolean
  itinerary?: any
  amenities: string[]
  departure: string
  destination: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Hotel {
  id: string
  name: string
  description: string
  image: string
  images: string[]
  rating: number
  price: number
  location: string
  address: string
  city: string
  country: string
  amenities: string[]
  roomTypes: any[]
  available: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Package {
  id: string
  name: string
  description: string
  image: string
  images: string[]
  rating: number
  price: number
  duration: number
  destinations: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary?: any
  available: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
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

export const adminContentService = {
  // Cruise management
  cruises: {
    getAll: async (params?: ListParams): Promise<ListResponse<Cruise>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const { data } = await api.get<ApiResponse<ListResponse<Cruise>>>(
        `/admin/content/cruises?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch cruises')
    },

    getById: async (id: string): Promise<Cruise> => {
      const { data } = await api.get<ApiResponse<Cruise>>(`/admin/content/cruises/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch cruise')
    },

    create: async (cruiseData: Partial<Cruise>): Promise<Cruise> => {
      const { data } = await api.post<ApiResponse<Cruise>>('/admin/content/cruises', cruiseData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create cruise')
    },

    update: async (id: string, cruiseData: Partial<Cruise>): Promise<Cruise> => {
      const { data } = await api.put<ApiResponse<Cruise>>(`/admin/content/cruises/${id}`, cruiseData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update cruise')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/content/cruises/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete cruise')
      }
    },
  },

  // Hotel management
  hotels: {
    getAll: async (params?: ListParams): Promise<ListResponse<Hotel>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const { data } = await api.get<ApiResponse<ListResponse<Hotel>>>(
        `/admin/content/hotels?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch hotels')
    },

    getById: async (id: string): Promise<Hotel> => {
      const { data } = await api.get<ApiResponse<Hotel>>(`/admin/content/hotels/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch hotel')
    },

    create: async (hotelData: Partial<Hotel>): Promise<Hotel> => {
      const { data } = await api.post<ApiResponse<Hotel>>('/admin/content/hotels', hotelData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create hotel')
    },

    update: async (id: string, hotelData: Partial<Hotel>): Promise<Hotel> => {
      const { data } = await api.put<ApiResponse<Hotel>>(`/admin/content/hotels/${id}`, hotelData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update hotel')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/content/hotels/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete hotel')
      }
    },
  },

  // Package management
  packages: {
    getAll: async (params?: ListParams): Promise<ListResponse<Package>> => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)

      const { data } = await api.get<ApiResponse<ListResponse<Package>>>(
        `/admin/content/packages?${queryParams.toString()}`
      )

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch packages')
    },

    getById: async (id: string): Promise<Package> => {
      const { data } = await api.get<ApiResponse<Package>>(`/admin/content/packages/${id}`)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to fetch package')
    },

    create: async (packageData: Partial<Package>): Promise<Package> => {
      const { data } = await api.post<ApiResponse<Package>>('/admin/content/packages', packageData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to create package')
    },

    update: async (id: string, packageData: Partial<Package>): Promise<Package> => {
      const { data } = await api.put<ApiResponse<Package>>(`/admin/content/packages/${id}`, packageData)

      if (data.success && data.data) {
        return data.data
      }

      throw new Error(data.message || 'Failed to update package')
    },

    delete: async (id: string): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(`/admin/content/packages/${id}`)

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete package')
      }
    },
  },
}

export default adminContentService