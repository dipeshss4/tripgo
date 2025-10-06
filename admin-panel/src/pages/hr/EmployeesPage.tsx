import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { hrService, CreateEmployeeData, UpdateEmployeeData } from '../../services/hr'
import { usersService } from '../../services/users'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import EmployeeForm from '../../components/hr/EmployeeForm'
import { Employee } from '../../types'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const EmployeesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const queryClient = useQueryClient()
  const limit = 10

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', currentPage, searchTerm, selectedDepartment, selectedStatus],
    queryFn: () => hrService.getEmployees({
      page: currentPage,
      limit,
      search: searchTerm || undefined,
      department: selectedDepartment || undefined,
      status: selectedStatus || undefined,
    }),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getUsers({ limit: 1000 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => hrService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setIsCreateModalOpen(false)
      toast.success('Employee created successfully')
    },
    onError: (error) => {
      console.error('Error creating employee:', error)
      toast.error('Failed to create employee')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      hrService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setIsEditModalOpen(false)
      setSelectedEmployee(null)
      toast.success('Employee updated successfully')
    },
    onError: (error) => {
      console.error('Error updating employee:', error)
      toast.error('Failed to update employee')
    },
  })

  const handleCreateEmployee = async (data: CreateEmployeeData) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdateEmployee = async (data: UpdateEmployeeData) => {
    if (!selectedEmployee) return
    await updateMutation.mutateAsync({ id: selectedEmployee.id, data })
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditModalOpen(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (_: any, employee: Employee) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {employee.user.firstName[0]}{employee.user.lastName[0]}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {employee.user.firstName} {employee.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{employee.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (_: any, employee: Employee) => (
        <span className="text-sm text-gray-900">{employee.employeeId}</span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (_: any, employee: Employee) => (
        <span className="text-sm text-gray-900">{employee.department}</span>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (_: any, employee: Employee) => (
        <span className="text-sm text-gray-900">{employee.position}</span>
      ),
    },
    {
      key: 'hireDate',
      header: 'Hire Date',
      render: (_: any, employee: Employee) => (
        <span className="text-sm text-gray-900">
          {new Date(employee.hireDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, employee: Employee) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          employee.status === 'ACTIVE'
            ? 'bg-green-100 text-green-800'
            : employee.status === 'INACTIVE'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {employee.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, employee: Employee) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewEmployee(employee)}
            className="text-blue-600 hover:text-blue-800"
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditEmployee(employee)}
            className="text-green-600 hover:text-green-800"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (employeesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Mock data for demonstration
  const mockEmployeesData = {
    employees: [
      {
        id: '1',
        employeeId: 'EMP001',
        user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        position: 'Software Engineer',
        department: 'Engineering',
        hireDate: '2023-01-15',
        status: 'ACTIVE' as const
      },
      {
        id: '2',
        employeeId: 'EMP002',
        user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        position: 'HR Manager',
        department: 'HR',
        hireDate: '2022-05-10',
        status: 'ACTIVE' as const
      },
      {
        id: '3',
        employeeId: 'EMP003',
        user: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' },
        position: 'Designer',
        department: 'Design',
        hireDate: '2023-08-20',
        status: 'ACTIVE' as const
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      pages: 1
    }
  }

  const employees = employeesData?.employees || mockEmployeesData.employees
  const pagination = employeesData?.pagination || mockEmployeesData.pagination

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TERMINATED">Terminated</option>
            </select>
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

      {/* Employees Table */}
      <div className="bg-white shadow rounded-lg">
        <Table
          columns={columns}
          data={employees}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No employees found"
        />
      </div>

      {/* Create Employee Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Employee"
        size="lg"
      >
        <EmployeeForm
          users={users?.users || []}
          onSubmit={handleCreateEmployee}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEmployee(null)
        }}
        title="Edit Employee"
        size="lg"
      >
        {selectedEmployee && (
          <EmployeeForm
            employee={selectedEmployee}
            users={users?.users || []}
            onSubmit={handleUpdateEmployee}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedEmployee(null)
            }}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEmployee(null)
        }}
        title="Employee Details"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                  <span className="text-xl font-medium text-gray-700">
                    {selectedEmployee.user.firstName[0]}{selectedEmployee.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedEmployee.user.firstName} {selectedEmployee.user.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedEmployee.position}</p>
                  <p className="text-sm text-blue-600">{selectedEmployee.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Employee ID:</span>
                  <span className="ml-2 text-gray-900">{selectedEmployee.employeeId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{selectedEmployee.user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Hire Date:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEmployee.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : selectedEmployee.status === 'INACTIVE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              {selectedEmployee.salary && (
                <div>
                  <span className="font-medium text-gray-500">Salary:</span>
                  <span className="ml-2 text-gray-900">${selectedEmployee.salary.toLocaleString()}</span>
                </div>
              )}

              {selectedEmployee.manager && (
                <div>
                  <span className="font-medium text-gray-500">Manager:</span>
                  <span className="ml-2 text-gray-900">{selectedEmployee.manager}</span>
                </div>
              )}

              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                <div>
                  <span className="font-medium text-gray-500">Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmployee.bio && (
                <div>
                  <span className="font-medium text-gray-500">Bio:</span>
                  <p className="mt-1 text-gray-900">{selectedEmployee.bio}</p>
                </div>
              )}

              {selectedEmployee.address && (
                <div>
                  <span className="font-medium text-gray-500">Address:</span>
                  <p className="mt-1 text-gray-900">{selectedEmployee.address}</p>
                </div>
              )}

              {selectedEmployee.emergencyContact && (
                <div>
                  <span className="font-medium text-gray-500">Emergency Contact:</span>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship})</p>
                    <p>{selectedEmployee.emergencyContact.phone}</p>
                    {selectedEmployee.emergencyContact.email && <p>{selectedEmployee.emergencyContact.email}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedEmployee(null)
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

export default EmployeesPage