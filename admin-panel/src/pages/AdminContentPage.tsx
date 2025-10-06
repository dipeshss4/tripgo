import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminContentService, isDemoMode } from '../services'
import { Tab } from '@headlessui/react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

const AdminContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const tabs = [
    { name: 'Cruises', icon: '🚢' },
    { name: 'Hotels', icon: '🏨' },
    { name: 'Packages', icon: '📦' },
  ]

  // Queries for each content type
  const { data: cruises, isLoading: cruisesLoading } = useQuery({
    queryKey: ['admin-cruises', currentPage, searchTerm],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminContentService.cruises.getAll({ page: currentPage, search: searchTerm })
    },
    enabled: activeTab === 0,
  })

  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['admin-hotels', currentPage, searchTerm],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminContentService.hotels.getAll({ page: currentPage, search: searchTerm })
    },
    enabled: activeTab === 1,
  })

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['admin-packages', currentPage, searchTerm],
    queryFn: async () => {
      if (isDemoMode()) return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      return await adminContentService.packages.getAll({ page: currentPage, search: searchTerm })
    },
    enabled: activeTab === 2,
  })

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return cruises
      case 1: return hotels
      case 2: return packages
      default: return null
    }
  }

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 0: return cruisesLoading
      case 1: return hotelsLoading
      case 2: return packagesLoading
      default: return false
    }
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      switch (activeTab) {
        case 0:
          await adminContentService.cruises.delete(id)
          break
        case 1:
          await adminContentService.hotels.delete(id)
          break
        case 2:
          await adminContentService.packages.delete(id)
          break
      }
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const currentData = getCurrentData()
  const isLoading = getCurrentLoading()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage cruises, hotels, and travel packages</p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full max-w-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </span>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {tabs.map((tab, index) => (
            <Tab.Panel key={index} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentData?.items?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img
                                    className="h-12 w-12 rounded-lg object-cover"
                                    src={item.image}
                                    alt={item.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ${item.price?.toLocaleString()}
                              </div>
                              {activeTab === 2 && (
                                <div className="text-sm text-gray-500">
                                  {item.duration} days
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1 text-sm text-gray-900">
                                  {item.rating?.toFixed(1) || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`badge ${
                                  item.available ? 'badge-success' : 'badge-danger'
                                }`}
                              >
                                {item.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {currentData?.pagination && currentData.pagination.pages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="btn btn-secondary"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(currentData.pagination.pages, currentPage + 1))}
                          disabled={currentPage === currentData.pagination.pages}
                          className="btn btn-secondary"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                              {(currentPage - 1) * currentData.pagination.limit + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * currentData.pagination.limit, currentData.pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{currentData.pagination.total}</span>{' '}
                            results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {Array.from({ length: currentData.pagination.pages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === currentPage
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default AdminContentPage