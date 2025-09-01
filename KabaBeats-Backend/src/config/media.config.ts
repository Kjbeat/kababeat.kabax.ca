export const mediaConfig = {
  // File size limits (in bytes)
  maxFileSize: {
    audio: 100 * 1024 * 1024, // 100MB
    image: 10 * 1024 * 1024,  // 10MB
  },

  // Allowed file types
  allowedTypes: {
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'],
    image: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Chunk size for uploads (5MB)
  chunkSize: 5 * 1024 * 1024,

  // Processing timeouts (in milliseconds)
  processingTimeout: 30 * 60 * 1000, // 30 minutes

  // Cleanup interval (in milliseconds)
  cleanupInterval: 60 * 60 * 1000, // 1 hour

  // Audio quality settings
  audioQuality: {
    preview: {
      duration: 30, // seconds
      bitrate: '64k',
      channels: 2,
    },
    low: {
      bitrate: '128k',
      channels: 2,
    },
    medium: {
      bitrate: '320k',
      channels: 2,
    },
    high: {
      format: 'flac',
      quality: 'lossless',
    },
  },

  // Image size settings
  imageSizes: {
    mini: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'webp',
    },
    small: {
      width: 300,
      height: 300,
      quality: 80,
      format: 'webp',
    },
    medium: {
      width: 600,
      height: 600,
      quality: 85,
      format: 'webp',
    },
    large: {
      width: 1200,
      height: 1200,
      quality: 90,
      format: 'webp',
    },
  },

  // HLS settings
  hls: {
    segmentDuration: 10, // seconds
    playlistType: 'VOD', // Video on Demand
    targetDuration: 10,
  },

  // R2 settings
  r2: {
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'kababeats-media',
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  },

  // FFmpeg settings
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
    timeout: 30000, // 30 seconds
  },

  // Temporary directory
  tempDir: process.env.TEMP_DIR || 'temp',

  // CDN settings
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || 'https://r2.example.com',
    cacheTtl: 86400, // 24 hours
  },
};

export default mediaConfig;
