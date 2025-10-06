import api from './api'
import { Cruise, CruiseItinerary, ApiResponse } from '../types'

export interface CreateCruiseData {
  name: string
  description: string
  departure: string
  destination: string
  duration: number
  capacity: number
  price: number
  images?: string[]
  amenities?: string[]
  itinerary?: CruiseItinerary[]
  isActive?: boolean
}

export interface UpdateCruiseData {
  name?: string
  description?: string
  departure?: string
  destination?: string
  duration?: number
  capacity?: number
  price?: number
  images?: string[]
  amenities?: string[]
  itinerary?: CruiseItinerary[]
  isActive?: boolean
}

export interface CruisesQuery {
  page?: number
  limit?: number
  search?: string
  departure?: string
  destination?: string
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface CruisesResponse {
  cruises: Cruise[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const cruisesService = {
  getCruises: async (query: CruisesQuery = {}): Promise<CruisesResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)
    if (query.departure) params.append('departure', query.departure)
    if (query.destination) params.append('destination', query.destination)
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query.minPrice) params.append('minPrice', query.minPrice.toString())
    if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString())

    const { data } = await api.get<ApiResponse<CruisesResponse>>(`/cruises?${params}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch cruises')
  },

  getCruise: async (id: string): Promise<Cruise> => {
    const { data } = await api.get<ApiResponse<Cruise>>(`/cruises/${id}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch cruise')
  },

  createCruise: async (cruiseData: CreateCruiseData): Promise<Cruise> => {
    const { data } = await api.post<ApiResponse<Cruise>>('/cruises', cruiseData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to create cruise')
  },

  updateCruise: async (id: string, cruiseData: UpdateCruiseData): Promise<Cruise> => {
    const { data } = await api.put<ApiResponse<Cruise>>(`/cruises/${id}`, cruiseData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to update cruise')
  },

  deleteCruise: async (id: string): Promise<void> => {
    const { data } = await api.delete<ApiResponse>(`/cruises/${id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete cruise')
    }
  },

  toggleCruiseStatus: async (id: string): Promise<Cruise> => {
    const { data } = await api.patch<ApiResponse<Cruise>>(`/cruises/${id}/toggle-status`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to toggle cruise status')
  },

  duplicateCruise: async (id: string): Promise<Cruise> => {
    const { data } = await api.post<ApiResponse<Cruise>>(`/cruises/${id}/duplicate`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to duplicate cruise')
  },
}