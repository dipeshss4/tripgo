import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Cruise } from '../types'
import { cruisesService, CreateCruiseData, UpdateCruiseData, CruisesQuery } from '../services/cruises'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import CruiseForm from '../components/cruises/CruiseForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

const CruisesPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [query, setQuery] = useState<CruisesQuery>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null)

  const { data: cruisesData, isLoading } = useQuery({
    queryKey: ['cruises', query],
    queryFn: () => cruisesService.getCruises(query),
  })

  const createCruiseMutation = useMutation({
    mutationFn: (cruiseData: CreateCruiseData) => cruisesService.createCruise(cruiseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] })
      setIsCreateModalOpen(false)
    },
  })

  const updateCruiseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCruiseData }) =>
      cruisesService.updateCruise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] })
      setIsEditModalOpen(false)
      setSelectedCruise(null)
    },
  })

  const deleteCruiseMutation = useMutation({
    mutationFn: (id: string) => cruisesService.deleteCruise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] })
      toast.success('Cruise deleted successfully')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => cruisesService.toggleCruiseStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] })
      toast.success('Cruise status updated')
    },
  })

  const duplicateCruiseMutation = useMutation({
    mutationFn: (id: string) => cruisesService.duplicateCruise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruises'] })
      toast.success('Cruise duplicated successfully')
    },
  })

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setQuery((prev) => ({
      ...prev,
      isActive: status === '' ? undefined : status === 'true',
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }

  const handleCreateCruise = async (cruiseData: CreateCruiseData) => {
    await createCruiseMutation.mutateAsync(cruiseData)
  }

  const handleUpdateCruise = async (cruiseData: UpdateCruiseData) => {
    if (!selectedCruise) return
    await updateCruiseMutation.mutateAsync({ id: selectedCruise.id, data: cruiseData })
  }

  const handleDeleteCruise = (cruise: Cruise) => {
    if (window.confirm(`Are you sure you want to delete "${cruise.name}"?`)) {
      deleteCruiseMutation.mutate(cruise.id)
    }
  }

  const handleToggleStatus = (cruise: Cruise) => {
    toggleStatusMutation.mutate(cruise.id)
  }

  const handleDuplicateCruise = (cruise: Cruise) => {
    duplicateCruiseMutation.mutate(cruise.id)
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const columns = [
    {
      key: 'name',
      header: 'Cruise',
      render: (_: any, cruise: Cruise) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{cruise.name}</div>
          <div className="text-sm text-gray-500">
            {cruise.departure} → {cruise.destination}
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (duration: number) => `${duration} days`,
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (capacity: number) => `${capacity} passengers`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (isActive: boolean) => (
        <span
          className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, cruise: Cruise) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCruise(cruise)
              setIsViewModalOpen(true)
            }}
            className="text-gray-400 hover:text-gray-600"
            title="View"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCruise(cruise)
              setIsEditModalOpen(true)
            }}
            className="text-primary-600 hover:text-primary-800"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicateCruise(cruise)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Duplicate"
            disabled={duplicateCruiseMutation.isPending}
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleStatus(cruise)
            }}
            className={`${
              cruise.isActive ? 'text-warning-600 hover:text-warning-800' : 'text-success-600 hover:text-success-800'
            }`}
            title={cruise.isActive ? 'Deactivate' : 'Activate'}
            disabled={toggleStatusMutation.isPending}
          >
            {cruise.isActive ? '🔒' : '🔓'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteCruise(cruise)
            }}
            className="text-danger-600 hover:text-danger-800"
            title="Delete"
            disabled={deleteCruiseMutation.isPending}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cruises</h1>
          <p className="text-gray-600">Manage cruise packages and itineraries</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Cruise
        </Button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search cruises..."
                value={query.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={statusOptions}
            value={query.isActive === undefined ? '' : query.isActive.toString()}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table
          columns={columns}
          data={cruisesData?.cruises || []}
          loading={isLoading}
        />

        {cruisesData && (
          <Pagination
            currentPage={cruisesData.page || 1}
            totalPages={cruisesData.totalPages || 1}
            onPageChange={handlePageChange}
            totalItems={cruisesData.total || 0}
            itemsPerPage={cruisesData.limit || 10}
          />
        )}
      </div>

      {/* Create Cruise Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Cruise"
        size="xl"
      >
        <CruiseForm
          onSubmit={handleCreateCruise}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createCruiseMutation.isPending}
        />
      </Modal>

      {/* Edit Cruise Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCruise(null)
        }}
        title="Edit Cruise"
        size="xl"
      >
        {selectedCruise && (
          <CruiseForm
            cruise={selectedCruise}
            onSubmit={handleUpdateCruise}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedCruise(null)
            }}
            loading={updateCruiseMutation.isPending}
          />
        )}
      </Modal>

      {/* View Cruise Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCruise(null)
        }}
        title="Cruise Details"
        size="lg"
      >
        {selectedCruise && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cruise Name</label>
                <p className="text-gray-900 font-medium">{selectedCruise.name}</p>
              </div>
              <div>
                <label className="label">Status</label>
                <span
                  className={`badge ${
                    selectedCruise.isActive ? 'badge-success' : 'badge-danger'
                  }`}
                >
                  {selectedCruise.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <p className="text-gray-900">{selectedCruise.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Departure</label>
                <p className="text-gray-900">{selectedCruise.departure}</p>
              </div>
              <div>
                <label className="label">Destination</label>
                <p className="text-gray-900">{selectedCruise.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Duration</label>
                <p className="text-gray-900">{selectedCruise.duration} days</p>
              </div>
              <div>
                <label className="label">Capacity</label>
                <p className="text-gray-900">{selectedCruise.capacity} passengers</p>
              </div>
              <div>
                <label className="label">Price</label>
                <p className="text-gray-900 font-semibold">
                  ${selectedCruise.price.toLocaleString()}
                </p>
              </div>
            </div>

            {selectedCruise.amenities && selectedCruise.amenities.length > 0 && (
              <div>
                <label className="label">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCruise.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="badge badge-primary"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCruise.itinerary && selectedCruise.itinerary.length > 0 && (
              <div>
                <label className="label">Itinerary</label>
                <div className="space-y-3">
                  {selectedCruise.itinerary.map((day, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">
                        Day {day.day}: {day.port}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Arrival: {day.arrival}</div>
                        <div>Departure: {day.departure}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="label">Created</label>
                <p className="text-gray-900">
                  {new Date(selectedCruise.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">Updated</label>
                <p className="text-gray-900">
                  {new Date(selectedCruise.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CruisesPage