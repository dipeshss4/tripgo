import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { hrService, MarkAttendanceData } from '../../services/hr'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import AttendanceForm from '../../components/hr/AttendanceForm'
import { AttendanceRecord } from '../../services/hr'
import {
  PlusIcon,
  ClockIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const AttendancePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false)

  const queryClient = useQueryClient()
  const limit = 10

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', currentPage, selectedEmployeeId, startDate, endDate],
    queryFn: () => hrService.getAttendance({
      page: currentPage,
      limit,
      employeeId: selectedEmployeeId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrService.getEmployees({ limit: 1000 }),
  })

  const markAttendanceMutation = useMutation({
    mutationFn: (data: MarkAttendanceData) => hrService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      setIsMarkAttendanceModalOpen(false)
      toast.success('Attendance marked successfully')
    },
    onError: (error) => {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    },
  })

  const handleMarkAttendance = async (data: MarkAttendanceData) => {
    await markAttendanceMutation.mutateAsync(data)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedEmployeeId('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800'
      case 'ABSENT':
        return 'bg-red-100 text-red-800'
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'HALF_DAY':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (_: any, record: AttendanceRecord) => {
        const firstName = record.employee?.user?.firstName || 'Unknown';
        const lastName = record.employee?.user?.lastName || 'User';
        const email = record.employee?.user?.email || 'no-email@example.com';

        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {firstName[0]}{lastName[0]}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {firstName} {lastName}
              </div>
              <div className="text-sm text-gray-500">{email}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (_: any, record: AttendanceRecord) => (
        <span className="text-sm text-gray-900">
          {new Date(record.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (_: any, record: AttendanceRecord) => (
        <span className="text-sm text-gray-900">
          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (_: any, record: AttendanceRecord) => (
        <span className="text-sm text-gray-900">
          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, record: AttendanceRecord) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
          {record.status}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (_: any, record: AttendanceRecord) => (
        <span className="text-sm text-gray-900">
          {record.notes || '-'}
        </span>
      ),
    },
  ]

  if (attendanceLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mock data for demonstration
  const mockAttendanceData = {
    attendance: [
      {
        id: '1',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          position: 'Software Engineer'
        },
        date: '2024-12-26',
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'PRESENT' as const,
        notes: 'On time'
      },
      {
        id: '2',
        employee: {
          id: '2',
          employeeId: 'EMP002',
          user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
          position: 'HR Manager'
        },
        date: '2024-12-26',
        checkIn: '09:15',
        checkOut: '17:45',
        status: 'LATE' as const,
        notes: 'Late by 15 minutes'
      },
      {
        id: '3',
        employee: {
          id: '3',
          employeeId: 'EMP003',
          user: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' },
          position: 'Designer'
        },
        date: '2024-12-26',
        checkIn: null,
        checkOut: null,
        status: 'ABSENT' as const,
        notes: 'Sick leave'
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      pages: 1
    }
  }

  const attendance = attendanceData?.attendance || mockAttendanceData.attendance
  const pagination = attendanceData?.pagination || mockAttendanceData.pagination
  const employees = employeesData?.employees || []

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setIsMarkAttendanceModalOpen(true)}>
          <ClockIcon className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />

            <div className="flex space-x-2">
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

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Present Today', value: attendance.filter(a =>
            a.status === 'PRESENT' &&
            new Date(a.date).toDateString() === new Date().toDateString()
          ).length, color: 'green' },
          { label: 'Absent Today', value: attendance.filter(a =>
            a.status === 'ABSENT' &&
            new Date(a.date).toDateString() === new Date().toDateString()
          ).length, color: 'red' },
          { label: 'Late Today', value: attendance.filter(a =>
            a.status === 'LATE' &&
            new Date(a.date).toDateString() === new Date().toDateString()
          ).length, color: 'yellow' },
          { label: 'Half Day Today', value: attendance.filter(a =>
            a.status === 'HALF_DAY' &&
            new Date(a.date).toDateString() === new Date().toDateString()
          ).length, color: 'blue' },
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

      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={attendance}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No attendance records found"
        />
      </div>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isMarkAttendanceModalOpen}
        onClose={() => setIsMarkAttendanceModalOpen(false)}
        title="Mark Attendance"
        size="md"
      >
        <AttendanceForm
          employees={employees}
          onSubmit={handleMarkAttendance}
          onCancel={() => setIsMarkAttendanceModalOpen(false)}
          loading={markAttendanceMutation.isPending}
        />
      </Modal>
    </div>
  )
}

export default AttendancePage