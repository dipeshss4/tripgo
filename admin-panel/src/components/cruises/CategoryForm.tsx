import React, { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import { CruiseCategory, CreateCategoryData, UpdateCategoryData } from '../../services/cruiseCategories'

interface CategoryFormProps {
  category?: CruiseCategory
  onSubmit: (data: CreateCategoryData | UpdateCategoryData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        icon: category.icon || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      })
    }
  }, [category])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))

    // Auto-generate slug from name
    if (name === 'name' && !category) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = 'Display order must be 0 or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="label" htmlFor="name">
          Category Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Australian Cruises"
          error={errors.name}
          disabled={loading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="label" htmlFor="slug">
          Slug <span className="text-red-500">*</span>
        </label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="australian-cruises"
          error={errors.slug}
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          URL-friendly identifier (lowercase, no spaces)
        </p>
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <TextArea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Brief description of this category..."
          disabled={loading}
        />
      </div>

      {/* Icon */}
      <div>
        <label className="label" htmlFor="icon">
          Icon Emoji
        </label>
        <Input
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={handleInputChange}
          placeholder="🦘"
          maxLength={10}
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Single emoji to represent this category (e.g., 🦘 🏝️ 🍝 ❄️)
        </p>
        {formData.icon && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Preview:</span>
            <span className="text-4xl">{formData.icon}</span>
          </div>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="label" htmlFor="image">
          Image URL
        </label>
        <Input
          id="image"
          name="image"
          type="url"
          value={formData.image}
          onChange={handleInputChange}
          placeholder="https://example.com/category-image.jpg"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional banner image for the category
        </p>
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Display Order */}
      <div>
        <label className="label" htmlFor="displayOrder">
          Display Order
        </label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min="0"
          value={formData.displayOrder.toString()}
          onChange={handleInputChange}
          placeholder="0"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first (0 = highest priority)
        </p>
        {errors.displayOrder && <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active (visible on frontend)
        </label>
      </div>

      {/* Form Actions */}
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
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}

export default CategoryForm