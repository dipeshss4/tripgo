import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Hotel } from '../types'
import { hotelsService, CreateHotelData, UpdateHotelData, HotelsQuery } from '../services/hotels'
import { useAuth } from '../hooks/useAuth'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import HotelForm from '../components/hotels/HotelForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { getImageUrl } from '../utils/imageUtils'

const HotelsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  const [query, setQuery] = useState<HotelsQuery>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  const { data: hotelsData, isLoading } = useQuery({
    queryKey: ['hotels', query],
    queryFn: () => hotelsService.getHotels(query),
    enabled: isAuthenticated && !!user, // Only run query when authenticated
  })

  const createHotelMutation = useMutation({
    mutationFn: (hotelData: CreateHotelData) => hotelsService.createHotel(hotelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      setIsCreateModalOpen(false)
      toast.success('Hotel created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create hotel')
    },
  })

  const updateHotelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHotelData }) =>
      hotelsService.updateHotel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      setIsEditModalOpen(false)
      setSelectedHotel(null)
      toast.success('Hotel updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update hotel')
    },
  })

  const deleteHotelMutation = useMutation({
    mutationFn: (id: string) => hotelsService.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      toast.success('Hotel deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete hotel')
    },
  })

  const handleCreateHotel = async (data: CreateHotelData) => {
    await createHotelMutation.mutateAsync(data)
  }

  const handleUpdateHotel = async (data: UpdateHotelData) => {
    if (!selectedHotel) return
    await updateHotelMutation.mutateAsync({ id: selectedHotel.id, data })
  }

  const handleDeleteHotel = async (hotel: Hotel) => {
    if (window.confirm(`Are you sure you want to delete "${hotel.name}"?`)) {
      await deleteHotelMutation.mutateAsync(hotel.id)
    }
  }

  const handleDuplicateHotel = async (hotel: Hotel) => {
    try {
      const duplicateData: CreateHotelData = {
        name: `${hotel.name} (Copy)`,
        description: hotel.description,
        location: hotel.location,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        price: hotel.price,
        images: hotel.images,
        amenities: hotel.amenities,
        roomTypes: (hotel as any).roomTypes || [],
        isActive: false,
      }
      await createHotelMutation.mutateAsync(duplicateData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate hotel')
    }
  }

  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setIsViewModalOpen(true)
  }

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setIsEditModalOpen(true)
  }

  const columns = [
    {
      key: 'name',
      header: 'Hotel',
      render: (_: any, hotel: Hotel) => (
        <div className="flex items-center space-x-3">
          {hotel.images?.[0] && (
            <img
              src={getImageUrl(hotel.images[0])}
              alt={hotel.name}
              className="w-12 h-12 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{hotel.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {hotel.city}, {hotel.country}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: any, hotel: Hotel) => (
        <div className="text-sm">
          <div className="text-gray-900">{hotel.location}</div>
          <div className="text-gray-500">{hotel.address}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price/Night',
      render: (_: any, hotel: Hotel) => (
        <div className="flex items-center text-gray-900">
          <CurrencyDollarIcon className="w-4 h-4 mr-1 text-gray-400" />
          ${hotel.price}
        </div>
      ),
    },
    {
      key: 'amenities',
      header: 'Amenities',
      render: (_: any, hotel: Hotel) => (
        <div className="flex flex-wrap gap-1">
          {hotel.amenities?.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities && hotel.amenities.length > 3 && (
            <span className="text-xs text-gray-500">
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_: any, hotel: Hotel) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            hotel.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {hotel.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, hotel: Hotel) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewHotel(hotel)}
            title="View Hotel"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditHotel(hotel)}
            title="Edit Hotel"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicateHotel(hotel)}
            title="Duplicate Hotel"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteHotel(hotel)}
            className="text-red-600 hover:text-red-800"
            title="Delete Hotel"
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
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-gray-600">Manage your hotel listings</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search hotels..."
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
          placeholder="City"
          value={query.city || ''}
          onChange={(e) => setQuery({ ...query, city: e.target.value, page: 1 })}
        />
        <Input
          placeholder="Country"
          value={query.country || ''}
          onChange={(e) => setQuery({ ...query, country: e.target.value, page: 1 })}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={hotelsData?.hotels || []}
          loading={isLoading}
          emptyState={{
            title: 'No hotels found',
            description: 'Get started by creating your first hotel.',
            action: (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Hotel
              </Button>
            ),
          }}
        />

        {/* Pagination */}
        {hotelsData?.pagination && hotelsData.hotels.length > 0 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={hotelsData.pagination.page}
              totalPages={hotelsData.pagination.pages}
              onPageChange={(page) => setQuery({ ...query, page })}
              totalItems={hotelsData.pagination.total}
              itemsPerPage={hotelsData.pagination.limit}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Hotel"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createHotelMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={createHotelMutation.isPending}
              onClick={() => {
                const form = document.getElementById('hotel-form') as HTMLFormElement
                if (form) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                  form.dispatchEvent(submitEvent)
                }
              }}
            >
              Create Hotel
            </Button>
          </div>
        }
      >
        <HotelForm
          onSubmit={handleCreateHotel}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createHotelMutation.isPending}
          renderActions={() => null}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedHotel(null)
        }}
        title="Edit Hotel"
        size="2xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setSelectedHotel(null)
              }}
              disabled={updateHotelMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={updateHotelMutation.isPending}
              onClick={() => {
                const form = document.getElementById('hotel-form') as HTMLFormElement
                if (form) {
                  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                  form.dispatchEvent(submitEvent)
                }
              }}
            >
              Update Hotel
            </Button>
          </div>
        }
      >
        {selectedHotel && (
          <HotelForm
            hotel={selectedHotel}
            onSubmit={handleUpdateHotel}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedHotel(null)
            }}
            loading={updateHotelMutation.isPending}
            renderActions={() => null}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedHotel(null)
        }}
        title="Hotel Details"
        size="2xl"
      >
        {selectedHotel && (
          <div className="space-y-6">
            {/* Images */}
            {selectedHotel.images && selectedHotel.images.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedHotel.images.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${selectedHotel.name} ${index + 1}`}
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
                    <dd className="text-sm text-gray-900">{selectedHotel.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price per Night</dt>
                    <dd className="text-sm text-gray-900">${selectedHotel.price}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedHotel.isActive ? 'Active' : 'Inactive'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Location</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{selectedHotel.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{selectedHotel.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">City</dt>
                    <dd className="text-sm text-gray-900">{selectedHotel.city}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                    <dd className="text-sm text-gray-900">{selectedHotel.country}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Description</h3>
              <p className="text-sm text-gray-700">{selectedHotel.description}</p>
            </div>

            {/* Amenities */}
            {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Room Types */}
            {(selectedHotel as any).roomTypes && (selectedHotel as any).roomTypes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Room Types</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selectedHotel as any).roomTypes.map((room: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${room.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.capacity} guests
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedHotel(null)
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEditHotel(selectedHotel)
                }}
              >
                Edit Hotel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HotelsPage