import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MediaFile } from '../../services/media'
import mediaService from '../../services/media'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ArchiveBoxIcon,
  MusicalNoteIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: MediaFile[]) => void
  multiple?: boolean
  acceptedTypes?: string[]
  title?: string
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  acceptedTypes = ['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'ARCHIVE'],
  title = 'Select Media'
}) => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 20,
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media-picker', query],
    queryFn: () => mediaService.getMediaFiles(query),
    enabled: isOpen,
  })

  const categoryOptions = [
    { value: '', label: 'All Types' },
    ...acceptedTypes.map(type => ({
      value: type,
      label: type.charAt(0) + type.slice(1).toLowerCase() + 's'
    }))
  ]

  const handleSearch = (search: string) => {
    setQuery(prev => ({ ...prev, search, page: 1 }))
  }

  const handleCategoryFilter = (category: string) => {
    setQuery(prev => ({ ...prev, category: category || '', page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }

  const handleFileSelect = (file: MediaFile) => {
    if (!acceptedTypes.includes(file.category)) return

    if (multiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.find(f => f.id === file.id)
        if (isSelected) {
          return prev.filter(f => f.id !== file.id)
        } else {
          return [...prev, file]
        }
      })
    } else {
      setSelectedFiles([file])
    }
  }

  const handleSelectAll = () => {
    const validFiles = mediaData?.files.filter(file =>
      acceptedTypes.includes(file.category)
    ) || []

    if (selectedFiles.length === validFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(validFiles)
    }
  }

  const handleConfirm = () => {
    onSelect(selectedFiles)
    setSelectedFiles([])
    onClose()
  }

  const handleCancel = () => {
    setSelectedFiles([])
    onClose()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IMAGE': return <PhotoIcon className="h-4 w-4" />
      case 'VIDEO': return <VideoCameraIcon className="h-4 w-4" />
      case 'DOCUMENT': return <DocumentIcon className="h-4 w-4" />
      case 'AUDIO': return <MusicalNoteIcon className="h-4 w-4" />
      case 'ARCHIVE': return <ArchiveBoxIcon className="h-4 w-4" />
      default: return <DocumentIcon className="h-4 w-4" />
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

  const isFileSelected = (file: MediaFile) => {
    return selectedFiles.find(f => f.id === file.id) !== undefined
  }

  const isFileAccepted = (file: MediaFile) => {
    return acceptedTypes.includes(file.category)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="xl"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={query.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            options={categoryOptions}
            value={query.category}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="sm:w-48"
          />
        </div>

        {/* Selection Info */}
        {multiple && (
          <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <span>
              {selectedFiles.length} file(s) selected
            </span>
            {mediaData?.files && (
              <button
                onClick={handleSelectAll}
                className="text-primary-600 hover:text-primary-700"
              >
                {selectedFiles.length === mediaData.files.filter(f => isFileAccepted(f)).length ?
                  'Deselect All' : 'Select All'
                }
              </button>
            )}
          </div>
        )}

        {/* File Grid */}
        <div className="border rounded-lg p-4" style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {mediaData?.files && mediaData.files.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {mediaData.files.map((file) => {
                    const isSelected = isFileSelected(file)
                    const isAccepted = isFileAccepted(file)

                    return (
                      <div
                        key={file.id}
                        className={`relative group card p-2 cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary-500' : ''
                        } ${
                          !isAccepted ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => isAccepted && handleFileSelect(file)}
                      >
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 z-10 bg-primary-600 text-white rounded-full p-1">
                            <CheckIcon className="h-3 w-3" />
                          </div>
                        )}

                        {/* File Preview */}
                        <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-1">
                          {mediaService.isImage(file) ? (
                            <img
                              src={mediaService.getThumbnailUrl(file)}
                              alt={file.alt || file.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className={`p-2 rounded ${getCategoryColor(file.category)}`}>
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
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
                          {file.category.slice(0, 3)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}

              {/* Load More / Pagination */}
              {mediaData && mediaData.pagination.page < mediaData.pagination.pages && (
                <div className="text-center mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(query.page + 1)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedFiles.length === 0}
          >
            Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MediaPicker