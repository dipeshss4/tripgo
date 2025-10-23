import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import BlogForm from '../components/blog/BlogForm'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category?: string
  tags: string[]
  published: boolean
  publishedAt?: string
  viewCount: number
  author: {
    id: string
    firstName: string
    lastName: string
  }
  _count: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

interface BlogQuery {
  page: number
  limit: number
  search?: string
  published?: boolean
  category?: string
}

const BlogPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [query, setQuery] = useState<BlogQuery>({
    page: 1,
    limit: 10,
    search: '',
    published: undefined,
  })

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  const fetchBlogs = async (query: BlogQuery) => {
    const params = new URLSearchParams({
      page: query.page.toString(),
      limit: query.limit.toString(),
    })

    if (query.search) params.append('search', query.search)
    if (query.published !== undefined) params.append('published', query.published.toString())
    if (query.category) params.append('category', query.category)

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/api/blog/admin/all?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch blogs')
    }

    const data = await response.json()
    return data.data
  }

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs', query],
    queryFn: () => fetchBlogs(query),
  })

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/blog/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete blog')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/blog/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ published }),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog status updated')
    },
    onError: () => {
      toast.error('Failed to update blog status')
    },
  })

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setQuery((prev) => ({
      ...prev,
      published: status === '' ? undefined : status === 'true',
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsEditModalOpen(true)
  }

  const handleDeleteBlog = (blog: Blog) => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      deleteBlogMutation.mutate(blog.id)
    }
  }

  const handleTogglePublish = (blog: Blog) => {
    togglePublishMutation.mutate({ id: blog.id, published: !blog.published })
  }

  const handleViewBlog = (blog: Blog) => {
    window.open(`http://localhost:3001/blog/${blog.slug}`, '_blank')
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Published' },
    { value: 'false', label: 'Draft' },
  ]

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (_: any, blog: Blog) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{blog.title}</div>
          {blog.excerpt && (
            <div className="text-sm text-gray-500 line-clamp-1">{blog.excerpt}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (category?: string) => category || 'Uncategorized',
    },
    {
      key: 'author',
      header: 'Author',
      render: (_: any, blog: Blog) => `${blog.author.firstName} ${blog.author.lastName}`,
    },
    {
      key: 'published',
      header: 'Status',
      render: (published: boolean) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'viewCount',
      header: 'Views',
      render: (viewCount: number) => viewCount.toLocaleString(),
    },
    {
      key: '_count',
      header: 'Comments',
      render: (_: any, blog: Blog) => blog._count.comments,
    },
    {
      key: 'publishedAt',
      header: 'Published Date',
      render: (publishedAt?: string) =>
        publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Not published',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, blog: Blog) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewBlog(blog)}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEditBlog(blog)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleTogglePublish(blog)}
            className={`${
              blog.published ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
            }`}
            title={blog.published ? 'Unpublish' : 'Publish'}
          >
            {blog.published ? (
              <XCircleIcon className="h-5 w-5" />
            ) : (
              <CheckCircleIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => handleDeleteBlog(blog)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Management</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          Create Blog Post
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search blogs..."
            value={query.search}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />
        </div>
        <div className="w-48">
          <Select
            value={query.published === undefined ? '' : query.published.toString()}
            onChange={(e) => handleStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <Table columns={columns} data={blogsData?.blogs || []} />
          {blogsData?.pagination && (
            <Pagination
              currentPage={blogsData.pagination.page}
              totalPages={blogsData.pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Blog Post"
      >
        <BlogForm
          onSubmit={() => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] })
            setIsCreateModalOpen(false)
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBlog(null)
        }}
        title="Edit Blog Post"
      >
        {selectedBlog && (
          <BlogForm
            blog={selectedBlog}
            onSubmit={() => {
              queryClient.invalidateQueries({ queryKey: ['blogs'] })
              setIsEditModalOpen(false)
              setSelectedBlog(null)
            }}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedBlog(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default BlogPage
