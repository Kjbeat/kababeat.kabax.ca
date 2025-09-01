# Media Handling Usage Examples

This document provides practical examples of how to use the optimized media handling system in KabaBeats.

## Frontend Integration Examples

### 1. Chunked Upload Implementation

```typescript
// Frontend chunked upload service
class MediaUploadService {
  private chunkSize = 5 * 1024 * 1024; // 5MB chunks

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    // 1. Initialize chunked upload
    const initResponse = await fetch('/api/v1/media/upload/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        type: file.type.startsWith('audio/') ? 'audio' : 'image',
      }),
    });

    const { uploadId, uploadUrls, totalChunks } = await initResponse.json();

    // 2. Upload chunks in parallel
    const chunks = this.createChunks(file, this.chunkSize);
    const uploadPromises = chunks.map((chunk, index) => 
      this.uploadChunk(chunk, uploadUrls[index], index)
    );

    // 3. Track progress
    let completedChunks = 0;
    const progressPromises = uploadPromises.map(promise => 
      promise.then(() => {
        completedChunks++;
        onProgress?.(completedChunks / totalChunks * 100);
      })
    );

    await Promise.all(progressPromises);

    // 4. Complete upload and process
    const completeResponse = await fetch('/api/v1/media/upload/complete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        metadata: {
          title: 'My Beat',
          bpm: 140,
          key: 'C Minor',
          genre: 'Hip Hop',
        },
        processingOptions: {
          generateWaveform: true,
          extractMetadata: true,
          createPreviews: true,
          generateMultipleQualities: true,
        },
      }),
    });

    const { beatId, streamingUrls } = await completeResponse.json();
    return beatId;
  }

  private createChunks(file: File, chunkSize: number): Blob[] {
    const chunks: Blob[] = [];
    for (let i = 0; i < file.size; i += chunkSize) {
      chunks.push(file.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async uploadChunk(chunk: Blob, uploadUrl: string, chunkNumber: number): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  }
}
```

### 2. Audio Player with Adaptive Streaming

```typescript
// Audio player with quality selection
class AdaptiveAudioPlayer {
  private audio: HTMLAudioElement;
  private currentQuality: 'preview' | 'low' | 'medium' | 'high' = 'preview';

  constructor() {
    this.audio = new Audio();
    this.setupEventListeners();
  }

  async loadBeat(beatId: string): Promise<void> {
    // Get streaming URLs
    const response = await fetch(`/api/v1/media/stream/${beatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const { preview, low, medium, high, hls } = await response.json();

    // Start with preview for immediate playback
    this.audio.src = preview;
    this.currentQuality = 'preview';

    // Preload higher quality in background
    this.preloadHigherQuality(medium);
  }

  private preloadHigherQuality(url: string): void {
    const preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = url;
    
    preloadAudio.addEventListener('canplaythrough', () => {
      // Switch to higher quality when ready
      this.upgradeQuality(url);
    });
  }

  private upgradeQuality(url: string): void {
    const currentTime = this.audio.currentTime;
    const wasPlaying = !this.audio.paused;
    
    this.audio.src = url;
    this.audio.currentTime = currentTime;
    
    if (wasPlaying) {
      this.audio.play();
    }
  }

  private setupEventListeners(): void {
    this.audio.addEventListener('loadstart', () => {
      console.log('Loading audio...');
    });

    this.audio.addEventListener('canplay', () => {
      console.log('Audio ready to play');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });
  }

  play(): void {
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }
}
```

### 3. Image Optimization and Display

```typescript
// Image component with responsive loading
class OptimizedImage {
  private img: HTMLImageElement;
  private beatId: string;

  constructor(beatId: string) {
    this.img = new Image();
    this.beatId = beatId;
  }

  async loadArtwork(container: HTMLElement): Promise<void> {
    // Get artwork URLs
    const response = await fetch(`/api/v1/media/artwork/${this.beatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const { mini, small, medium, large } = await response.json();

    // Load appropriate size based on container
    const containerWidth = container.clientWidth;
    let imageUrl: string;

    if (containerWidth <= 150) {
      imageUrl = mini;
    } else if (containerWidth <= 300) {
      imageUrl = small;
    } else if (containerWidth <= 600) {
      imageUrl = medium;
    } else {
      imageUrl = large;
    }

    // Load image with progressive enhancement
    this.loadProgressiveImage(imageUrl, container);
  }

  private loadProgressiveImage(url: string, container: HTMLElement): void {
    // Start with low quality
    this.img.src = url;
    
    this.img.onload = () => {
      container.appendChild(this.img);
    };

    this.img.onerror = () => {
      // Fallback to placeholder
      this.img.src = '/placeholder.svg';
      container.appendChild(this.img);
    };
  }
}
```

## Backend Usage Examples

### 1. Beat Creation with Media Processing

```typescript
// Beat creation endpoint
app.post('/api/v1/beats', authenticate, async (req, res) => {
  try {
    const { title, description, genre, bpm, key, uploadId } = req.body;
    const userId = req.user.userId;

    // Complete the upload and get processed files
    const mediaResult = await mediaService.completeChunkedUpload(
      uploadId,
      { title, bpm, key, genre },
      {
        generateWaveform: true,
        extractMetadata: true,
        createPreviews: true,
        generateMultipleQualities: true,
      }
    );

    // Create beat record in database
    const beat = new Beat({
      title,
      description,
      producer: req.user.username,
      producerId: userId,
      genre,
      bpm,
      musicalKey: key,
      audioFile: mediaResult.streamingUrls.high,
      artwork: mediaResult.artworkUrls?.medium,
      streamingUrls: mediaResult.streamingUrls,
      artworkUrls: mediaResult.artworkUrls,
      isDraft: true,
      isPublished: false,
    });

    await beat.save();

    res.status(201).json({
      success: true,
      data: beat,
    });
  } catch (error) {
    next(error);
  }
});
```

### 2. Streaming Endpoint with Quality Selection

```typescript
// Streaming endpoint with quality detection
app.get('/api/v1/media/stream/:beatId', async (req, res) => {
  try {
    const { beatId } = req.params;
    const { quality = 'medium' } = req.query;

    // Get beat from database
    const beat = await Beat.findById(beatId);
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Generate fresh streaming URLs
    const streamingUrls = await mediaService.generateStreamingUrls(beatId);

    // Select appropriate quality based on request
    let selectedUrl: string;
    switch (quality) {
      case 'preview':
        selectedUrl = streamingUrls.preview;
        break;
      case 'low':
        selectedUrl = streamingUrls.low;
        break;
      case 'high':
        selectedUrl = streamingUrls.high;
        break;
      case 'hls':
        selectedUrl = streamingUrls.hls;
        break;
      default:
        selectedUrl = streamingUrls.medium;
    }

    // Increment play count
    await beat.incrementPlays();

    res.json({
      success: true,
      data: {
        url: selectedUrl,
        quality,
        allQualities: streamingUrls,
        metadata: {
          duration: beat.metadata.duration,
          title: beat.title,
          producer: beat.producer,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
```

### 3. Upload Progress Tracking

```typescript
// Upload progress tracking endpoint
app.get('/api/v1/media/upload/:uploadId/status', authenticate, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const status = mediaService.getUploadStatus(uploadId);

    if (!status) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    const progress = (status.uploadedChunks.length / status.totalChunks) * 100;

    res.json({
      success: true,
      data: {
        uploadId: status.uploadId,
        status: status.status,
        progress: Math.round(progress),
        uploadedChunks: status.uploadedChunks.length,
        totalChunks: status.totalChunks,
        createdAt: status.createdAt,
        expiresAt: status.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});
```

## Performance Optimization Tips

### 1. Frontend Optimizations

```typescript
// Lazy loading for beat cards
const BeatCard = ({ beat }: { beat: Beat }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="beat-card">
      {isInView && (
        <img
          src={beat.artworkUrls.small}
          alt={beat.title}
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};
```

### 2. Caching Strategy

```typescript
// Service worker for caching
const CACHE_NAME = 'kababeats-media-v1';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/v1/media/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### 3. Error Handling

```typescript
// Robust error handling for media operations
class MediaErrorHandler {
  static async handleUploadError(error: Error, uploadId: string): Promise<void> {
    console.error('Upload error:', error);
    
    // Clean up failed upload
    try {
      await fetch(`/api/v1/media/upload/${uploadId}/cleanup`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Show user-friendly error message
    this.showError('Upload failed. Please try again.');
  }

  static async handleStreamingError(error: Error, beatId: string): Promise<void> {
    console.error('Streaming error:', error);
    
    // Try fallback quality
    try {
      const fallbackUrl = await this.getFallbackStreamingUrl(beatId);
      this.audio.src = fallbackUrl;
    } catch (fallbackError) {
      this.showError('Unable to play audio. Please try again later.');
    }
  }

  private static showError(message: string): void {
    // Show error notification to user
    console.error(message);
  }
}
```

## Testing Examples

### 1. Unit Tests for Media Service

```typescript
// Media service tests
describe('MediaService', () => {
  let mediaService: MediaService;

  beforeEach(() => {
    mediaService = new MediaService();
  });

  describe('initializeChunkedUpload', () => {
    it('should initialize upload session correctly', async () => {
      const options = {
        type: 'audio' as const,
        filename: 'test.wav',
        contentType: 'audio/wav',
        size: 1000000,
        userId: 'user123',
        totalChunks: 2,
        chunkSize: 500000,
      };

      const result = await mediaService.initializeChunkedUpload(options);

      expect(result.uploadId).toBeDefined();
      expect(result.totalChunks).toBe(2);
      expect(result.uploadUrls).toHaveLength(2);
    });

    it('should reject files that are too large', async () => {
      const options = {
        type: 'audio' as const,
        filename: 'huge.wav',
        contentType: 'audio/wav',
        size: 200 * 1024 * 1024, // 200MB
        userId: 'user123',
        totalChunks: 1,
        chunkSize: 200 * 1024 * 1024,
      };

      await expect(mediaService.initializeChunkedUpload(options))
        .rejects.toThrow('File size exceeds limit');
    });
  });
});
```

### 2. Integration Tests

```typescript
// Integration tests for media endpoints
describe('Media Endpoints', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    authToken = await getAuthToken();
  });

  describe('POST /api/v1/media/upload/initialize', () => {
    it('should initialize chunked upload', async () => {
      const response = await request(app)
        .post('/api/v1/media/upload/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'test.wav',
          contentType: 'audio/wav',
          size: 1000000,
          type: 'audio',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadId).toBeDefined();
    });
  });
});
```

This comprehensive system provides:

- **Fast uploads** with chunked uploads and parallel processing
- **Seamless streaming** with adaptive quality and HLS support
- **Optimized images** with multiple sizes and WebP format
- **Robust error handling** with fallbacks and cleanup
- **Performance monitoring** with progress tracking
- **Cost optimization** with efficient R2 usage

The system is designed to handle the scale and performance requirements of a professional music platform while maintaining cost efficiency through Cloudflare R2's zero egress fees.
