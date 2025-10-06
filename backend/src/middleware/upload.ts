import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createError } from './errorHandler';
import { AuthRequest } from './auth';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File type validation with expanded support
const imageTypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/;
const videoTypes = /mp4|avi|mov|wmv|flv|webm|mkv|3gp/;
const documentTypes = /pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv|rtf/;
const audioTypes = /mp3|wav|ogg|flac|aac|m4a/;
const archiveTypes = /zip|rar|7z|tar|gz|bz2/;

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const authReq = req as AuthRequest;
    const tenantId = authReq.tenantId || 'default';

    // Create tenant-specific directory
    const tenantDir = path.join(uploadsDir, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    // Determine category based on file type
    const ext = path.extname(file.originalname).toLowerCase();
    let category = 'other';

    if (imageTypes.test(ext)) category = 'images';
    else if (videoTypes.test(ext)) category = 'videos';
    else if (documentTypes.test(ext)) category = 'documents';
    else if (audioTypes.test(ext)) category = 'audio';
    else if (archiveTypes.test(ext)) category = 'archives';

    // Create category-specific subdirectory
    const categoryDir = path.join(tenantDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    cb(null, categoryDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp and random suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = new RegExp([
    imageTypes.source,
    videoTypes.source,
    documentTypes.source,
    audioTypes.source,
    archiveTypes.source
  ].join('|'));

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(createError(`File type ${ext} is not allowed. Only images, videos, documents, audio, and archive files are supported.`, 400));
  }
};

// Basic upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 10 // Maximum 10 files at once
  }
});

// Specific upload configurations
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 3 },
  { name: 'documents', maxCount: 5 }
]);

// Image-only upload
export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: 'uploads/images',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (imageTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(createError('Only image files are allowed', 400));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for images
});

// Video-only upload
export const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: 'uploads/videos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (videoTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(createError('Only video files are allowed', 400));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
});

// Document-only upload
export const uploadDocument = multer({
  storage: multer.diskStorage({
    destination: 'uploads/documents',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (documentTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(createError('Only document files are allowed', 400));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB for documents
});

// Utility function to get file category
export const getFileCategory = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('video/')) return 'VIDEO';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z') ||
      mimetype.includes('tar') || mimetype.includes('gzip') || mimetype.includes('bzip')) {
    return 'ARCHIVE';
  }
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation') || mimetype.includes('text') || mimetype.includes('csv')) {
    return 'DOCUMENT';
  }
  return 'OTHER';
};

// Utility function to get file category from extension
export const getFileCategoryFromExt = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();

  if (imageTypes.test(ext)) return 'IMAGE';
  if (videoTypes.test(ext)) return 'VIDEO';
  if (audioTypes.test(ext)) return 'AUDIO';
  if (archiveTypes.test(ext)) return 'ARCHIVE';
  if (documentTypes.test(ext)) return 'DOCUMENT';

  return 'OTHER';
};

// Utility function to generate file URL
export const generateFileUrl = (req: Request, filepath: string): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Convert absolute path to relative path for static serving
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const relativePath = path.relative(process.cwd(), filepath).replace(/\\/g, '/');
  return `${baseUrl}/${relativePath}`;
};