import api from './api'
import { Booking, ApiResponse } from '../types'

export interface CreateBookingData {
  userId: string
  type: 'CRUISE' | 'HOTEL' | 'PACKAGE'
  itemId: string
  totalAmount: number
  bookingDate: string
  checkIn: string
  checkOut: string
  guests: number
}

export interface UpdateBookingData {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalAmount?: number
  checkIn?: string
  checkOut?: string
  guests?: number
}

export interface BookingsQuery {
  page?: number
  limit?: number
  search?: string
  type?: string
  status?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export interface BookingsResponse {
  bookings: Booking[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const bookingsService = {
  getBookings: async (query: BookingsQuery = {}): Promise<BookingsResponse> => {
    const params = new URLSearchParams()
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.search) params.append('search', query.search)
    if (query.type) params.append('type', query.type)
    if (query.status) params.append('status', query.status)
    if (query.userId) params.append('userId', query.userId)
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)

    const { data } = await api.get<ApiResponse<BookingsResponse>>(`/bookings?${params}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch bookings')
  },

  getBooking: async (id: string): Promise<Booking> => {
    const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch booking')
  },

  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const { data } = await api.post<ApiResponse<Booking>>('/bookings', bookingData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to create booking')
  },

  updateBooking: async (id: string, bookingData: UpdateBookingData): Promise<Booking> => {
    const { data } = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, bookingData)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to update booking')
  },

  deleteBooking: async (id: string): Promise<void> => {
    const { data } = await api.delete<ApiResponse>(`/bookings/${id}`)

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete booking')
    }
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to cancel booking')
  },

  confirmBooking: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/confirm`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to confirm booking')
  },

  completeBooking: async (id: string): Promise<Booking> => {
    const { data } = await api.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to complete booking')
  },
}