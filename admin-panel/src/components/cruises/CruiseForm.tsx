import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Cruise, CruiseItinerary } from '../../types'
import { CreateCruiseData, UpdateCruiseData } from '../../services/cruises'
import { MediaFile } from '../../services/media'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import Select from '../ui/Select'
import MediaPicker from '@/components/media/MediaPickerStub'
import { PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface CruiseFormProps {
  cruise?: Cruise
  onSubmit: (data: CreateCruiseData | UpdateCruiseData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const CruiseForm: React.FC<CruiseFormProps> = ({
  cruise,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departure: '',
    destination: '',
    duration: 7,
    capacity: 100,
    price: 0,
    isActive: true,
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')

  const [itinerary, setItinerary] = useState<CruiseItinerary[]>([])

  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (cruise) {
      setFormData({
        name: cruise.name || '',
        description: cruise.description || '',
        departure: cruise.departure || '',
        destination: cruise.destination || '',
        duration: cruise.duration || 7,
        capacity: cruise.capacity || 100,
        price: cruise.price || 0,
        isActive: cruise.isActive ?? true,
      })
      setAmenities(cruise.amenities || [])
      setItinerary(Array.isArray(cruise.itinerary) ? cruise.itinerary : [])

      // Convert image URLs to MediaFile objects for existing cruises
      if (cruise.images && cruise.images.length > 0) {
        const imageFiles: MediaFile[] = cruise.images.map((imageUrl, index) => ({
          id: `existing-${index}`,
          filename: imageUrl.split('/').pop() || '',
          originalName: imageUrl.split('/').pop() || '',
          path: imageUrl,
          url: imageUrl,
          size: 0,
          mimetype: 'image/jpeg',
          category: 'IMAGE' as const,
          tags: [],
          uploadedBy: '',
          uploader: { firstName: '', lastName: '', email: '' },
          tenantId: '',
          createdAt: '',
          updatedAt: ''
        }))
        setSelectedImages(imageFiles)
      }
    }
  }, [cruise])

  const statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.description) newErrors.description = 'Description is required'
    if (!formData.departure) newErrors.departure = 'Departure port is required'
    if (!formData.destination) newErrors.destination = 'Destination is required'
    if (formData.duration < 1) newErrors.duration = 'Duration must be at least 1 day'
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'
    if (formData.price < 0) newErrors.price = 'Price must be positive'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        amenities,
        itinerary,
        images: selectedImages.map(image => image.url),
      }

      await onSubmit(submitData)
      toast.success(cruise ? 'Cruise updated successfully' : 'Cruise created successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save cruise')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 :
              name === 'isActive' ? value === 'true' : value,
    }))
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

  const addItineraryDay = () => {
    const newDay: CruiseItinerary = {
      day: itinerary.length + 1,
      port: '',
      arrival: '',
      departure: '',
      activities: [],
    }
    setItinerary([...itinerary, newDay])
  }

  const updateItineraryDay = (index: number, field: keyof CruiseItinerary, value: any) => {
    const updated = [...itinerary]
    updated[index] = { ...updated[index], [field]: value }
    setItinerary(updated)
  }

  const removeItineraryDay = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index))
  }

  const handleMediaSelect = (files: MediaFile[]) => {
    setSelectedImages(files)
    setIsMediaPickerOpen(false)
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Cruise Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter cruise name"
        />

        <Select
          label="Status"
          name="isActive"
          value={formData.isActive?.toString() ?? 'true'}
          onChange={handleChange}
          options={statusOptions}
        />
      </div>

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Enter cruise description"
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Departure Port"
          name="departure"
          value={formData.departure}
          onChange={handleChange}
          error={errors.departure}
          placeholder="e.g., Miami, FL"
        />

        <Input
          label="Destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          error={errors.destination}
          placeholder="e.g., Caribbean Islands"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Duration (days)"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          min="1"
        />

        <Input
          label="Capacity (passengers)"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          min="1"
        />

        <Input
          label="Price ($)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          min="0"
          step="0.01"
        />
      </div>

      {/* Images Section */}
      <div>
        <label className="label">Cruise Images</label>
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsMediaPickerOpen(true)}
            className="flex items-center gap-2"
          >
            <PhotoIcon className="h-4 w-4" />
            {selectedImages.length > 0 ? 'Change Images' : 'Select Images'}
          </Button>

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.alt || image.originalName}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {image.originalName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <label className="label">Amenities</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add amenity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
          />
          <Button type="button" onClick={addAmenity} size="sm">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(index)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Itinerary Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="label">Itinerary</label>
          <Button type="button" onClick={addItineraryDay} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Day
          </Button>
        </div>

        <div className="space-y-4">
          {Array.isArray(itinerary) && itinerary.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-danger-600 hover:text-danger-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Port"
                  value={day.port}
                  onChange={(e) => updateItineraryDay(index, 'port', e.target.value)}
                  placeholder="Port name"
                />
                <Input
                  label="Arrival"
                  value={day.arrival}
                  onChange={(e) => updateItineraryDay(index, 'arrival', e.target.value)}
                  placeholder="e.g., 08:00 AM"
                />
                <Input
                  label="Departure"
                  value={day.departure}
                  onChange={(e) => updateItineraryDay(index, 'departure', e.target.value)}
                  placeholder="e.g., 06:00 PM"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {cruise ? 'Update Cruise' : 'Create Cruise'}
        </Button>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={true}
        acceptedTypes={['IMAGE']}
        title="Select Cruise Images"
      />
    </form>
  )
}

export default CruiseForm