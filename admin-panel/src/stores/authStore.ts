import { create } from 'zustand'
import { User, Tenant } from '../types'
import { authService } from '../services/auth'

interface AuthState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string, tenantSubdomain?: string) => Promise<void>
  logout: () => void
  initializeAuth: () => void
  switchTenant: (tenantSubdomain: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setTenant: (tenant) =>
    set({ tenant }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  login: async (email, password, tenantSubdomain) => {
    set({ isLoading: true })
    try {
      const authResponse = await authService.login({
        email,
        password,
        tenantSubdomain,
      })

      set({
        user: authResponse.user,
        tenant: authResponse.tenant,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  initializeAuth: () => {
    // Clean up any corrupted localStorage data
    const cleanupCorruptedData = () => {
      const items = ['user', 'tenant', 'authToken', 'tenantId']
      items.forEach(item => {
        const value = localStorage.getItem(item)
        if (value === 'undefined' || value === 'null') {
          localStorage.removeItem(item)
        }
      })
    }

    cleanupCorruptedData()

    const token = authService.getStoredToken()
    const user = authService.getStoredUser()
    const tenant = authService.getStoredTenant()
    const isDemoMode = localStorage.getItem('demoMode') === 'true'

    if ((token && user) || isDemoMode) {
      set({
        user,
        tenant,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({
        user: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  switchTenant: async (tenantSubdomain: string) => {
    set({ isLoading: true })
    try {
      const authResponse = await authService.switchTenant(tenantSubdomain)

      set({
        user: authResponse.user,
        tenant: authResponse.tenant,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
}))