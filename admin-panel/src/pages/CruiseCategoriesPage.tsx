import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { CruiseCategory, cruiseCategoryService, CreateCategoryData, UpdateCategoryData, CategoriesQuery } from '../services/cruiseCategories'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import CategoryForm from '../components/cruises/CategoryForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'

const CruiseCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [query, setQuery] = useState<CategoriesQuery>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CruiseCategory | null>(null)

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['cruise-categories', query],
    queryFn: () => cruiseCategoryService.getCategories(query),
  })

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: CreateCategoryData) => cruiseCategoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruise-categories'] })
      setIsCreateModalOpen(false)
      toast.success('Category created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category')
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      cruiseCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruise-categories'] })
      setIsEditModalOpen(false)
      setSelectedCategory(null)
      toast.success('Category updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => cruiseCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruise-categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => cruiseCategoryService.toggleCategoryStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cruise-categories'] })
      toast.success('Category status updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status')
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

  const handleCreateCategory = async (categoryData: CreateCategoryData) => {
    await createCategoryMutation.mutateAsync(categoryData)
  }

  const handleUpdateCategory = async (categoryData: UpdateCategoryData) => {
    if (!selectedCategory) return
    await updateCategoryMutation.mutateAsync({ id: selectedCategory.id, data: categoryData })
  }

  const handleDeleteCategory = (category: CruiseCategory) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will not delete the cruises.`)) {
      deleteCategoryMutation.mutate(category.id)
    }
  }

  const handleToggleStatus = (category: CruiseCategory) => {
    toggleStatusMutation.mutate(category.id)
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const columns = [
    {
      key: 'displayOrder',
      header: 'Order',
      render: (displayOrder: number) => (
        <div className="flex items-center gap-2">
          <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-sm">{displayOrder}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Category',
      render: (_: any, category: CruiseCategory) => (
        <div className="flex items-center gap-3">
          {category.icon && <span className="text-2xl">{category.icon}</span>}
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (description: string) => (
        <div className="max-w-xs truncate text-sm text-gray-600">
          {description || '-'}
        </div>
      ),
    },
    {
      key: '_count',
      header: 'Cruises',
      render: (_count: any) => (
        <span className="badge badge-primary">
          {_count?.cruises || 0}
        </span>
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
      render: (_: any, category: CruiseCategory) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCategory(category)
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
              setSelectedCategory(category)
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
              handleToggleStatus(category)
            }}
            className={`${
              category.isActive ? 'text-warning-600 hover:text-warning-800' : 'text-success-600 hover:text-success-800'
            }`}
            title={category.isActive ? 'Deactivate' : 'Activate'}
            disabled={toggleStatusMutation.isPending}
          >
            {category.isActive ? '🔒' : '🔓'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteCategory(category)
            }}
            className="text-danger-600 hover:text-danger-800"
            title="Delete"
            disabled={deleteCategoryMutation.isPending}
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
          <h1 className="text-2xl font-bold text-gray-900">Cruise Categories</h1>
          <p className="text-gray-600">Organize cruises into categories for better navigation</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search categories..."
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
          data={categoriesData?.categories || []}
          loading={isLoading}
        />

        {categoriesData && (
          <Pagination
            currentPage={categoriesData.page || 1}
            totalPages={categoriesData.totalPages || 1}
            onPageChange={handlePageChange}
            totalItems={categoriesData.total || 0}
            itemsPerPage={categoriesData.limit || 10}
          />
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Category"
        size="lg"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createCategoryMutation.isPending}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        title="Edit Category"
        size="lg"
      >
        {selectedCategory && (
          <CategoryForm
            category={selectedCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedCategory(null)
            }}
            loading={updateCategoryMutation.isPending}
          />
        )}
      </Modal>

      {/* View Category Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedCategory(null)
        }}
        title="Category Details"
        size="lg"
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedCategory.icon && (
                <div className="text-6xl">{selectedCategory.icon}</div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h3>
                <p className="text-gray-500">{selectedCategory.slug}</p>
              </div>
              <span
                className={`badge ${
                  selectedCategory.isActive ? 'badge-success' : 'badge-danger'
                }`}
              >
                {selectedCategory.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {selectedCategory.description && (
              <div>
                <label className="label">Description</label>
                <p className="text-gray-900">{selectedCategory.description}</p>
              </div>
            )}

            {selectedCategory.image && (
              <div>
                <label className="label">Image</label>
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Display Order</label>
                <p className="text-gray-900 font-mono">{selectedCategory.displayOrder}</p>
              </div>
              <div>
                <label className="label">Cruises Count</label>
                <p className="text-gray-900">
                  <span className="badge badge-primary">
                    {selectedCategory._count?.cruises || 0} cruises
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="label">Created</label>
                <p className="text-gray-900">
                  {new Date(selectedCategory.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">Updated</label>
                <p className="text-gray-900">
                  {new Date(selectedCategory.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CruiseCategoriesPage