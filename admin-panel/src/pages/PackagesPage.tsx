import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Package } from '../types'
import { packagesService, CreatePackageData, UpdatePackageData, PackagesQuery } from '../services/packages'
import { useAuth } from '../hooks/useAuth'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import PackageForm from '../components/packages/PackageForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { getImageUrl } from '../utils/imageUtils'

const PackagesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  const [query, setQuery] = useState<PackagesQuery>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['packages', query],
    queryFn: () => packagesService.getPackages(query),
    enabled: isAuthenticated && !!user, // Only run query when authenticated
  })

  const createPackageMutation = useMutation({
    mutationFn: (packageData: CreatePackageData) => packagesService.createPackage(packageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      setIsCreateModalOpen(false)
      toast.success('Package created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create package')
    },
  })

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageData }) =>
      packagesService.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      setIsEditModalOpen(false)
      setSelectedPackage(null)
      toast.success('Package updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update package')
    },
  })

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => packagesService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Package deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete package')
    },
  })

  const handleCreatePackage = async (data: CreatePackageData) => {
    await createPackageMutation.mutateAsync(data)
  }

  const handleUpdatePackage = async (data: UpdatePackageData) => {
    if (!selectedPackage) return
    await updatePackageMutation.mutateAsync({ id: selectedPackage.id, data })
  }

  const handleDeletePackage = async (packageData: Package) => {
    if (window.confirm(`Are you sure you want to delete "${packageData.name}"?`)) {
      await deletePackageMutation.mutateAsync(packageData.id)
    }
  }

  const handleDuplicatePackage = async (packageData: Package) => {
    try {
      const duplicateData: CreatePackageData = {
        name: `${packageData.name} (Copy)`,
        description: packageData.description,
        duration: packageData.duration,
        price: packageData.price,
        images: packageData.images,
        inclusions: packageData.inclusions,
        exclusions: packageData.exclusions,
        itinerary: packageData.itinerary,
        isActive: false,
      }
      await createPackageMutation.mutateAsync(duplicateData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate package')
    }
  }

  const handleViewPackage = (packageData: Package) => {
    setSelectedPackage(packageData)
    setIsViewModalOpen(true)
  }

  const handleEditPackage = (packageData: Package) => {
    setSelectedPackage(packageData)
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      key: 'name',
      header: 'Package',
      render: (_: any, pkg: Package) => (
        <div className="flex items-center space-x-3">
          {pkg.images?.[0] && (
            <img
              src={getImageUrl(pkg.images[0])}
              alt={pkg.name}
              className="w-12 h-12 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{pkg.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {pkg.duration} days
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'destinations',
      header: 'Destinations',
      render: (_: any, pkg: Package) => (
        <div className="flex flex-wrap gap-1">
          {(pkg as any).destinations?.slice(0, 2).map((dest: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
            >
              <MapPinIcon className="w-3 h-3 mr-1" />
              {dest}
            </span>
          ))}
          {(pkg as any).destinations && (pkg as any).destinations.length > 2 && (
            <span className="text-xs text-gray-500">
              +{(pkg as any).destinations.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (_: any, pkg: Package) => (
        <div className="flex items-center text-gray-900">
          <CurrencyDollarIcon className="w-4 h-4 mr-1 text-gray-400" />
          ${pkg.price}
        </div>
      ),
    },
    {
      key: 'inclusions',
      header: 'Inclusions',
      render: (_: any, pkg: Package) => (
        <div className="flex flex-wrap gap-1">
          {pkg.inclusions?.slice(0, 2).map((inclusion, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {inclusion}
            </span>
          ))}
          {pkg.inclusions && pkg.inclusions.length > 2 && (
            <span className="text-xs text-gray-500">
              +{pkg.inclusions.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_: any, pkg: Package) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            pkg.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {pkg.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, pkg: Package) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPackage(pkg)}
            title="View Package"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditPackage(pkg)}
            title="Edit Package"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicatePackage(pkg)}
            title="Duplicate Package"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePackage(pkg)}
            className="text-red-600 hover:text-red-800"
            title="Delete Package"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Packages</h1>
          <p className="text-gray-600">Manage your travel package offerings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search packages..."
            value={query.search || ''}
            onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
            className="w-full"
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>
        <select
          value={query.isActive?.toString() || ''}
          onChange={(e) =>
            setQuery({
              ...query,
              isActive: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <Input
          placeholder="Min Duration"
          type="number"
          value={query.minDuration || ''}
          onChange={(e) => setQuery({ ...query, minDuration: parseInt(e.target.value) || undefined, page: 1 })}
        />
        <Input
          placeholder="Max Duration"
          type="number"
          value={query.maxDuration || ''}
          onChange={(e) => setQuery({ ...query, maxDuration: parseInt(e.target.value) || undefined, page: 1 })}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={packagesData?.packages || []}
          loading={isLoading}
          emptyState={{
            title: 'No packages found',
            description: 'Get started by creating your first travel package.',
            action: (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            ),
          }}
        />

        {/* Pagination */}
        {packagesData?.pagination && packagesData.packages.length > 0 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={packagesData.pagination.page}
              totalPages={packagesData.pagination.pages}
              onPageChange={(page) => setQuery({ ...query, page })}
              totalItems={packagesData.pagination.total}
              itemsPerPage={packagesData.pagination.limit}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Package"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createPackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={createPackageMutation.isPending}
              onClick={() => {
                const form = document.getElementById('package-form') as HTMLFormElement
                if (form) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                  form.dispatchEvent(submitEvent)
                }
              }}
            >
              Create Package
            </Button>
          </div>
        }
      >
        <PackageForm
          onSubmit={handleCreatePackage}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createPackageMutation.isPending}
          renderActions={() => null}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPackage(null)
        }}
        title="Edit Package"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedPackage(null)
              }}
              disabled={updatePackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={updatePackageMutation.isPending}
              onClick={() => {
                const form = document.getElementById('package-form') as HTMLFormElement
                if (form) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                  form.dispatchEvent(submitEvent)
                }
              }}
            >
              Update Package
            </Button>
          </div>
        }
      >
        {selectedPackage && (
          <PackageForm
            package={selectedPackage}
            onSubmit={handleUpdatePackage}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedPackage(null)
            }}
            loading={updatePackageMutation.isPending}
            renderActions={() => null}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedPackage(null)
        }}
        title="Package Details"
        size="2xl"
      >
        {selectedPackage && (
          <div className="space-y-6">
            {/* Images */}
            {selectedPackage.images && selectedPackage.images.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedPackage.images.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${selectedPackage.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{selectedPackage.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900">{selectedPackage.duration} days</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="text-sm text-gray-900">${selectedPackage.price}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedPackage.isActive ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Destinations</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedPackage as any).destinations?.map((dest: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {dest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-sm text-gray-700">{selectedPackage.description}</p>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Inclusions</h3>
                  <div className="space-y-2">
                    {selectedPackage.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex items-center text-sm text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {inclusion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Exclusions</h3>
                  <div className="space-y-2">
                    {selectedPackage.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex items-center text-sm text-red-700">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {exclusion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Itinerary</h3>
                <div className="space-y-4">
                  {selectedPackage.itinerary.map((day, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                      </div>
                      {day.description && (
                        <p className="text-sm text-gray-700 mb-3">{day.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {day.activities && day.activities.length > 0 && (
                          <div>
                            <dt className="font-medium text-gray-500">Activities</dt>
                            <dd className="text-gray-900">
                              {day.activities.join(', ')}
                            </dd>
                          </div>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <div>
                            <dt className="font-medium text-gray-500">Meals</dt>
                            <dd className="text-gray-900">
                              {day.meals.join(', ')}
                            </dd>
                          </div>
                        )}
                        {day.accommodation && (
                          <div>
                            <dt className="font-medium text-gray-500">Accommodation</dt>
                            <dd className="text-gray-900">{day.accommodation}</dd>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedPackage(null)
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEditPackage(selectedPackage)
                }}
              >
                Edit Package
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PackagesPage