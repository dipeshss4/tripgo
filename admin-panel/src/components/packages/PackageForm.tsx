import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Package, PackageItinerary } from '../../types'
import { CreatePackageData, UpdatePackageData } from '../../services/packages'
import { MediaFile } from '../../services/media'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import MediaPicker from '@/components/media/MediaPickerStub'
import { PlusIcon, XMarkIcon, PhotoIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '../../utils/imageUtils'

interface PackageFormProps {
  package?: Package
  onSubmit: (data: CreatePackageData | UpdatePackageData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  renderActions?: (submit: () => void, cancel: () => void, loading: boolean) => React.ReactNode
}

const PackageForm: React.FC<PackageFormProps> = ({
  package: packageData,
  onSubmit,
  onCancel,
  loading = false,
  renderActions,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 7,
    price: 0,
    isActive: true,
  })

  const [inclusions, setInclusions] = useState<string[]>([])
  const [newInclusion, setNewInclusion] = useState('')

  const [exclusions, setExclusions] = useState<string[]>([])
  const [newExclusion, setNewExclusion] = useState('')

  const [destinations, setDestinations] = useState<string[]>([])
  const [newDestination, setNewDestination] = useState('')

  const [itinerary, setItinerary] = useState<PackageItinerary[]>([])

  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([])
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || '',
        description: packageData.description || '',
        duration: packageData.duration || 7,
        price: packageData.price || 0,
        isActive: packageData.isActive,
      })

      setInclusions(packageData.inclusions || [])
      setExclusions(packageData.exclusions || [])
      setDestinations((packageData as any).destinations || [])
      setItinerary(packageData.itinerary || [])

      // Convert image URLs to MediaFile objects (for display purposes)
      if (packageData.images && packageData.images.length > 0) {
        const imageFiles: MediaFile[] = packageData.images.map((url, index) => ({
          id: `existing-${index}`,
          originalName: `image-${index}`,
          filename: url.split('/').pop() || `image-${index}`,
          path: url,
          mimetype: 'image/jpeg',
          size: 0,
          category: 'IMAGE' as const,
          tenantId: packageData.tenantId,
          uploadedBy: '',
          createdAt: '',
          updatedAt: '',
        }))
        setSelectedImages(imageFiles)
      }
    }
  }, [packageData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0'
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
        inclusions,
        exclusions,
        destinations,
        itinerary,
      }

      await onSubmit(submitData)
      toast.success(packageData ? 'Package updated successfully' : 'Package created successfully')
    } catch (error) {
      console.error('Error submitting package:', error)
      toast.error('Failed to save package')
    }
  }

  const addInclusion = () => {
    if (newInclusion.trim() && !inclusions.includes(newInclusion.trim())) {
      setInclusions([...inclusions, newInclusion.trim()])
      setNewInclusion('')
    }
  }

  const removeInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index))
  }

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusions.includes(newExclusion.trim())) {
      setExclusions([...exclusions, newExclusion.trim()])
      setNewExclusion('')
    }
  }

  const removeExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index))
  }

  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations([...destinations, newDestination.trim()])
      setNewDestination('')
    }
  }

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index))
  }

  const addItineraryDay = () => {
    const newDay: PackageItinerary = {
      day: itinerary.length + 1,
      title: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: '',
    }
    setItinerary([...itinerary, newDay])
  }

  const updateItineraryDay = (index: number, field: keyof PackageItinerary, value: any) => {
    const updated = [...itinerary]
    updated[index] = { ...updated[index], [field]: value }
    setItinerary(updated)
  }

  const removeItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index)
    // Renumber days
    updated.forEach((day, i) => {
      day.day = i + 1
    })
    setItinerary(updated)
  }

  const handleImagesSelected = (files: MediaFile[]) => {
    setSelectedImages(files)
    setIsMediaPickerOpen(false)
  }

  return (
    <form id="package-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Package Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Input
          label="Price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          error={errors.price}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Duration (days)"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
          error={errors.duration}
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
                alt={`Package ${index + 1}`}
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

      {/* Destinations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinations
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
            placeholder="Add destination"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
          />
          <Button type="button" variant="outline" onClick={addDestination}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {destinations.map((destination, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {destination}
              <button
                type="button"
                onClick={() => removeDestination(index)}
                className="text-green-600 hover:text-green-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Inclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Inclusions
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newInclusion}
            onChange={(e) => setNewInclusion(e.target.value)}
            placeholder="Add inclusion"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
          />
          <Button type="button" variant="outline" onClick={addInclusion}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {inclusions.map((inclusion, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {inclusion}
              <button
                type="button"
                onClick={() => removeInclusion(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Exclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exclusions
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
            placeholder="Add exclusion"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
          />
          <Button type="button" variant="outline" onClick={addExclusion}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {exclusions.map((exclusion, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              {exclusion}
              <button
                type="button"
                onClick={() => removeExclusion(index)}
                className="text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Itinerary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Itinerary
          </label>
          <Button type="button" variant="outline" onClick={addItineraryDay} size="sm">
            <PlusIcon className="w-4 h-4" />
            Add Day
          </Button>
        </div>
        <div className="space-y-4">
          {itinerary.map((day, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Day {day.day}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItineraryDay(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  value={day.title}
                  onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                  placeholder="Day title"
                />
                <Input
                  label="Accommodation"
                  value={day.accommodation}
                  onChange={(e) => updateItineraryDay(index, 'accommodation', e.target.value)}
                  placeholder="Hotel/accommodation"
                />
              </div>
              <div className="mt-4">
                <TextArea
                  label="Description"
                  value={day.description}
                  onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                  rows={2}
                  placeholder="Day description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activities (comma-separated)
                  </label>
                  <Input
                    value={day.activities.join(', ')}
                    onChange={(e) => updateItineraryDay(index, 'activities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Activity 1, Activity 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meals (comma-separated)
                  </label>
                  <Input
                    value={day.meals.join(', ')}
                    onChange={(e) => updateItineraryDay(index, 'meals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Breakfast, Lunch"
                  />
                </div>
              </div>
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
            {packageData ? 'Update Package' : 'Create Package'}
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

export default PackageForm