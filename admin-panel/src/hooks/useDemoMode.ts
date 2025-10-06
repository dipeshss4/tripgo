import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

// Demo user data
const demoUser = {
  id: 'demo-user-1',
  email: 'admin@demo.tripgo.com',
  firstName: 'Demo',
  lastName: 'Admin',
  role: 'ADMIN' as const,
  isActive: true,
  tenantId: 'demo-tenant-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Demo tenant data
const demoTenant = {
  id: 'demo-tenant-1',
  name: 'TripGo Demo',
  subdomain: 'demo',
  plan: 'PREMIUM' as const,
  isActive: true,
  settings: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useDemoMode = () => {
  const { setUser, setTenant, setLoading } = useAuthStore()

  const enableDemoMode = () => {
    // Set demo user and tenant
    setUser(demoUser)
    setTenant(demoTenant)
    setLoading(false)

    // Store in localStorage for persistence
    localStorage.setItem('authToken', 'demo-token-123')
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('tenant', JSON.stringify(demoTenant))
    localStorage.setItem('tenantId', demoTenant.id)
    localStorage.setItem('demoMode', 'true')
  }

  const isDemoMode = () => {
    return localStorage.getItem('demoMode') === 'true'
  }

  const disableDemoMode = () => {
    localStorage.removeItem('demoMode')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    localStorage.removeItem('tenantId')
    setUser(null)
    setTenant(null)
  }

  return {
    enableDemoMode,
    disableDemoMode,
    isDemoMode,
  }
}