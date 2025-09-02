# Chunked Upload & HLS Streaming Setup Guide

This guide covers the complete setup and implementation of chunked upload and HLS streaming for KabaBeats.

## 🚀 Features Implemented

### ✅ Chunked Upload System
- **Large file support** - Handle files up to 500MB
- **Resumable uploads** - Continue from where you left off
- **Progress tracking** - Real-time upload progress
- **Session management** - Secure upload sessions with Redis
- **Automatic cleanup** - Remove orphaned chunks and expired sessions

### ✅ HLS (HTTP Live Streaming)
- **Adaptive streaming** - Multiple quality levels (low, medium, high)
- **Master playlists** - Automatic quality selection
- **Variant playlists** - Individual quality streams
- **Segment generation** - 10-second audio segments
- **CDN-ready** - Optimized for global delivery

### ✅ Advanced Audio Processing
- **FFmpeg integration** - Professional audio processing
- **Metadata extraction** - Duration, bitrate, sample rate
- **Preview generation** - 30-second previews
- **Multiple formats** - MP3, WAV, M4A, FLAC support
- **Quality optimization** - Automatic quality settings

## 📋 Prerequisites

### Backend Dependencies
- Node.js 18+
- MongoDB
- Redis
- FFmpeg
- Cloudflare R2 account

### Frontend Dependencies
- React 18+
- HLS.js
- TypeScript

## 🛠️ Installation & Setup

### 1. Backend Setup

#### Install Dependencies
```bash
cd KabaBeats-Backend
npm install redis @types/redis
```

#### Install FFmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

#### Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# Windows
# Download from https://redis.io/download
```

#### Environment Variables
Add to your `.env` file:
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# CDN Configuration
CDN_BASE_URL=https://media.kababeat.kabax.ca

# Cloudflare R2 (existing)
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=kababeats-media
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd KabaBeats-Frontend
npm install hls.js
```

## 🔧 Configuration

### Redis Configuration
The Redis service is automatically initialized when the backend starts. It provides:
- Session storage for chunked uploads
- HLS playlist caching
- Processed file metadata caching

### CDN Configuration
Configure your CDN provider (Cloudflare recommended):
1. Set up a custom domain for media delivery
2. Configure cache rules for different file types
3. Enable HLS streaming support

### FFmpeg Configuration
FFmpeg is used for:
- Audio metadata extraction
- Audio format conversion
- HLS segment generation
- Preview generation

## 📁 File Structure

### Backend Files Added/Modified
```
KabaBeats-Backend/
├── src/
│   ├── config/
│   │   ├── redis.ts                 # Redis service configuration
│   │   └── cdn.ts                   # CDN configuration
│   ├── utils/
│   │   ├── chunkedUpload.ts         # Chunked upload utilities
│   │   ├── hlsStreaming.ts          # HLS streaming utilities
│   │   └── audioProcessor.ts        # FFmpeg audio processing
│   ├── modules/media/
│   │   ├── media.service.ts         # Updated with chunked upload & HLS
│   │   ├── media.controller.ts      # Updated with new endpoints
│   │   ├── media.interface.ts       # Updated interfaces
│   │   └── media.model.ts           # Media file model
│   └── routes/v1/
│       └── media.routes.ts          # Updated with new routes
└── docs/
    ├── R2_STORAGE_DESIGN.md         # Updated documentation
    └── CHUNKED_UPLOAD_HLS_SETUP.md  # This guide
```

### Frontend Files Added
```
KabaBeats-Frontend/
├── src/
│   ├── components/
│   │   ├── upload/
│   │   │   └── ChunkedUpload.tsx    # Chunked upload component
│   │   ├── player/
│   │   │   └── HLSPlayer.tsx        # HLS streaming player
│   │   └── examples/
│   │       └── MediaUploadExample.tsx # Usage example
```

## 🚀 API Endpoints

### Chunked Upload Endpoints
- `POST /api/v1/media/chunked/initialize` - Initialize chunked upload
- `POST /api/v1/media/chunked/upload-url` - Get chunk upload URL
- `POST /api/v1/media/chunked/mark-uploaded` - Mark chunk as uploaded
- `GET /api/v1/media/chunked/progress/{sessionId}` - Get upload progress
- `POST /api/v1/media/chunked/complete` - Complete chunked upload
- `DELETE /api/v1/media/chunked/{sessionId}` - Abort chunked upload

### HLS Streaming Endpoints
- `GET /api/v1/media/stream/{beatId}/hls` - Get HLS streaming URL
- `GET /api/v1/media/stream/{beatId}/playlist` - Get HLS playlist

## 💻 Usage Examples

### Backend Usage

#### Initialize Chunked Upload
```typescript
import { initializeChunkedUpload } from '@/utils/chunkedUpload';

const session = await initializeChunkedUpload({
  userId: 'user123',
  fileName: 'beat.wav',
  fileSize: 104857600, // 100MB
  contentType: 'audio/wav',
  fileType: 'audio',
  beatId: 'beat456'
});
```

#### Generate HLS Streaming URL
```typescript
import { generateHLSStreamingUrl } from '@/utils/hlsStreaming';

const streamingData = await generateHLSStreamingUrl(
  'user123',
  'beat456',
  'medium' // quality
);
```

### Frontend Usage

#### Chunked Upload Component
```tsx
import { ChunkedUpload } from '@/components/upload/ChunkedUpload';

<ChunkedUpload
  onUploadComplete={(result) => {
    console.log('Upload complete:', result);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
  fileType="audio"
  maxFileSize={500 * 1024 * 1024} // 500MB
  beatId="beat123"
/>
```

#### HLS Player Component
```tsx
import { HLSPlayer } from '@/components/player/HLSPlayer';

<HLSPlayer
  beatId="beat123"
  userId="user456"
  title="My Beat"
  artist="Producer Name"
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
/>
```

## 🔍 Testing

### Test Chunked Upload
1. Start the backend server
2. Use the `MediaUploadExample` component
3. Upload a large audio file (>10MB)
4. Monitor the upload progress
5. Verify the file is processed and stored

### Test HLS Streaming
1. Upload an audio file using chunked upload
2. Use the HLS player to stream the file
3. Test quality switching
4. Verify adaptive streaming works

## 🚨 Troubleshooting

### Common Issues

#### FFmpeg Not Found
```bash
# Check if FFmpeg is installed
ffmpeg -version

# If not found, install it
brew install ffmpeg  # macOS
```

#### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
brew services start redis  # macOS
sudo systemctl start redis-server  # Ubuntu
```

#### HLS.js Not Loading
```bash
# Install HLS.js
npm install hls.js

# Check browser console for errors
```

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## 📊 Performance Optimization

### Chunk Size Optimization
- **Small files (<10MB)**: 1MB chunks
- **Medium files (10-100MB)**: 5MB chunks
- **Large files (>100MB)**: 10MB chunks

### CDN Configuration
- **Audio files**: 24-hour cache
- **HLS playlists**: 1-hour cache
- **HLS segments**: 5-minute cache

### Redis Optimization
- **Session TTL**: 24 hours
- **Cache TTL**: 1 hour
- **Memory limit**: 512MB

## 🔒 Security Considerations

### Upload Security
- File type validation
- File size limits
- Virus scanning (recommended)
- User authentication required

### Streaming Security
- Presigned URLs with expiration
- User access validation
- Rate limiting
- CDN security headers

## 📈 Monitoring

### Key Metrics
- Upload success rate
- Average upload time
- Streaming quality distribution
- CDN cache hit rate
- Redis memory usage

### Logging
All operations are logged with appropriate levels:
- `INFO`: Normal operations
- `WARN`: Recoverable issues
- `ERROR`: Failed operations

## 🚀 Deployment

### Production Checklist
- [ ] Redis configured with persistence
- [ ] CDN configured with proper cache rules
- [ ] FFmpeg installed on all servers
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Rate limiting enabled
- [ ] Monitoring configured

### Scaling Considerations
- Use Redis Cluster for high availability
- Configure CDN with multiple edge locations
- Use load balancers for multiple backend instances
- Monitor resource usage and scale accordingly

## 📚 Additional Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
- [Redis Documentation](https://redis.io/documentation)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Test with smaller files first
4. Verify all dependencies are installed
5. Check network connectivity

---

**🎉 Congratulations!** You now have a complete chunked upload and HLS streaming system for KabaBeats!
