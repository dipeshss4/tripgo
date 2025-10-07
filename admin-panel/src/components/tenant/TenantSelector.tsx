import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const TenantSelector: React.FC = () => {
  const { tenant, user, switchTenant } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // In a real implementation, you would fetch available tenants for the user
  const availableTenants = [
    { id: 'main', name: 'TripGo Main', subdomain: 'main' },
    { id: 'cruises', name: 'TripGo Cruises', subdomain: 'cruises' },
    { id: 'hotels', name: 'TripGo Hotels', subdomain: 'hotels' },
  ]

  const handleTenantSwitch = async (tenantSubdomain: string) => {
    if (tenant?.subdomain === tenantSubdomain) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      await switchTenant(tenantSubdomain)
      toast.success(`Switched to ${tenantSubdomain} tenant`)
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch tenant')
    } finally {
      setIsLoading(false)
    }
  }

  if (!tenant) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
          <div className="text-xs text-gray-500">{tenant.subdomain}</div>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Switch Tenant
            </p>
          </div>
          {availableTenants.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTenantSwitch(t.subdomain)}
              disabled={isLoading}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tenant.subdomain === t.subdomain ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
              }`}
            >
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">{t.subdomain}.tripgo.local</div>
              {tenant.subdomain === t.subdomain && (
                <div className="text-xs text-primary-600 mt-1">Current tenant</div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default TenantSelector