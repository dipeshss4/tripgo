import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface HRLayoutProps {
  children: React.ReactNode
}

const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  const location = useLocation()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/hr/dashboard',
      icon: HomeIcon,
      description: 'HR overview and statistics'
    },
    {
      name: 'Employees',
      href: '/hr/employees',
      icon: UserGroupIcon,
      description: 'Manage employee records'
    },
    {
      name: 'Attendance',
      href: '/hr/attendance',
      icon: ClockIcon,
      description: 'Track employee attendance'
    },
    {
      name: 'Leave Requests',
      href: '/hr/leave-requests',
      icon: CalendarDaysIcon,
      description: 'Manage leave applications'
    },
    {
      name: 'Payroll',
      href: '/hr/payroll',
      icon: CurrencyDollarIcon,
      description: 'Salary and payslip management'
    },
    {
      name: 'Reports',
      href: '/hr/reports',
      icon: DocumentTextIcon,
      description: 'Generate HR reports'
    },
  ]

  const currentTab = navigation.find(nav =>
    location.pathname === nav.href ||
    (nav.href === '/hr/dashboard' && location.pathname === '/hr')
  )

  return (
    <div className="space-y-6">
      {/* Page Header with Title */}
      <div className="border-b border-gray-200 pb-5">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
            <p className="mt-2 text-sm text-gray-700">
              {currentTab?.description || 'Manage your organization\'s human resources'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
            >
              {navigation.map((tab) => (
                <option key={tab.name} value={tab.href}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {navigation.map((tab) => {
                  const Icon = tab.icon
                  const isActive = location.pathname === tab.href ||
                    (tab.href === '/hr/dashboard' && location.pathname === '/hr')

                  return (
                    <NavLink
                      key={tab.name}
                      to={tab.href}
                      className={`${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.name}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default HRLayout