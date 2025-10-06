const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Extract the base URL without /api suffix for static files
const getBackendBaseUrl = () => {
  return API_BASE_URL.replace('/api', '')
}

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If it starts with /uploads, it's a backend static file path
  if (imagePath.startsWith('/uploads/')) {
    return `${getBackendBaseUrl()}${imagePath}`
  }

  // If it doesn't start with /, add it and prepend uploads
  if (!imagePath.startsWith('/')) {
    return `${getBackendBaseUrl()}/uploads/${imagePath}`
  }

  // Default case - prepend backend base URL
  return `${getBackendBaseUrl()}${imagePath}`
}

export const getImageThumbnailUrl = (imagePath: string): string => {
  const fullUrl = getImageUrl(imagePath)

  // If it's already a thumbnail, return as is
  if (fullUrl.includes('_thumb.')) {
    return fullUrl
  }

  // Generate thumbnail URL by inserting _thumb before file extension
  const lastDotIndex = fullUrl.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return fullUrl // No extension found, return original
  }

  return fullUrl.slice(0, lastDotIndex) + '_thumb' + fullUrl.slice(lastDotIndex)
}

export default {
  getImageUrl,
  getImageThumbnailUrl,
}