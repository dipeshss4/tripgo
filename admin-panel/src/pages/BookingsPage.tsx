import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Booking } from '../types'
import { bookingsService, BookingsQuery } from '../services/bookings'
import { useAuth } from '../hooks/useAuth'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const BookingsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  const [query, setQuery] = useState<BookingsQuery>({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    status: '',
  })

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', query],
    queryFn: () => bookingsService.getBookings(query),
    enabled: isAuthenticated && !!user, // Only run query when authenticated
  })

  const confirmBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsService.confirmBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking confirmed successfully')
    },
  })

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking cancelled successfully')
    },
  })

  const completeBookingMutation = useMutation({
    mutationFn: (id: string) => bookingsService.completeBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking completed successfully')
    },
  })

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleTypeFilter = (type: string) => {
    setQuery((prev) => ({ ...prev, type: type || undefined, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setQuery((prev) => ({ ...prev, status: status || undefined, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }

  const handleConfirmBooking = (booking: Booking) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      confirmBookingMutation.mutate(booking.id)
    }
  }

  const handleCancelBooking = (booking: Booking) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(booking.id)
    }
  }

  const handleCompleteBooking = (booking: Booking) => {
    if (window.confirm('Are you sure you want to mark this booking as completed?')) {
      completeBookingMutation.mutate(booking.id)
    }
  }

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'CRUISE', label: 'Cruise' },
    { value: 'HOTEL', label: 'Hotel' },
    { value: 'PACKAGE', label: 'Package' },
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-primary',
      CANCELLED: 'badge-danger',
      COMPLETED: 'badge-success',
    }
    return `badge ${statusClasses[status as keyof typeof statusClasses] || 'badge-primary'}`
  }

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      CRUISE: 'badge-primary',
      HOTEL: 'badge-success',
      PACKAGE: 'badge-warning',
    }
    return `badge ${typeClasses[type as keyof typeof typeClasses] || 'badge-primary'}`
  }

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (_: any, booking: Booking) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {booking.user.firstName} {booking.user.lastName}
          </div>
          <div className="text-sm text-gray-500">{booking.user.email}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (type: string) => (
        <span className={getTypeBadge(type)}>{type}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (status: string) => (
        <span className={getStatusBadge(status)}>{status}</span>
      ),
    },
    {
      key: 'guests',
      header: 'Guests',
    },
    {
      key: 'checkIn',
      header: 'Check-in',
      render: (checkIn: string) => new Date(checkIn).toLocaleDateString(),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      render: (checkOut: string) => new Date(checkOut).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, booking: Booking) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBooking(booking)
              setIsViewModalOpen(true)
            }}
            className="text-gray-400 hover:text-gray-600"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleConfirmBooking(booking)
                }}
                className="text-success-600 hover:text-success-800"
                title="Confirm"
                disabled={confirmBookingMutation.isPending}
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelBooking(booking)
                }}
                className="text-danger-600 hover:text-danger-800"
                title="Cancel"
                disabled={cancelBookingMutation.isPending}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </>
          )}
          {booking.status === 'CONFIRMED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCompleteBooking(booking)
              }}
              className="text-primary-600 hover:text-primary-800"
              title="Mark as Completed"
              disabled={completeBookingMutation.isPending}
            >
              <ClockIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage customer bookings and reservations</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={query.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={typeOptions}
            value={query.type || ''}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={statusOptions}
            value={query.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table
          columns={columns}
          data={bookingsData?.bookings || []}
          loading={isLoading}
        />

        {bookingsData && (
          <Pagination
            currentPage={bookingsData.page || 1}
            totalPages={bookingsData.totalPages || 1}
            onPageChange={handlePageChange}
            totalItems={bookingsData.total || 0}
            itemsPerPage={bookingsData.limit || 10}
          />
        )}
      </div>

      {/* View Booking Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedBooking(null)
        }}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Booking ID</label>
                <p className="text-gray-900 font-mono">{selectedBooking.id}</p>
              </div>
              <div>
                <label className="label">Status</label>
                <span className={getStatusBadge(selectedBooking.status)}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <p className="text-gray-900">
                    {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                  </p>
                </div>
                <div>
                  <label className="label">Email</label>
                  <p className="text-gray-900">{selectedBooking.user.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <span className={getTypeBadge(selectedBooking.type)}>
                    {selectedBooking.type}
                  </span>
                </div>
                <div>
                  <label className="label">Total Amount</label>
                  <p className="text-gray-900 font-semibold">
                    ${selectedBooking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="label">Guests</label>
                  <p className="text-gray-900">{selectedBooking.guests}</p>
                </div>
                <div>
                  <label className="label">Check-in</label>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.checkIn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="label">Check-out</label>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.checkOut).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Booking Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.bookingDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="label">Created</label>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedBooking.status === 'PENDING' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleCancelBooking(selectedBooking)}
                    loading={cancelBookingMutation.isPending}
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    onClick={() => handleConfirmBooking(selectedBooking)}
                    loading={confirmBookingMutation.isPending}
                  >
                    Confirm Booking
                  </Button>
                </>
              )}
              {selectedBooking.status === 'CONFIRMED' && (
                <Button
                  onClick={() => handleCompleteBooking(selectedBooking)}
                  loading={completeBookingMutation.isPending}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default BookingsPage