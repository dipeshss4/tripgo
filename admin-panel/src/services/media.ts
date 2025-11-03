import api from './api';
import { getImageUrl } from '../utils/imageUtils';

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'ARCHIVE' | 'OTHER';
  alt?: string;
  title?: string;
  description?: string;
  tags: string[];
  folder?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isYouTube?: boolean;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  uploadedBy: string;
  uploader: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFilesResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Array<{
    category: string;
    count: number;
    size: number;
  }>;
}

export interface MediaQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  folder?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UploadFileData {
  title?: string;
  description?: string;
  alt?: string;
  folder?: string;
  tags?: string[];
}

export interface UpdateFileData {
  title?: string;
  description?: string;
  alt?: string;
  folder?: string;
  tags?: string[];
}

class MediaService {
  // Get media files with filtering and pagination
  async getMediaFiles(query: MediaQuery = {}): Promise<MediaFilesResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.category) params.append('category', query.category);
    if (query.search) params.append('search', query.search);
    if (query.folder) params.append('folder', query.folder);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/media?${params.toString()}`);
    return response.data.data;
  }

  // Get single media file
  async getMediaFile(id: string): Promise<MediaFile> {
    const response = await api.get(`/media/${id}`);
    return response.data.data;
  }

  // Upload single file
  async uploadFile(file: File, data: UploadFileData = {}): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);

    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.alt) formData.append('alt', data.alt);
    if (data.folder) formData.append('folder', data.folder);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Upload multiple files
  async uploadFiles(files: File[], data: UploadFileData = {}): Promise<{
    savedFiles: MediaFile[];
    failedFiles: Array<{ filename: string; error: string }>;
  }> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    if (data.description) formData.append('description', data.description);
    if (data.folder) formData.append('folder', data.folder);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    const response = await api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Update media file metadata
  async updateMediaFile(id: string, data: UpdateFileData): Promise<MediaFile> {
    const response = await api.put(`/media/${id}`, data);
    return response.data.data;
  }

  // Delete media file
  async deleteMediaFile(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  }

  // Bulk delete files
  async bulkDeleteFiles(fileIds: string[]): Promise<{ deletedCount: number }> {
    const response = await api.delete('/media/bulk', {
      data: { fileIds }
    });
    return response.data.data;
  }

  // Get media statistics
  async getMediaStats(): Promise<MediaStats> {
    const response = await api.get('/media/stats');
    return response.data.data;
  }

  // Get folders
  async getFolders(): Promise<string[]> {
    const response = await api.get('/media/folders');
    return response.data.data;
  }

  // Get file URL for display
  getFileUrl(file: MediaFile): string {
    return getImageUrl(file.url || file.path);
  }

  // Get thumbnail URL for images
  getThumbnailUrl(file: MediaFile): string {
    const thumbnailPath = file.thumbnailUrl || file.path || file.url;
    return getImageUrl(thumbnailPath);
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type icon based on category
  getFileTypeIcon(file: MediaFile): string {
    switch (file.category) {
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO':
        return '🎥';
      case 'AUDIO':
        return '🎵';
      case 'DOCUMENT':
        return '📄';
      case 'ARCHIVE':
        return '📦';
      default:
        return '📁';
    }
  }

  // Check if file is an image
  isImage(file: MediaFile): boolean {
    return file.category === 'IMAGE';
  }

  // Check if file is a video
  isVideo(file: MediaFile): boolean {
    return file.category === 'VIDEO';
  }

  // Check if file is viewable in browser
  isViewable(file: MediaFile): boolean {
    return this.isImage(file) || this.isVideo(file) || file.mimetype === 'application/pdf';
  }

  // Check if file is a YouTube video
  isYouTubeVideo(file: MediaFile): boolean {
    return file.isYouTube === true;
  }

  // Import YouTube video
  async importYouTubeVideo(data: {
    youtubeUrl: string;
    title?: string;
    description?: string;
    tags?: string[];
    folder?: string;
  }): Promise<MediaFile> {
    const response = await api.post('/media/import-youtube', data);
    return response.data.data;
  }
}

export const mediaService = new MediaService();
export default mediaService;