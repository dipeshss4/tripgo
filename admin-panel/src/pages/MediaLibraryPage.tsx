import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { MediaFile, MediaQuery } from '../services/media'
import mediaService from '../services/media'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ArchiveBoxIcon,
  MusicalNoteIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

const MediaLibraryPage: React.FC = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState<MediaQuery>({
    page: 1,
    limit: 20,
    category: '',
    search: '',
    folder: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    alt: '',
    folder: '',
    tags: [] as string[]
  })

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadMetadata, setUploadMetadata] = useState({
    folder: '',
    tags: [] as string[],
    description: ''
  })

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media', query],
    queryFn: () => mediaService.getMediaFiles(query),
  })

  const { data: folders } = useQuery({
    queryKey: ['media-folders'],
    queryFn: () => mediaService.getFolders(),
  })

  const { data: stats } = useQuery({
    queryKey: ['media-stats'],
    queryFn: () => mediaService.getMediaStats(),
  })

  const uploadMutation = useMutation({
    mutationFn: (data: { files: File[], metadata: any }) =>
      mediaService.uploadFiles(data.files, data.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      setIsUploadModalOpen(false)
      setUploadFiles([])
      setUploadMetadata({ folder: '', tags: [], description: '' })
      toast.success('Files uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Upload failed')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      mediaService.updateMediaFile(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setIsEditModalOpen(false)
      setSelectedFile(null)
      toast.success('File updated successfully')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaService.deleteMediaFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      toast.success('File deleted successfully')
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (fileIds: string[]) => mediaService.bulkDeleteFiles(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      setSelectedFiles([])
      toast.success('Files deleted successfully')
    }
  })

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'IMAGE', label: 'Images' },
    { value: 'VIDEO', label: 'Videos' },
    { value: 'DOCUMENT', label: 'Documents' },
    { value: 'AUDIO', label: 'Audio' },
    { value: 'ARCHIVE', label: 'Archives' },
    { value: 'OTHER', label: 'Other' },
  ]

  const folderOptions = [
    { value: '', label: 'All Folders' },
    ...(folders || []).map(folder => ({ value: folder, label: folder }))
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'originalName', label: 'Name' },
    { value: 'size', label: 'Size' },
    { value: 'category', label: 'Type' },
  ]

  const handleSearch = (search: string) => {
    setQuery(prev => ({ ...prev, search, page: 1 }))
  }

  const handleCategoryFilter = (category: string) => {
    setQuery(prev => ({ ...prev, category: category || undefined, page: 1 }))
  }

  const handleFolderFilter = (folder: string) => {
    setQuery(prev => ({ ...prev, folder: folder || undefined, page: 1 }))
  }

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setQuery(prev => ({ ...prev, sortBy: field, sortOrder: order }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === mediaData?.files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(mediaData?.files.map(f => f.id) || [])
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadFiles(files)
    setIsUploadModalOpen(true)
  }

  const handleUploadSubmit = () => {
    if (uploadFiles.length === 0) return
    uploadMutation.mutate({ files: uploadFiles, metadata: uploadMetadata })
  }

  const handleEditFile = (file: MediaFile) => {
    setSelectedFile(file)
    setEditFormData({
      title: file.title || '',
      description: file.description || '',
      alt: file.alt || '',
      folder: file.folder || '',
      tags: file.tags || []
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = () => {
    if (!selectedFile) return
    updateMutation.mutate({ id: selectedFile.id, updates: editFormData })
  }

  const handleViewFile = (file: MediaFile) => {
    setSelectedFile(file)
    setIsViewModalOpen(true)
  }

  const handleDeleteFile = (file: MediaFile) => {
    if (window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteMutation.mutate(file.id)
    }
  }

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      bulkDeleteMutation.mutate(selectedFiles)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IMAGE': return <PhotoIcon className="h-5 w-5" />
      case 'VIDEO': return <VideoCameraIcon className="h-5 w-5" />
      case 'DOCUMENT': return <DocumentIcon className="h-5 w-5" />
      case 'AUDIO': return <MusicalNoteIcon className="h-5 w-5" />
      case 'ARCHIVE': return <ArchiveBoxIcon className="h-5 w-5" />
      default: return <DocumentIcon className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IMAGE': return 'text-green-600 bg-green-100'
      case 'VIDEO': return 'text-blue-600 bg-blue-100'
      case 'DOCUMENT': return 'text-gray-600 bg-gray-100'
      case 'AUDIO': return 'text-purple-600 bg-purple-100'
      case 'ARCHIVE': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your media files and assets</p>
        </div>
        <div className="flex gap-3">
          {selectedFiles.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </Button>
          )}
          <Button onClick={handleFileUpload}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <FolderIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaService.formatFileSize(stats.totalSize)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center">
              <PhotoIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byCategory.find(c => c.category === 'IMAGE')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center">
              <VideoCameraIcon className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byCategory.find(c => c.category === 'VIDEO')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={query.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={categoryOptions}
            value={query.category || ''}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={folderOptions}
            value={query.folder || ''}
            onChange={(e) => handleFolderFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={sortOptions}
            value={query.sortBy || 'createdAt'}
            onChange={(e) => handleSortChange(e.target.value, query.sortOrder || 'desc')}
            className="w-48"
          />
        </div>

        {/* File Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Select All */}
            {mediaData?.files && mediaData.files.length > 0 && (
              <div className="flex items-center mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === mediaData.files.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Select all ({mediaData.files.length} files)
                  </span>
                </label>
              </div>
            )}

            {/* File Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaData?.files.map((file) => (
                <div
                  key={file.id}
                  className={`relative group card p-3 cursor-pointer transition-all ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>

                  {/* File Preview */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {mediaService.isImage(file) ? (
                      <img
                        src={mediaService.getThumbnailUrl(file)}
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`p-3 rounded-lg ${getCategoryColor(file.category)}`}>
                          {getCategoryIcon(file.category)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mediaService.formatFileSize(file.size)}
                    </p>
                    {file.folder && (
                      <p className="text-xs text-gray-400 truncate">
                        📁 {file.folder}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewFile(file)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditFile(file)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-2 bg-white rounded-full text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {mediaData?.files.length === 0 && (
              <div className="text-center py-12">
                <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-500 mb-4">Upload your first media file to get started</p>
                <Button onClick={handleFileUpload}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {mediaData && mediaData.pagination.pages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={mediaData.pagination.page}
              totalPages={mediaData.pagination.pages}
              onPageChange={handlePageChange}
              totalItems={mediaData.pagination.total}
              itemsPerPage={mediaData.pagination.limit}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Files"
        size="lg"
      >
        <div className="space-y-4">
          {/* Selected Files */}
          {uploadFiles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Selected Files ({uploadFiles.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-500">{mediaService.formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Metadata */}
          <div className="space-y-4">
            <Input
              label="Folder (optional)"
              value={uploadMetadata.folder}
              onChange={(e) => setUploadMetadata(prev => ({ ...prev, folder: e.target.value }))}
              placeholder="Enter folder name"
            />
            <Input
              label="Description (optional)"
              value={uploadMetadata.description}
              onChange={(e) => setUploadMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              loading={uploadMutation.isPending}
              disabled={uploadFiles.length === 0}
            >
              Upload {uploadFiles.length} File(s)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit File"
        size="lg"
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {mediaService.isImage(selectedFile) ? (
                  <img
                    src={mediaService.getThumbnailUrl(selectedFile)}
                    alt={selectedFile.alt || selectedFile.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`p-2 rounded ${getCategoryColor(selectedFile.category)}`}>
                      {getCategoryIcon(selectedFile.category)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedFile.originalName}</h3>
                <p className="text-sm text-gray-500">
                  {selectedFile.category} • {mediaService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
              />
              <Input
                label="Alt Text (for images)"
                value={editFormData.alt}
                onChange={(e) => setEditFormData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Enter alt text"
              />
              <Input
                label="Description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
              <Input
                label="Folder"
                value={editFormData.folder}
                onChange={(e) => setEditFormData(prev => ({ ...prev, folder: e.target.value }))}
                placeholder="Enter folder name"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="File Details"
        size="xl"
      >
        {selectedFile && (
          <div className="space-y-4">
            {/* File Preview */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {mediaService.isImage(selectedFile) ? (
                <img
                  src={mediaService.getFileUrl(selectedFile)}
                  alt={selectedFile.alt || selectedFile.originalName}
                  className="w-full max-h-96 object-contain"
                />
              ) : mediaService.isVideo(selectedFile) ? (
                <video
                  src={mediaService.getFileUrl(selectedFile)}
                  controls
                  className="w-full max-h-96"
                />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className={`p-6 rounded-lg ${getCategoryColor(selectedFile.category)}`}>
                    {getCategoryIcon(selectedFile.category)}
                  </div>
                </div>
              )}
            </div>

            {/* File Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">File Name</label>
                <p className="text-gray-900">{selectedFile.originalName}</p>
              </div>
              <div>
                <label className="label">Size</label>
                <p className="text-gray-900">{mediaService.formatFileSize(selectedFile.size)}</p>
              </div>
              <div>
                <label className="label">Type</label>
                <p className="text-gray-900">{selectedFile.category}</p>
              </div>
              <div>
                <label className="label">Uploaded</label>
                <p className="text-gray-900">
                  {new Date(selectedFile.createdAt).toLocaleDateString()}
                </p>
              </div>
              {selectedFile.width && selectedFile.height && (
                <div>
                  <label className="label">Dimensions</label>
                  <p className="text-gray-900">{selectedFile.width} × {selectedFile.height}px</p>
                </div>
              )}
              {selectedFile.folder && (
                <div>
                  <label className="label">Folder</label>
                  <p className="text-gray-900">{selectedFile.folder}</p>
                </div>
              )}
            </div>

            {selectedFile.description && (
              <div>
                <label className="label">Description</label>
                <p className="text-gray-900">{selectedFile.description}</p>
              </div>
            )}

            {selectedFile.tags.length > 0 && (
              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />
    </div>
  )
}

export default MediaLibraryPage