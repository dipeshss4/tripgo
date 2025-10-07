import React from 'react'

// Stub MediaPicker component for production builds
// This ensures imports never fail even if the main MediaPicker has issues

export interface MediaFile {
  id: string
  originalName: string
  filename: string
  path: string
  url?: string
  mimetype: string
  size: number
  category: string
  tags?: string[]
  tenantId?: string
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
  uploader?: {
    id?: string
    firstName: string
    lastName: string
    email?: string
  }
}

export interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: MediaFile[]) => void
  multiple?: boolean
  accept?: string
  selectedFiles?: MediaFile[]
  acceptedTypes?: string[]
  title?: string
}

const MediaPickerStub: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Media Picker (Stub)</h3>
        <p className="text-gray-600 mb-4">
          Media picker functionality will be available after full deployment.
          For now, you can continue with other operations.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onSelect([])}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaPickerStub