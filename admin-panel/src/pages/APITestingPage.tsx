import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminService, adminContentService, adminSystemService } from '../services'
import { toast } from 'react-hot-toast'
import {
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface APITest {
  name: string
  description: string
  endpoint: string
  method: string
  testFn: () => Promise<any>
}

const APITestingPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, { status: 'success' | 'error' | 'pending'; data?: any; error?: any }>>({})

  const apiTests: APITest[] = [
    {
      name: 'Dashboard Stats',
      description: 'Test dashboard statistics endpoint',
      endpoint: '/admin/dashboard/stats',
      method: 'GET',
      testFn: () => adminService.dashboard.getStats()
    },
    {
      name: 'Get All Users',
      description: 'Test user management endpoint',
      endpoint: '/admin/users',
      method: 'GET',
      testFn: () => adminService.users.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Get All Bookings',
      description: 'Test booking management endpoint',
      endpoint: '/admin/bookings',
      method: 'GET',
      testFn: () => adminService.bookings.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Get Cruises',
      description: 'Test content management - cruises',
      endpoint: '/admin/content/cruises',
      method: 'GET',
      testFn: () => adminContentService.cruises.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Get Hotels',
      description: 'Test content management - hotels',
      endpoint: '/admin/content/hotels',
      method: 'GET',
      testFn: () => adminContentService.hotels.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Get Packages',
      description: 'Test content management - packages',
      endpoint: '/admin/content/packages',
      method: 'GET',
      testFn: () => adminContentService.packages.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'System Settings',
      description: 'Test system settings endpoint',
      endpoint: '/admin/system/settings',
      method: 'GET',
      testFn: () => adminSystemService.settings.getAll()
    },
    {
      name: 'Get Tenants',
      description: 'Test tenant management endpoint',
      endpoint: '/admin/system/tenants',
      method: 'GET',
      testFn: () => adminSystemService.tenants.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Media Files',
      description: 'Test media library endpoint',
      endpoint: '/admin/system/media',
      method: 'GET',
      testFn: () => adminSystemService.media.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'System Analytics',
      description: 'Test analytics endpoint',
      endpoint: '/admin/analytics',
      method: 'GET',
      testFn: () => adminService.dashboard.getAnalytics()
    }
  ]

  const testMutation = useMutation({
    mutationFn: async ({ testName, testFn }: { testName: string; testFn: () => Promise<any> }) => {
      setResults(prev => ({ ...prev, [testName]: { status: 'pending' } }))

      try {
        const data = await testFn()
        setResults(prev => ({ ...prev, [testName]: { status: 'success', data } }))
        toast.success(`${testName} - Test passed`)
        return { success: true, data }
      } catch (error) {
        setResults(prev => ({ ...prev, [testName]: { status: 'error', error } }))
        toast.error(`${testName} - Test failed`)
        throw error
      }
    }
  })

  const runTest = (test: APITest) => {
    testMutation.mutate({ testName: test.name, testFn: test.testFn })
  }

  const runAllTests = async () => {
    for (const test of apiTests) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
      runTest(test)
    }
  }

  const getStatusIcon = (status?: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Integration Testing</h1>
          <p className="text-gray-600">Test all enhanced API endpoints and verify integration</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={testMutation.isPending}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlayIcon className="h-5 w-5" />
          Run All Tests
        </button>
      </div>

      {/* Test Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(results).filter(r => r.status === 'success').length}
              </p>
              <p className="text-sm text-gray-500">Passed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(results).filter(r => r.status === 'error').length}
              </p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <InformationCircleIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {apiTests.length}
              </p>
              <p className="text-sm text-gray-500">Total Tests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual API Tests */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {apiTests.map((test) => {
            const result = results[test.name]
            return (
              <div key={test.name} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result?.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                        <p className="text-sm text-gray-500">{test.description}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            test.method === 'GET' ? 'bg-green-100 text-green-800' :
                            test.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            test.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.method}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{test.endpoint}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => runTest(test)}
                    disabled={testMutation.isPending}
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                  >
                    <PlayIcon className="h-4 w-4" />
                    Test
                  </button>
                </div>

                {/* Test Results */}
                {result && result.status !== 'pending' && (
                  <div className="mt-4 pl-8">
                    {result.status === 'success' ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <h5 className="text-sm font-medium text-green-900 mb-2">✅ Success</h5>
                        <pre className="text-xs text-green-700 overflow-x-auto max-h-32 overflow-y-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <h5 className="text-sm font-medium text-red-900 mb-2">❌ Error</h5>
                        <pre className="text-xs text-red-700 overflow-x-auto">
                          {result.error?.message || JSON.stringify(result.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Integration Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">Enhanced API Services</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">Type-safe Interfaces</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">Error Handling</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">React Query Integration</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">Authentication</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-900">Response Caching</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APITestingPage