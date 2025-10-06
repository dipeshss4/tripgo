import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { User } from '../types'
import { adminService } from '../services'
import { isDemoMode } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { mockUsers, simulateDelay, paginateArray } from '../services/mockData'

interface UsersQuery {
  page: number
  limit: number
  search: string
  role?: string
  isActive?: boolean
}

interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE' | 'CUSTOMER'
  isActive?: boolean
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  role?: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE' | 'CUSTOMER'
  isActive?: boolean
}
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import UserForm from '../components/users/UserForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuth()

  const [query, setQuery] = useState<UsersQuery>({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isActive: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', query],
    queryFn: async () => {
      if (isDemoMode()) {
        await simulateDelay()
        // Filter users based on query
        let filteredUsers = mockUsers

        if (query.search) {
          filteredUsers = filteredUsers.filter(user =>
            user.firstName.toLowerCase().includes(query.search!.toLowerCase()) ||
            user.lastName.toLowerCase().includes(query.search!.toLowerCase()) ||
            user.email.toLowerCase().includes(query.search!.toLowerCase())
          )
        }

        if (query.role) {
          filteredUsers = filteredUsers.filter(user => user.role === query.role)
        }

        if (query.isActive !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isActive === query.isActive)
        }

        const paginatedResult = paginateArray(filteredUsers, query.page || 1, query.limit || 10)

        return {
          users: paginatedResult.items,
          total: paginatedResult.total,
          page: paginatedResult.page,
          limit: paginatedResult.limit,
          totalPages: paginatedResult.totalPages,
        }
      }

      return adminService.users.getAll(query)
    },
    enabled: isAuthenticated && !!user, // Only run query when authenticated
  })

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      if (isDemoMode()) {
        await simulateDelay(300)
        toast.success('User created successfully (Demo)')
        return Promise.resolve()
      }
      return adminService.users.create(userData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsCreateModalOpen(false)
      toast.success('User created successfully')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      if (isDemoMode()) {
        await simulateDelay(300)
        toast.success('User updated successfully (Demo)')
        return Promise.resolve()
      }
      return adminService.users.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsEditModalOpen(false)
      setSelectedUser(null)
      toast.success('User updated successfully')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode()) {
        await simulateDelay(300)
        return Promise.resolve()
      }
      return adminService.users.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode()) {
        await simulateDelay(300)
        return Promise.resolve()
      }
      const userData = usersData && 'users' in usersData ? usersData : null
      const user = userData?.users?.find(u => u.id === id)
      return adminService.users.update(id, { isActive: !user?.isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated')
    },
  })

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleRoleFilter = (role: string) => {
    setQuery((prev) => ({ ...prev, role: role || undefined, page: 1 }))
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

  const handleCreateUser = async (userData: CreateUserData) => {
    await createUserMutation.mutateAsync(userData)
  }

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!selectedUser) return
    await updateUserMutation.mutateAsync({ id: selectedUser.id, data: userData })
  }

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const handleToggleStatus = (user: User) => {
    toggleStatusMutation.mutate(user.id)
  }

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'HR_MANAGER', label: 'HR Manager' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (_: any, user: User) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (role: string) => (
        <span className="badge badge-primary">{role}</span>
      ),
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
      render: (_: any, user: User) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedUser(user)
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
              setSelectedUser(user)
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
              handleToggleStatus(user)
            }}
            className={`${
              user.isActive ? 'text-warning-600 hover:text-warning-800' : 'text-success-600 hover:text-success-800'
            }`}
            title={user.isActive ? 'Deactivate' : 'Activate'}
            disabled={toggleStatusMutation.isPending}
          >
            {user.isActive ? '🔒' : '🔓'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteUser(user)
            }}
            className="text-danger-600 hover:text-danger-800"
            title="Delete"
            disabled={deleteUserMutation.isPending}
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={query.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={roleOptions}
            value={query.role || ''}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={statusOptions}
            value={query.isActive === undefined ? '' : query.isActive.toString()}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <Table
          columns={columns}
          data={usersData && 'users' in usersData ? usersData.users : usersData?.data || []}
          loading={isLoading}
        />

        {usersData && (
          <Pagination
            currentPage={('page' in usersData ? usersData.page : usersData.page) || 1}
            totalPages={('totalPages' in usersData ? usersData.totalPages : usersData.totalPages) || 1}
            onPageChange={handlePageChange}
            totalItems={('total' in usersData ? usersData.total : usersData.total) || 0}
            itemsPerPage={('limit' in usersData ? usersData.limit : usersData.limit) || 10}
          />
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="lg"
      >
        <UserForm
          onSubmit={(data) => handleCreateUser(data as CreateUserData)}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createUserMutation.isPending}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSubmit={(data) => handleUpdateUser(data as UpdateUserData)}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedUser(null)
            }}
            loading={updateUserMutation.isPending}
          />
        )}
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedUser(null)
        }}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <p className="text-gray-900">{selectedUser.firstName}</p>
              </div>
              <div>
                <label className="label">Last Name</label>
                <p className="text-gray-900">{selectedUser.lastName}</p>
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <p className="text-gray-900">{selectedUser.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <span className="badge badge-primary">{selectedUser.role}</span>
              </div>
              <div>
                <label className="label">Status</label>
                <span
                  className={`badge ${
                    selectedUser.isActive ? 'badge-success' : 'badge-danger'
                  }`}
                >
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Created</label>
                <p className="text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">Updated</label>
                <p className="text-gray-900">
                  {new Date(selectedUser.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UsersPage