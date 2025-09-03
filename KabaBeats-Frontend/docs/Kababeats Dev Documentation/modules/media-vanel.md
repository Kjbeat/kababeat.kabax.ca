# Media Processing & Playback — Vanel

## Purpose & User Value

The Media Processing & Playback module handles audio file processing, streaming, and playback functionality. It provides secure file storage, audio processing, HLS streaming capabilities, and media player integration. Users can upload, process, and stream audio content with optimized delivery and playback experiences.

## Current Frontend Flow

### Main routes/components involved:
- **Media Player**: `src/components/MediaPlayer.tsx` - main audio player component
- **Media Player Context**: `src/contexts/MediaPlayerContext.tsx` - playback state management
- **Volume Control**: `src/components/media/VolumeControl.tsx` - audio volume management
- **Chunked Upload**: `src/components/upload/ChunkedUpload.tsx` - large file upload handling
- **Beat Cards**: `src/components/beat-card/` - beat display with play functionality

### State management and key hooks:
- `useMediaPlayer()` hook manages playback state, current track, and player controls
- Media player state includes current beat, playing status, volume, and progress
- Audio streaming handled through HLS or direct file URLs
- Playback controls integrated across beat cards and detail pages

### How the UI calls services/handlers:
- Media playback uses secure URLs from `/api/v1/beat/:id/audio` endpoint
- File uploads use chunked upload system via `/api/v1/media/chunked/*` endpoints
- Media processing handled through backend services with progress tracking
- CDN integration for optimized media delivery

## Current Backend/API Flow

### Handlers/routes involved:
- **Media Routes**: `src/routes/v1/media.routes.ts` - comprehensive media handling
- **Media Controller**: `src/modules/media/media.controller.ts` - media operations
- **Media Service**: `src/modules/media/media.service.ts` - file processing and storage
- **Beat Routes**: `src/routes/v1/beat.routes.ts` - audio URL generation
- **CDN Service**: `src/config/cdn.ts` - content delivery optimization
- **R2 Storage**: `src/config/cloudflare-r2.ts` - file storage management

### Auth/ownership checks expected:
- JWT token validation for file uploads and processing
- User ownership verification for media file access
- Secure URL generation with expiration for media access
- Rate limiting for media processing and streaming

### DB collections/documents touched:
- **mediafiles** collection - file metadata, processing status, storage keys
- **beats** collection - audio file references, HLS URLs, processing status
- **users** collection - upload quotas and media statistics

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/media/upload-url` | POST | Required | Generate upload URL | Implemented | Presigned URLs |
| `/media/confirm-upload` | POST | Required | Confirm file upload | Implemented | File processing |
| `/media/download-url` | GET | Required | Get download URL | Implemented | Secure access |
| `/media/delete` | DELETE | Required | Delete file | Implemented | Owner verification |
| `/media/user-files` | GET | Required | Get user files | Implemented | File management |
| `/media/update-metadata` | PUT | Required | Update file metadata | Implemented | File info updates |
| `/media/chunked/initialize` | POST | Required | Initialize chunked upload | Implemented | Large file support |
| `/media/chunked/upload-url` | POST | Required | Get chunk upload URL | Implemented | Chunk processing |
| `/media/chunked/mark-uploaded` | POST | Required | Mark chunk uploaded | Implemented | Progress tracking |
| `/media/chunked/progress` | GET | Required | Get upload progress | Implemented | Status monitoring |
| `/media/chunked/complete` | POST | Required | Complete chunked upload | Implemented | File assembly |
| `/media/chunked/abort` | POST | Required | Abort chunked upload | Implemented | Cleanup |
| `/beat/:id/audio` | GET | Optional | Get audio URL | Implemented | Secure streaming |
| `/beat/:id/artwork` | GET | Optional | Get artwork URL | Implemented | Image delivery |

## Stories & Status

### Story: Integrate play media
- **Status**: Implemented
- **Current behavior**: Media playback integrated across platform with MediaPlayer component and context. Users can play beats from cards, detail pages, and playlists. Audio streaming uses secure URLs with proper authentication and CDN optimization.
- **Acceptance criteria**: ✅ Media player working, secure streaming, playback controls, cross-page integration

## Data & Validation

### Required inputs and constraints:
- **File types**: Audio (MP3, WAV, M4A), Images (JPEG, PNG, WebP), ZIP for stems
- **File sizes**: Audio up to 5GB, Images up to 50MB, Stems up to 5GB
- **Processing**: Audio metadata extraction, format conversion, HLS generation
- **Storage**: Secure file storage with CDN integration
- **Access**: Secure URL generation with expiration and authentication

### Key error cases the UI must handle:
- **Upload errors**: File size limits, format validation, network failures
- **Processing errors**: Audio processing failures, format conversion errors
- **Streaming errors**: Network issues, CDN failures, authentication problems
- **Storage errors**: Quota exceeded, storage failures, file corruption
- **Playback errors**: Unsupported formats, network interruptions, device limitations

## Open Risks / Decisions

- **HLS streaming**: HLS processing pipeline needs optimization for large audio files
- **CDN costs**: Media delivery costs may be significant with high usage
- **Processing queue**: Background processing system needed for large files
- **Format support**: Need to ensure broad format compatibility across devices
- **Storage optimization**: File compression and optimization for cost efficiency
- **Error recovery**: Upload failure recovery and resume functionality needed
- **Performance**: Media processing performance optimization for large files

## Test Scenarios

- **Audio upload**: User uploads audio file, processing completes successfully
- **Media playback**: User plays uploaded audio, streaming works across devices
- **Large file upload**: User uploads large audio file, chunked upload processes successfully
- **File processing**: Audio metadata extracted, HLS generated, thumbnails created
- **Secure access**: Media URLs expire properly, unauthorized access blocked
- **CDN delivery**: Media served through CDN with proper caching and optimization
- **Error handling**: Upload failures show appropriate error messages and recovery options
- **Progress tracking**: Upload and processing progress displayed accurately
- **Format validation**: Invalid file formats rejected with clear error messages
- **Storage management**: File cleanup and orphaned file removal working properly
