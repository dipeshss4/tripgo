/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Remove whitespace
  url = url.trim();

  // Pattern 1: youtu.be/VIDEO_ID
  let match = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Pattern 2: youtube.com/watch?v=VIDEO_ID
  match = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Pattern 3: youtube.com/embed/VIDEO_ID
  match = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Pattern 4: youtube.com/v/VIDEO_ID
  match = url.match(/(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Pattern 5: youtube.com/shorts/VIDEO_ID
  match = url.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // If it's just the video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Generate YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Generate YouTube thumbnail URL from video ID
 * Quality options: maxresdefault, sddefault, hqdefault, mqdefault, default
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: string = 'maxresdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Validate if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}