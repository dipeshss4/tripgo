import api from './api'
import { ApiResponse } from '../types'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
  totalCruises: number
  activeCruises: number
  totalHotels: number
  activeHotels: number
  totalPackages: number
  activePackages: number
  conversionRate: number
  averageOrderValue: number
  topDestinations: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  recentBookings: Array<{
    id: string
    customerName: string
    service: string
    amount: number
    status: string
    createdAt: string
  }>
  monthlyGrowth: {
    users: number
    bookings: number
    revenue: number
  }
}

export interface AnalyticsData {
  period: 'week' | 'month' | 'quarter' | 'year'
  revenue: Array<{
    date: string
    amount: number
  }>
  bookings: Array<{
    date: string
    count: number
  }>
  users: Array<{
    date: string
    count: number
  }>
  topServices: Array<{
    name: string
    type: 'cruise' | 'hotel' | 'package'
    bookings: number
    revenue: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    percentage: number
  }>
  geographicData: Array<{
    country: string
    bookings: number
    revenue: number
  }>
}

export const dashboardService = {
  // Get comprehensive dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch dashboard statistics')
  },

  // Get analytics data for charts and reports
  getAnalytics: async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<AnalyticsData> => {
    const { data } = await api.get<ApiResponse<AnalyticsData>>(`/admin/analytics?period=${period}`)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch analytics data')
  },

  // Get real-time metrics
  getRealTimeMetrics: async (): Promise<{
    activeUsers: number
    onlineVisitors: number
    pendingBookings: number
    systemStatus: 'healthy' | 'warning' | 'critical'
    serverLoad: number
    responseTime: number
  }> => {
    const { data } = await api.get<ApiResponse<any>>('/admin/dashboard/realtime')

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to fetch real-time metrics')
  },

  // Generate custom report
  generateReport: async (params: {
    type: 'revenue' | 'bookings' | 'customers' | 'services'
    startDate: string
    endDate: string
    groupBy?: 'day' | 'week' | 'month'
    filters?: Record<string, any>
  }): Promise<any> => {
    const { data } = await api.post<ApiResponse<any>>('/admin/reports/generate', params)

    if (data.success && data.data) {
      return data.data
    }

    throw new Error(data.message || 'Failed to generate report')
  },

  // Export data
  exportData: async (params: {
    type: 'users' | 'bookings' | 'revenue' | 'services'
    format: 'csv' | 'excel' | 'pdf'
    startDate?: string
    endDate?: string
    filters?: Record<string, any>
  }): Promise<string> => {
    const { data } = await api.post<ApiResponse<{ downloadUrl: string }>>('/admin/export', params)

    if (data.success && data.data) {
      return data.data.downloadUrl
    }

    throw new Error(data.message || 'Failed to export data')
  },
}

export default dashboardService