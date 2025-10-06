import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { hrService } from '../../services/hr'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { UserGroupIcon, ClockIcon, CalendarDaysIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline'

const HRDashboardPage: React.FC = () => {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: () => hrService.getHRDashboard(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load HR dashboard</div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">No dashboard data available</div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Employees',
      value: dashboard.totalEmployees,
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      name: 'Active Employees',
      value: dashboard.activeEmployees,
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      name: 'Pending Leaves',
      value: dashboard.pendingLeaves,
      icon: CalendarDaysIcon,
      color: 'yellow',
    },
    {
      name: 'Today\'s Attendance',
      value: dashboard.todayAttendance,
      icon: ClockIcon,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
            >
              <dt>
                <div className={`absolute rounded-md bg-${stat.color}-500 p-3`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </dd>
            </div>
          )
        })}
      </div>

      {/* Department Statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PresentationChartBarIcon className="w-5 h-5 mr-2" />
              Department Statistics
            </h3>
          </div>

          {dashboard.departmentStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.departmentStats.map((dept, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dept.category}</p>
                      <p className="text-2xl font-bold text-blue-600">{dept.count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Size</p>
                      <p className="text-sm font-medium text-gray-700">{dept.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No department statistics available
            </div>
          )}
        </div>
      </div>

      {/* Recent Joiners */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Joiners</h3>

          {dashboard.recentJoiners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.recentJoiners.map((employee) => (
                <div
                  key={employee.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.user.firstName} {employee.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                      <p className="text-xs text-blue-600">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No recent joiners
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HRDashboardPage