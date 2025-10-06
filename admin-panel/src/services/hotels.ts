import api from './api'
import { Hotel, HotelRoom, ApiResponse } from '../types'

export interface CreateHotelData {
  name: string
  description: string
  location: string
  address: string
  city: string
  country: string
  rating: number
  price: number
  images?: string[]
  amenities?: string[]
  rooms?: HotelRoom[]
  isActive?: boolean
}

export interface UpdateHotelData {
  name?: string
  description?: string
  location?: string
  address?: string
  city?: string
  country?: string
  rating?: number
  price?: number
  images?: string[]
  amenities?: string[]
  rooms?: HotelRoom[]
  isActive?: boolean
}

export interface HotelsQuery {
  page?: number
  limit?: number
  search?: string
  city?: string
  country?: string
  isActive?: boolean
  minRating?: number
  maxRating?: number
  minPrice?: number
  maxPrice?: number
}

export interface HotelsResponse {
  hotels: Hotel[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const hotelsService = {
  getHotels: async (query: HotelsQuery = {}): Promise<HotelsResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)
    if (query.city) params.append('city', query.city)
    if (query.country) params.append('country', query.country)
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query.minRating) params.append('minRating', query.minRating.toString())
    if (query.maxRating) params.append('maxRating', query.maxRating.toString())
    if (query.minPrice) params.append('minPrice', query.minPrice.toString())
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString())

    const { data } = await api.get<ApiResponse<HotelsResponse>>(`/hotels?${params}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch hotels')
  },

  getHotel: async (id: string): Promise<Hotel> => {
    const { data } = await api.get<ApiResponse<Hotel>>(`/hotels/${id}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch hotel')
  },

  createHotel: async (hotelData: CreateHotelData): Promise<Hotel> => {
    const { data } = await api.post<ApiResponse<Hotel>>('/hotels', hotelData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to create hotel')
  },

  updateHotel: async (id: string, hotelData: UpdateHotelData): Promise<Hotel> => {
    const { data } = await api.put<ApiResponse<Hotel>>(`/hotels/${id}`, hotelData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to update hotel')
  },

  deleteHotel: async (id: string): Promise<void> => {
    const { data } = await api.delete<ApiResponse>(`/hotels/${id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete hotel')
    }
  },

  toggleHotelStatus: async (id: string): Promise<Hotel> => {
    const { data } = await api.patch<ApiResponse<Hotel>>(`/hotels/${id}/toggle-status`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to toggle hotel status')
  },
}