import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import TenantSelector from '../tenant/TenantSelector'
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const Header: React.FC = () => {
  const { user, tenant } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {tenant?.name} Admin Panel
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <TenantSelector />

        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Cog6ToothIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header