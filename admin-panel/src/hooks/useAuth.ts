import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const navigate = useNavigate()
  const {
    user,
    tenant,
    isAuthenticated,
    isLoading,
    login,
    logout,
    initializeAuth,
    switchTenant,
  } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const handleLogin = async (email: string, password: string, tenantSubdomain?: string) => {
    await login(email, password, tenantSubdomain)
    navigate('/overview')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const isAdmin = (): boolean => {
    return hasRole(['SUPER_ADMIN', 'ADMIN'])
  }

  const isHR = (): boolean => {
    return hasRole(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'])
  }

  const isSuperAdmin = (): boolean => {
    return hasRole('SUPER_ADMIN')
  }

  const handleSwitchTenant = async (tenantSubdomain: string) => {
    await switchTenant(tenantSubdomain)
    // Refresh the page to ensure all components reload with new tenant context
    window.location.reload()
  }

  return {
    user,
    tenant,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    switchTenant: handleSwitchTenant,
    hasRole,
    isAdmin,
    isHR,
    isSuperAdmin,
  }
}