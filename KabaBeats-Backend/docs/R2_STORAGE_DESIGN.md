# KabaBeats R2 Storage Design

## Overview

This document outlines the comprehensive R2 storage structure for KabaBeats, including file organization, processing pipelines, and security considerations.

## Storage Structure

### Folder Organization

```
kababeats-media/
├── audio/
│   └── beats/
│       └── {userId}/
│           └── {beatId}/
│               ├── {timestamp}-{random}.mp3
│               ├── {timestamp}-{random}.wav
│               └── {timestamp}-{random}.m4a
├── images/
│   ├── artwork/
│   │   └── {userId}/
│   │       └── {beatId}/
│   │           ├── {timestamp}-{random}.jpg
│   │           ├── {timestamp}-{random}.png
│   │           └── thumbnails/
│   │               └── {timestamp}-{random}_thumb.jpg
│   └── profiles/
│       └── {userId}/
│           ├── {timestamp}-{random}.jpg
│           ├── {timestamp}-{random}.png
│           └── thumbnails/
│               └── {timestamp}-{random}_thumb.jpg
├── processed/
│   └── audio/
│       └── {userId}/
│           └── {beatId}/
│               ├── preview/
│               │   └── {timestamp}-{random}_preview.mp3
│               └── full/
│                   └── {timestamp}-{random}_full.mp3
└── temp/
    └── {userId}/
        └── {timestamp}-{random}.{ext}
```

## File Types and Configurations

### Audio Files
- **Allowed Types**: MP3, WAV, M4A, FLAC
- **Max Size**: 50MB
- **Processing**: 
  - Generate preview (30 seconds, 64kbps)
  - Generate full version (128kbps)
  - Extract metadata (duration, bitrate, sample rate)

### Beat Artwork
- **Allowed Types**: JPEG, PNG, WebP
- **Max Size**: 10MB
- **Processing**:
  - Resize to 1200x1200px
  - Generate thumbnail (300x300px)
  - Optimize for web delivery

### Profile Images
- **Allowed Types**: JPEG, PNG, WebP
- **Max Size**: 5MB
- **Processing**:
  - Resize to 400x400px
  - Generate thumbnail (150x150px)
  - Optimize for web delivery

## API Endpoints

### 1. Generate Upload URL (Standard)
```http
POST /api/v1/media/upload-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileType": "audio|image|profile|artwork",
  "originalName": "beat.mp3",
  "contentType": "audio/mpeg",
  "size": 10485760,
  "beatId": "beat_id_here" // Required for audio/artwork
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://presigned-url-here",
    "key": "audio/beats/user123/beat456/1234567890-abc123.mp3",
    "expiresIn": 3600
  }
}
```

### 2. Chunked Upload (For Large Files)

#### Initialize Chunked Upload
```http
POST /api/v1/media/chunked/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileName": "large_beat.wav",
  "fileSize": 104857600, // 100MB
  "contentType": "audio/wav",
  "fileType": "audio",
  "beatId": "beat_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123def456",
    "userId": "user123",
    "fileName": "large_beat.wav",
    "fileSize": 104857600,
    "chunkSize": 5242880, // 5MB chunks
    "totalChunks": 20,
    "uploadedChunks": [],
    "contentType": "audio/wav",
    "beatId": "beat_id_here",
    "fileType": "audio",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

#### Generate Chunk Upload URL
```http
POST /api/v1/media/chunked/upload-url
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": "abc123def456",
  "chunkNumber": 0,
  "chunkSize": 5242880,
  "totalChunks": 20,
  "fileName": "large_beat.wav",
  "fileSize": 104857600,
  "contentType": "audio/wav",
  "fileType": "audio",
  "beatId": "beat_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://presigned-url-for-chunk-0",
    "chunkKey": "temp/chunks/user123/abc123def456/1234567890-chunk-0",
    "expiresIn": 3600
  }
}
```

#### Mark Chunk as Uploaded
```http
POST /api/v1/media/chunked/mark-uploaded
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": "abc123def456",
  "chunkNumber": 0
}
```

#### Get Upload Progress
```http
GET /api/v1/media/chunked/progress/{sessionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded": 15,
    "total": 20,
    "percentage": 75
  }
}
```

#### Complete Chunked Upload
```http
POST /api/v1/media/chunked/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": "abc123def456",
  "checksum": "sha256_hash_of_complete_file"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "finalKey": "audio/beats/user123/beat456/1234567890-abc123.wav",
    "downloadUrl": "https://download-url-here",
    "mediaFile": {
      "_id": "file_id_here",
      "key": "audio/beats/user123/beat456/1234567890-abc123.wav",
      "userId": "user123",
      "beatId": "beat456",
      "fileType": "audio",
      "status": "processed",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2. Confirm Upload
```http
POST /api/v1/media/confirm-upload
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "audio/beats/user123/beat456/1234567890-abc123.mp3",
  "fileType": "audio",
  "beatId": "beat_id_here"
}
```

### 3. Get Download URL
```http
GET /api/v1/media/download/{fileId}?expiresIn=3600
Authorization: Bearer {token}
```

### 4. Get User Files
```http
GET /api/v1/media?fileType=audio&beatId=beat_id_here
Authorization: Bearer {token}
```

### 5. Update File Metadata
```http
PUT /api/v1/media/{fileId}/metadata
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Beat",
  "description": "A great beat for hip hop",
  "tags": ["hip-hop", "trap", "dark"],
  "isPublic": true
}
```

### 6. Delete File
```http
DELETE /api/v1/media/{fileId}
Authorization: Bearer {token}
```

### 7. HLS Streaming

#### Generate HLS Streaming URL
```http
GET /api/v1/media/stream/{beatId}/hls?quality=medium
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "masterPlaylistUrl": "https://streaming-url/master.m3u8",
    "availableQualities": ["low", "medium", "high"],
    "expiresIn": 3600
  }
}
```

#### Get HLS Playlist
```http
GET /api/v1/media/stream/{beatId}/playlist?playlistType=master
Authorization: Bearer {token}
```

**Response (Master Playlist):**
```
#EXTM3U
#EXT-X-VERSION:6

#EXT-X-STREAM-INF:BANDWIDTH=64000,CODECS="aac"
low/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=128000,CODECS="aac"
medium/playlist.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=256000,CODECS="aac"
high/playlist.m3u8
```

**Response (Variant Playlist):**
```
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0

#EXTINF:10.000,
segment_000.ts

#EXTINF:10.000,
segment_001.ts

#EXTINF:10.000,
segment_002.ts

#EXT-X-ENDLIST
```

## Security Considerations

### 1. Access Control
- All uploads require authentication
- Users can only access their own files
- Beat-related files require beat ownership verification

### 2. File Validation
- Content type validation
- File size limits
- File extension validation
- Malware scanning (recommended)

### 3. Presigned URLs
- Short expiration times (1 hour default)
- Limited to specific operations
- No public access without authentication

## Processing Pipeline

### 1. Standard Upload Flow
```
User Request → Generate Presigned URL → Upload to R2 → Confirm Upload → Process File → Store Metadata
```

### 2. Chunked Upload Flow (Large Files)
```
User Request → Initialize Session → Upload Chunks → Mark Chunks → Complete Upload → Concatenate → Process → Store
```

### 3. Audio Processing
```
Original Audio → Extract Metadata → Generate Preview → Generate Full Version → Generate HLS → Store All Versions
```

### 4. Image Processing
```
Original Image → Extract Metadata → Resize → Generate Thumbnail → Optimize → Store All Versions
```

### 5. HLS Streaming Pipeline
```
Audio File → FFmpeg Processing → Generate Segments → Create Playlists → Store in R2 → Serve via CDN
```

## Database Schema

### MediaFile Model
```typescript
{
  key: string;                    // R2 storage key
  processedKey?: string;          // Processed version key
  thumbnailKey?: string;          // Thumbnail key
  userId: string;                 // Owner user ID
  beatId?: string;                // Associated beat ID
  fileType: 'audio' | 'image' | 'profile' | 'artwork';
  title?: string;                 // User-defined title
  description?: string;           // User-defined description
  tags?: string[];                // User-defined tags
  isPublic: boolean;              // Public visibility
  metadata: {                     // File metadata
    duration?: number;            // Audio duration
    bitrate?: number;             // Audio bitrate
    sampleRate?: number;          // Audio sample rate
    width?: number;               // Image width
    height?: number;              // Image height
    format: string;               // File format
    size: number;                 // File size
  };
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  uploadedAt: Date;
  processedAt?: Date;
}
```

## Environment Variables

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=kababeats-media
CLOUDFLARE_R2_PUBLIC_URL=https://your-domain.com  # Optional for public files
```

## Usage Examples

### Standard Upload Flow

```typescript
// 1. Generate upload URL
const uploadResponse = await fetch('/api/v1/media/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileType: 'audio',
    originalName: file.name,
    contentType: file.type,
    size: file.size,
    beatId: 'beat_id_here',
  }),
});

const { uploadUrl, key } = await uploadResponse.json();

// 2. Upload file to R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
});

// 3. Confirm upload
await fetch('/api/v1/media/confirm-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key,
    fileType: 'audio',
    beatId: 'beat_id_here',
  }),
});
```

### Chunked Upload Flow (Large Files)

```typescript
// 1. Initialize chunked upload
const initResponse = await fetch('/api/v1/media/chunked/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
    fileType: 'audio',
    beatId: 'beat_id_here',
  }),
});

const { sessionId, chunkSize, totalChunks } = await initResponse.json();

// 2. Upload chunks
for (let i = 0; i < totalChunks; i++) {
  const start = i * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  const chunk = file.slice(start, end);
  
  // Get chunk upload URL
  const chunkResponse = await fetch('/api/v1/media/chunked/upload-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      chunkNumber: i,
      chunkSize,
      totalChunks,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      fileType: 'audio',
      beatId: 'beat_id_here',
    }),
  });
  
  const { uploadUrl } = await chunkResponse.json();
  
  // Upload chunk
  await fetch(uploadUrl, {
    method: 'PUT',
    body: chunk,
    headers: {
      'Content-Type': file.type,
    },
  });
  
  // Mark chunk as uploaded
  await fetch('/api/v1/media/chunked/mark-uploaded', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      chunkNumber: i,
    }),
  });
}

// 3. Complete upload
const checksum = await calculateFileChecksum(file);
await fetch('/api/v1/media/chunked/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionId,
    checksum,
  }),
});
```

### HLS Streaming Integration

```typescript
// 1. Get HLS streaming URL
const streamResponse = await fetch(`/api/v1/media/stream/${beatId}/hls`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { masterPlaylistUrl, availableQualities } = await streamResponse.json();

// 2. Use with HLS.js or native HTML5 audio
const audio = document.createElement('audio');
const hls = new Hls();
hls.loadSource(masterPlaylistUrl);
hls.attachMedia(audio);

// 3. Handle quality selection
const selectQuality = (quality: string) => {
  const variantUrl = masterPlaylistUrl.replace('master', quality);
  hls.loadSource(variantUrl);
};
```

## Maintenance Tasks

### 1. Cleanup Orphaned Files
- Run daily to remove files not associated with any user/beat
- Remove temporary files older than 24 hours

### 2. Storage Optimization
- Monitor storage usage
- Implement lifecycle policies for old files
- Compress old files if needed

### 3. Performance Monitoring
- Track upload/download speeds
- Monitor processing times
- Alert on failed uploads

## Cost Optimization

### 1. Storage Classes
- Use appropriate storage classes for different file types
- Move old files to cheaper storage classes

### 2. CDN Integration
- Use Cloudflare CDN for public files
- Cache frequently accessed files

### 3. Compression
- Compress images and audio files
- Use appropriate formats for different use cases

## Future Enhancements

### 1. Advanced Processing
- AI-powered audio enhancement
- Automatic genre detection
- BPM analysis

### 2. Streaming
- Implement audio streaming for large files
- Progressive download for images

### 3. Analytics
- Track file access patterns
- Monitor storage usage per user
- Generate usage reports
