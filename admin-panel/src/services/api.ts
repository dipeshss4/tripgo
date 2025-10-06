import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Check if demo mode is enabled
export const isDemoMode = () => {
  return localStorage.getItem('demoMode') === 'true'
}

api.interceptors.request.use(
  (config) => {
    // Skip API calls in demo mode
    if (isDemoMode()) {
      return config
    }

    const token = localStorage.getItem('authToken')
    const tenantId = localStorage.getItem('tenantId')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Don't show errors in demo mode
    if (isDemoMode()) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('tenant')
      localStorage.removeItem('tenantId')
      window.location.href = '/login'
    }

    const message = error.response?.data?.message || error.message || 'An error occurred'
    toast.error(message)

    return Promise.reject(error)
  }
)

export default api