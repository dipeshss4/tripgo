import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Hotel } from '../../types'
import { CreateHotelData, UpdateHotelData } from '../../services/hotels'
import { MediaFile } from '../../services/media'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import Select from '../ui/Select'
import MediaPicker from '@/components/media/MediaPicker'
import { PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '../../utils/imageUtils'

interface HotelFormProps {
  hotel?: Hotel
  onSubmit: (data: CreateHotelData | UpdateHotelData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  renderActions?: (submit: () => void, cancel: () => void, loading: boolean) => React.ReactNode
}

interface RoomType {
  type: string
  price: number
  capacity: number
}

const HotelForm: React.FC<HotelFormProps> = ({
  hotel,
  onSubmit,
  onCancel,
  loading = false,
  renderActions,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    city: '',
    country: '',
    price: 0,
    isActive: true,
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { type: 'Standard Room', price: 100, capacity: 2 }
  ])

  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        location: hotel.location || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || '',
        price: hotel.price || 0,
        isActive: hotel.isActive,
      })

      setAmenities(hotel.amenities || [])
      setRoomTypes((hotel as any).roomTypes || [{ type: 'Standard Room', price: 100, capacity: 2 }])

      // Convert image URLs to MediaFile objects (for display purposes)
      if (hotel.images && hotel.images.length > 0) {
        const imageFiles: MediaFile[] = hotel.images.map((url, index) => ({
          id: `existing-${index}`,
          originalName: `image-${index}`,
          filename: url.split('/').pop() || `image-${index}`,
          path: url,
          mimetype: 'image/jpeg',
          size: 0,
          category: 'IMAGE' as const,
          tenantId: hotel.tenantId,
          uploadedBy: '',
          createdAt: '',
          updatedAt: '',
        }))
        setSelectedImages(imageFiles)
      }
    }
  }, [hotel])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      const imageUrls = selectedImages.map(img => getImageUrl(img.path))

      const submitData = {
        ...formData,
        images: imageUrls,
        amenities,
        roomTypes,
      }

      await onSubmit(submitData)
      toast.success(hotel ? 'Hotel updated successfully' : 'Hotel created successfully')
    } catch (error) {
      console.error('Error submitting hotel:', error)
      toast.error('Failed to save hotel')
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index))
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { type: '', price: 0, capacity: 2 }])
  }

  const updateRoomType = (index: number, field: keyof RoomType, value: string | number) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], [field]: value }
    setRoomTypes(updated)
  }

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((_, i) => i !== index))
    }
  }

  const handleImagesSelected = (files: MediaFile[]) => {
    setSelectedImages(files)
    setIsMediaPickerOpen(false)
  }

  return (
    <form id="hotel-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Hotel Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Price per Night"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          error={errors.price}
          required
        />
      </div>

      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
        error={errors.description}
        required
      />

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          error={errors.location}
          required
        />

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          error={errors.address}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          error={errors.city}
          required
        />

        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          error={errors.country}
          required
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={getImageUrl(image.path)}
                alt={`Hotel ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsMediaPickerOpen(true)}
          className="flex items-center gap-2"
        >
          <PhotoIcon className="w-4 h-4" />
          Select Images
        </Button>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add amenity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
          />
          <Button type="button" variant="outline" onClick={addAmenity}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Room Types */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Room Types
          </label>
          <Button type="button" variant="outline" onClick={addRoomType} size="sm">
            <PlusIcon className="w-4 h-4" />
            Add Room Type
          </Button>
        </div>
        <div className="space-y-4">
          {roomTypes.map((room, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  label="Room Type"
                  value={room.type}
                  onChange={(e) => updateRoomType(index, 'type', e.target.value)}
                  placeholder="e.g., Standard Room"
                />
              </div>
              <div className="w-32">
                <Input
                  label="Price"
                  type="number"
                  value={room.price}
                  onChange={(e) => updateRoomType(index, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-24">
                <Input
                  label="Capacity"
                  type="number"
                  value={room.capacity}
                  onChange={(e) => updateRoomType(index, 'capacity', parseInt(e.target.value) || 2)}
                />
              </div>
              {roomTypes.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRoomType(index)}
                  className="mb-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Active
        </label>
      </div>

      {/* Form Actions - only show if renderActions is not provided */}
      {!renderActions && (
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {hotel ? 'Update Hotel' : 'Create Hotel'}
          </Button>
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPicker
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleImagesSelected}
          multiple={true}
          selectedFiles={selectedImages}
          accept="image/*"
        />
      )}
    </form>
  )
}

export default HotelForm