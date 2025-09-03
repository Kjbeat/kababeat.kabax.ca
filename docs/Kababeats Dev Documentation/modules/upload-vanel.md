# Upload & Media — Vanel

## Purpose & User Value

The Upload & Media module enables producers to upload beats, artwork, and stems to the platform. Users can create beats with metadata, schedule releases, save drafts, and manage their music library. The module provides comprehensive upload workflows with AI-powered features for artwork generation and beat information extraction.

## Current Frontend Flow

### Main routes/components involved:
- **Upload Layout**: `src/modules/upload/components/UploadBeatLayout.tsx` - main upload interface with 5-step workflow
- **File Upload Step**: `src/modules/upload/components/FileUploadStep.tsx` - audio and stems file upload
- **Artwork Upload Step**: `src/modules/upload/components/ArtworkUploadStep.tsx` - artwork upload with AI generation
- **Beat Info Step**: `src/modules/upload/components/BeatInfoStep.tsx` - metadata entry (title, BPM, genre, etc.)
- **Collaborator Split Step**: `src/modules/upload/components/CollaboratorSplitStep.tsx` - revenue sharing setup
- **Review Step**: `src/modules/upload/components/ReviewStep.tsx` - final review and publish options
- **AI Upload Dialog**: `src/modules/upload/components/AIUploadDialog.tsx` - AI-powered upload features
- **Schedule Dialog**: `src/modules/upload/components/ScheduleDialog.tsx` - beat scheduling interface
- **Chunked Upload**: `src/components/upload/ChunkedUpload.tsx` - large file upload handling

### State management and key hooks:
- Upload state managed through `BeatFormData` interface with step-by-step progression
- File upload progress tracking with chunked upload support
- AI processing states for artwork and beat info generation
- Upload session management for large files

### How the UI calls services/handlers:
- File uploads use chunked upload system for large files
- Beat creation calls `/api/v1/beat/` (POST) with multipart form data
- Media uploads use `/api/v1/media/*` endpoints for file handling
- AI features integrate with external services for artwork and metadata generation

## Current Backend/API Flow

### Handlers/routes involved:
- **Beat Routes**: `src/routes/v1/beat.routes.ts` - comprehensive beat upload and management
- **Media Routes**: `src/routes/v1/media.routes.ts` - file upload and media processing
- **Beat Controller**: `src/modules/beat/beat.controller.ts` - handles beat operations
- **Beat Service**: `src/modules/beat/beat.service.ts` - business logic and file processing
- **Media Controller**: `src/modules/media/media.controller.ts` - handles media operations
- **Media Service**: `src/modules/media/media.service.ts` - file processing and storage

### Auth/ownership checks expected:
- JWT token validation via `authMiddleware` for all upload operations
- User ownership verification for beat updates and deletion
- File size and type validation for uploads
- Storage quota and rate limiting for uploads

### DB collections/documents touched:
- **beats** collection - stores beat metadata, file references, status, analytics
- **mediafiles** collection - stores file metadata, processing status, storage keys
- **users** collection - user upload quotas and statistics

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/beat/` | POST | Required | Create beat with files | Implemented | Multipart upload support |
| `/beat/:id` | PUT | Required | Update beat metadata | Implemented | Owner verification |
| `/beat/:id/files` | PUT | Required | Update beat files | Implemented | File replacement |
| `/beat/:id/publish` | PATCH | Required | Publish beat | Implemented | Status change |
| `/beat/:id/unpublish` | PATCH | Required | Unpublish beat | Implemented | Status change |
| `/beat/:id/schedule` | PATCH | Required | Schedule beat release | Implemented | Future publishing |
| `/beat/my-beats` | GET | Required | Get user's beats | Implemented | Filtered by owner |
| `/beat/stats` | GET | Required | Get user beat stats | Implemented | Analytics data |
| `/media/upload-url` | POST | Required | Generate upload URL | Implemented | Presigned URLs |
| `/media/confirm-upload` | POST | Required | Confirm file upload | Implemented | File processing |
| `/media/download-url` | GET | Required | Get download URL | Implemented | Secure access |
| `/media/delete` | DELETE | Required | Delete file | Implemented | Owner verification |
| `/media/chunked/initialize` | POST | Required | Initialize chunked upload | Implemented | Large file support |
| `/media/chunked/upload-url` | POST | Required | Get chunk upload URL | Implemented | Chunk processing |
| `/media/chunked/complete` | POST | Required | Complete chunked upload | Implemented | File assembly |
| `/media/chunked/abort` | POST | Required | Abort chunked upload | Implemented | Cleanup |

## Stories & Status

### Story: Upload Publish beat
- **Status**: Implemented
- **Current behavior**: Users can upload beats through 5-step workflow and publish immediately. Upload process includes file upload, metadata entry, and direct publishing via `/beat/:id/publish` endpoint.
- **Acceptance criteria**: ✅ Complete upload workflow, file processing, metadata validation, immediate publishing

### Story: Allow Free upload
- **Status**: Implemented
- **Current behavior**: Users can upload beats with free download options. Beat creation supports `allowFreeDownload` flag and free license configuration.
- **Acceptance criteria**: ✅ Free download option available, license configuration working

### Story: Upload beat save as Draft
- **Status**: Implemented
- **Current behavior**: Users can save beats as drafts during upload process. Draft status prevents public visibility while allowing further editing and completion.
- **Acceptance criteria**: ✅ Draft saving functionality, private storage, editing capability

### Story: Schedule beat
- **Status**: Implemented
- **Current behavior**: Users can schedule beats for future release via `/beat/:id/schedule` endpoint. Scheduled beats remain private until release date.
- **Acceptance criteria**: ✅ Scheduling interface, future release dates, automatic publishing

### Story: Integrate 1261 AI upload
- **Status**: Pending
- **How it should work**: AI integration should automatically extract beat information from uploaded audio files, including BPM detection, key identification, and genre classification. This should streamline the metadata entry process.
- **Acceptance criteria**: 
  - AI analyzes uploaded audio files
  - BPM automatically detected and populated
  - Musical key identified and suggested
  - Genre classification provided
  - User can review and modify AI suggestions

### Story: Generate AI Artwork
- **Status**: Pending
- **How it should work**: AI should generate artwork based on beat metadata, genre, mood, and audio characteristics. Users should be able to generate multiple options and select their preferred artwork.
- **Acceptance criteria**: 
  - AI generates artwork based on beat characteristics
  - Multiple artwork options provided
  - User can regenerate or select preferred option
  - Generated artwork meets platform requirements

### Story: Generate AI Beat infos
- **Status**: Pending
- **How it should work**: AI should analyze uploaded beats and automatically generate titles, descriptions, and tags based on audio content, genre, and mood characteristics.
- **Acceptance criteria**: 
  - AI generates relevant titles and descriptions
  - Tags automatically suggested based on content
  - User can edit and customize AI suggestions
  - Generated content is appropriate and relevant

### Story: Upload Audio file
- **Status**: Implemented
- **Current behavior**: Audio file upload supported through chunked upload system. Supports large files up to 5GB with progress tracking and error handling.
- **Acceptance criteria**: ✅ Large file support, progress tracking, error handling, format validation

### Story: Upload Artwork
- **Status**: Implemented
- **Current behavior**: Artwork upload supported with image format validation, size limits, and processing. Users can upload custom artwork or use AI generation.
- **Acceptance criteria**: ✅ Image upload, format validation, size optimization, AI integration ready

### Story: Beat info upload
- **Status**: Implemented
- **Current behavior**: Beat metadata entry through comprehensive form including title, producer, BPM, key, genre, mood, tags, and pricing information.
- **Acceptance criteria**: ✅ Metadata form, validation, data persistence, user-friendly interface

### Story: Upload Split
- **Status**: Implemented
- **Current behavior**: Stems upload supported as ZIP files up to 5GB. Collaborator split configuration allows revenue sharing setup with multiple contributors.
- **Acceptance criteria**: ✅ Stems upload, ZIP processing, collaborator configuration, revenue sharing

### Story: Upload Review
- **Status**: Implemented
- **Current behavior**: Final review step allows users to review all beat information, files, and settings before publishing. Includes publish, save draft, and schedule options.
- **Acceptance criteria**: ✅ Review interface, final validation, multiple publish options

### Story: Integrate Upload on Pages
- **Status**: Implemented
- **Current behavior**: Upload functionality integrated across platform pages. Upload button accessible from navigation and dashboard, with proper routing and state management.
- **Acceptance criteria**: ✅ Upload integration, navigation access, proper routing

### Story: Integrate play media
- **Status**: Implemented
- **Current behavior**: Media playback integrated with upload system. Users can preview uploaded beats during upload process and after completion.
- **Acceptance criteria**: ✅ Media preview, playback controls, upload integration

## Data & Validation

### Required inputs and constraints:
- **Audio file**: MP3, WAV, M4A formats, maximum 5GB, required for beat creation
- **Artwork**: JPEG, PNG, WebP formats, recommended dimensions, optional
- **Stems**: ZIP format, maximum 5GB, optional
- **Title**: 1-100 characters, required
- **Producer**: 1-50 characters, required
- **BPM**: 60-300 range, required
- **Key**: Valid musical key from predefined list, required
- **Genre**: Valid genre from predefined list, required
- **Tags**: Maximum 10 tags, 20 characters each, optional
- **Pricing**: Base price required, sale price optional

### Key error cases the UI must handle:
- **File upload errors**: File size limits, format validation, network failures
- **Validation errors**: Invalid metadata, missing required fields, format constraints
- **Storage errors**: Quota exceeded, storage failures, file corruption
- **Processing errors**: Audio processing failures, artwork generation errors
- **Authentication errors**: Expired tokens, unauthorized access, permission denied

## Open Risks / Decisions

- **AI integration**: AI features need external service integration and API implementation
- **File processing**: Audio processing pipeline needs optimization for large files
- **Storage costs**: Large file storage and processing may incur significant costs
- **Upload quotas**: Need to implement user upload limits and storage quotas
- **File validation**: Enhanced file validation needed for security and quality
- **Processing queue**: Background processing system needed for large uploads
- **Error recovery**: Upload failure recovery and resume functionality needed

## Test Scenarios

- **Complete upload workflow**: User uploads audio, artwork, enters metadata, and publishes successfully
- **Draft saving**: User saves incomplete beat as draft, returns later to complete
- **Scheduled release**: User schedules beat for future release, beat publishes automatically
- **Large file upload**: User uploads large audio file (5GB), chunked upload processes successfully
- **File replacement**: User replaces audio or artwork files in existing beat
- **Collaborator setup**: User configures revenue splits with multiple collaborators
- **Free download**: User enables free download option, beat available for free
- **Error handling**: Upload failures show appropriate error messages and recovery options
- **Progress tracking**: Upload progress displayed accurately with cancellation option
- **Format validation**: Invalid file formats rejected with clear error messages
