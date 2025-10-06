import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { hrService, CreateLeaveRequestData, UpdateLeaveRequestData } from '../../services/hr'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import LeaveRequestForm from '../../components/hr/LeaveRequestForm'
import { LeaveRequest } from '../../services/hr'
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

const LeaveRequestsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)

  const queryClient = useQueryClient()
  const limit = 10

  const { data: leaveRequestsData, isLoading: leaveRequestsLoading } = useQuery({
    queryKey: ['leave-requests', currentPage, selectedEmployeeId, selectedStatus, selectedType],
    queryFn: () => hrService.getLeaveRequests({
      page: currentPage,
      limit,
      employeeId: selectedEmployeeId || undefined,
      status: selectedStatus || undefined,
      type: selectedType || undefined,
    }),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrService.getEmployees({ limit: 1000 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateLeaveRequestData) => hrService.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      setIsCreateModalOpen(false)
      toast.success('Leave request created successfully')
    },
    onError: (error) => {
      console.error('Error creating leave request:', error)
      toast.error('Failed to create leave request')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveRequestData }) =>
      hrService.updateLeaveRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      toast.success('Leave request status updated successfully')
    },
    onError: (error) => {
      console.error('Error updating leave request status:', error)
      toast.error('Failed to update leave request status')
    },
  })

  const handleCreateLeaveRequest = async (data: CreateLeaveRequestData) => {
    await createMutation.mutateAsync(data)
  }

  const handleApprove = async (leaveRequest: LeaveRequest) => {
    await updateStatusMutation.mutateAsync({
      id: leaveRequest.id,
      data: { status: 'APPROVED' }
    })
  }

  const handleReject = async (leaveRequest: LeaveRequest) => {
    const comments = prompt('Please provide a reason for rejection (optional):')
    await updateStatusMutation.mutateAsync({
      id: leaveRequest.id,
      data: { status: 'REJECTED', comments: comments || undefined }
    })
  }

  const handleViewLeaveRequest = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest)
    setIsViewModalOpen(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedEmployeeId('')
    setSelectedStatus('')
    setSelectedType('')
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const leaveTypes = [
    'Annual Leave',
    'Sick Leave',
    'Personal Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Emergency Leave',
    'Bereavement Leave',
    'Study Leave',
    'Unpaid Leave',
  ]

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {leaveRequest.employee.user.firstName[0]}{leaveRequest.employee.user.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {leaveRequest.employee.user.firstName} {leaveRequest.employee.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{leaveRequest.employee.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <span className="text-sm text-gray-900">{leaveRequest.type}</span>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <div className="text-sm text-gray-900">
          <div>{new Date(leaveRequest.startDate).toLocaleDateString()}</div>
          <div>to {new Date(leaveRequest.endDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'days',
      header: 'Days',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <span className="text-sm text-gray-900 font-medium">{leaveRequest.days}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leaveRequest.status)}`}>
          {leaveRequest.status}
        </span>
      ),
    },
    {
      key: 'requested',
      header: 'Requested',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <span className="text-sm text-gray-900">
          {new Date(leaveRequest.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, leaveRequest: LeaveRequest) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewLeaveRequest(leaveRequest)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Button>
          {leaveRequest.status === 'PENDING' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(leaveRequest)}
                className="text-green-600 hover:text-green-800"
                disabled={updateStatusMutation.isPending}
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(leaveRequest)}
                className="text-red-600 hover:text-red-800"
                disabled={updateStatusMutation.isPending}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  if (leaveRequestsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mock data for demonstration
  const mockLeaveRequestsData = {
    leaveRequests: [
      {
        id: '1',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          position: 'Software Engineer'
        },
        type: 'VACATION',
        startDate: '2024-12-30',
        endDate: '2025-01-03',
        days: 4,
        reason: 'Family vacation',
        status: 'PENDING' as const,
        requestedAt: '2024-12-20',
        approvedAt: null,
        approvedBy: null
      },
      {
        id: '2',
        employee: {
          id: '2',
          employeeId: 'EMP002',
          user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          position: 'HR Manager'
        },
        type: 'SICK',
        startDate: '2024-12-25',
        endDate: '2024-12-25',
        days: 1,
        reason: 'Doctor appointment',
        status: 'APPROVED' as const,
        requestedAt: '2024-12-24',
        approvedAt: '2024-12-24',
        approvedBy: 'Admin'
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  }

  const leaveRequests = leaveRequestsData?.leaveRequests || mockLeaveRequestsData.leaveRequests
  const pagination = leaveRequestsData?.pagination || mockLeaveRequestsData.pagination
  const employees = employeesData?.employees || []

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Leave Request
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.user.firstName} {employee.user.lastName}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="flex space-x-2 col-span-2">
              <Button type="submit" variant="outline">
                Search
              </Button>
              <Button type="button" variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Leave Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: leaveRequests.filter(l => l.status === 'PENDING').length, color: 'yellow' },
          { label: 'Approved Today', value: leaveRequests.filter(l =>
            l.status === 'APPROVED' &&
            new Date(l.approvedAt || '').toDateString() === new Date().toDateString()
          ).length, color: 'green' },
          { label: 'Total Requests', value: leaveRequests.length, color: 'blue' },
          { label: 'Rejected', value: leaveRequests.filter(l => l.status === 'REJECTED').length, color: 'red' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-full bg-${stat.color}-100`}>
                <CalendarDaysIcon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={leaveRequests}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No leave requests found"
        />
      </div>

      {/* Create Leave Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Leave Request"
        size="md"
      >
        <LeaveRequestForm
          employees={employees}
          onSubmit={handleCreateLeaveRequest}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* View Leave Request Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedLeaveRequest(null)
        }}
        title="Leave Request Details"
        size="md"
      >
        {selectedLeaveRequest && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <span className="text-lg font-medium text-gray-700">
                    {selectedLeaveRequest.employee.user.firstName[0]}{selectedLeaveRequest.employee.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedLeaveRequest.employee.user.firstName} {selectedLeaveRequest.employee.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedLeaveRequest.employee.user.email}</p>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-500">Type:</span>
                  <span className="ml-2 text-gray-900">{selectedLeaveRequest.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLeaveRequest.status)}`}>
                    {selectedLeaveRequest.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Start Date:</span>
                  <span className="ml-2 text-gray-900">{new Date(selectedLeaveRequest.startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">End Date:</span>
                  <span className="ml-2 text-gray-900">{new Date(selectedLeaveRequest.endDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Duration:</span>
                  <span className="ml-2 text-gray-900 font-medium">{selectedLeaveRequest.days} day{selectedLeaveRequest.days !== 1 ? 's' : ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Requested:</span>
                  <span className="ml-2 text-gray-900">{new Date(selectedLeaveRequest.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-500">Reason:</span>
                <p className="mt-1 text-gray-900">{selectedLeaveRequest.reason}</p>
              </div>

              {selectedLeaveRequest.comments && (
                <div>
                  <span className="font-medium text-gray-500">Comments:</span>
                  <p className="mt-1 text-gray-900">{selectedLeaveRequest.comments}</p>
                </div>
              )}

              {selectedLeaveRequest.approvedBy && selectedLeaveRequest.approvedAt && (
                <div>
                  <span className="font-medium text-gray-500">Approved by:</span>
                  <span className="ml-2 text-gray-900">{selectedLeaveRequest.approvedBy}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    on {new Date(selectedLeaveRequest.approvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex space-x-3">
                {selectedLeaveRequest.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleApprove(selectedLeaveRequest)}
                      disabled={updateStatusMutation.isPending}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedLeaveRequest)}
                      disabled={updateStatusMutation.isPending}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedLeaveRequest(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LeaveRequestsPage