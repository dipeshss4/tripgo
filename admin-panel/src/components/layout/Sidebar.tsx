import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon,
  CameraIcon,
  MapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  ServerIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  CommandLineIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'

const Sidebar: React.FC = () => {
  const { user, tenant, logout, isAdmin, isHR } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigationItems = [
    {
      name: 'Overview',
      href: '/overview',
      icon: ChartPieIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: ClipboardDocumentListIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Cruises',
      href: '/cruises',
      icon: MapIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Hotels',
      href: '/hotels',
      icon: BuildingOfficeIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: DocumentTextIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Content Management',
      href: '/content',
      icon: FolderIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'Blog',
      href: '/blog',
      icon: PencilSquareIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'HR Management',
      href: '/hr',
      icon: UserGroupIcon,
      roles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
    },
    {
      name: 'Media Library',
      href: '/media',
      icon: CameraIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: ServerIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
    {
      name: 'API Testing',
      href: '/api-testing',
      icon: CommandLineIcon,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ]

  const filteredNavigation = navigationItems.filter(item =>
    item.roles.includes(user?.role || '')
  )

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg h-full">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TG</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">TripGo Admin</p>
            <p className="text-xs text-gray-500">{tenant?.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }
            >
              <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar