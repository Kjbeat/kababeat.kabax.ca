# Beats & Playback — Abiola

## Purpose & User Value

The Beats & Playback module manages beat discovery, playback, and user library management. Users can browse beats, play audio content, manage their personal beat library, and access different beat statuses (published, draft, scheduled). The module provides comprehensive beat management with analytics and playback optimization.

## Current Frontend Flow

### Main routes/components involved:
- **Explore Main**: `src/modules/explore/ExploreMain.tsx` - main discovery page
- **Browse Layout**: `src/modules/browse/components/BrowseLayout.tsx` - beat browsing interface
- **Beat Detail**: `src/modules/beat/components/BeatDetailLayout.tsx` - individual beat view
- **Library Components**: `src/modules/library/components/LibraryBeatCard.tsx` - user's beat library
- **Creator Profile**: `src/modules/creator/components/profile/BeatDisplay.tsx` - creator's beats
- **Beat Cards**: `src/components/beat-card/` - beat display components
- **Media Player**: `src/components/MediaPlayer.tsx` - audio playback
- **Media Player Context**: `src/contexts/MediaPlayerContext.tsx` - playback state

### State management and key hooks:
- `useMediaPlayer()` hook manages playback state and controls
- `useInfiniteScrollBeats()` hook handles beat loading and pagination
- Beat data managed through API calls with caching
- Playback state synchronized across components

### How the UI calls services/handlers:
- Beat discovery uses `/api/v1/beat/` (GET) with filtering and pagination
- Beat details fetched from `/api/v1/beat/:id` (GET)
- User beats accessed via `/api/v1/beat/my-beats` (GET)
- Playback uses secure audio URLs from `/api/v1/beat/:id/audio` (GET)
- Analytics tracked through `/api/v1/beat/:id/plays` (PATCH)

## Current Backend/API Flow

### Handlers/routes involved:
- **Beat Routes**: `src/routes/v1/beat.routes.ts` - comprehensive beat endpoints
- **Beat Controller**: `src/modules/beat/beat.controller.ts` - beat operations
- **Beat Service**: `src/modules/beat/beat.service.ts` - business logic and database operations
- **Beat Model**: `src/modules/beat/beat.model.ts` - beat data structure
- **Media Routes**: `src/routes/v1/media.routes.ts` - audio file handling

### Auth/ownership checks expected:
- JWT token validation for user-specific operations
- User ownership verification for beat management
- Public access for published beats
- Secure URL generation for audio files

### DB collections/documents touched:
- **beats** collection - beat metadata, status, analytics, file references
- **users** collection - user beat statistics and ownership
- **mediafiles** collection - audio file metadata and storage

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/beat/` | GET | Optional | Browse beats | Implemented | Public discovery |
| `/beat/search` | GET | Optional | Search beats | Implemented | Public search |
| `/beat/:id` | GET | Optional | Get beat details | Implemented | Public access |
| `/beat/my-beats` | GET | Required | Get user's beats | Implemented | Owner access |
| `/beat/stats` | GET | Required | Get user beat stats | Implemented | Analytics |
| `/beat/:id/audio` | GET | Optional | Get audio URL | Implemented | Secure streaming |
| `/beat/:id/artwork` | GET | Optional | Get artwork URL | Implemented | Image delivery |
| `/beat/:id/plays` | PATCH | Optional | Increment plays | Implemented | Analytics tracking |
| `/beat/:id/likes` | PATCH | Optional | Increment likes | Implemented | Social features |
| `/beat/:id/downloads` | PATCH | Optional | Increment downloads | Implemented | Analytics tracking |
| `/beat/:id/sales` | PATCH | Optional | Increment sales | Implemented | Analytics tracking |

## Stories & Status

### Story: My beat
- **Status**: Implemented
- **Current behavior**: Users can view their uploaded beats through `/beat/my-beats` endpoint. Beats displayed with status (draft, published, scheduled), analytics, and management options. Integrated with library components and creator profile views.
- **Acceptance criteria**: ✅ User's beats displayed, status filtering, management options available

### Story: Beat Page
- **Status**: Implemented
- **Current behavior**: Individual beat pages show detailed information including metadata, artwork, audio player, licensing options, and social features. Beat details fetched from `/beat/:id` endpoint with public access.
- **Acceptance criteria**: ✅ Beat details displayed, audio player working, licensing options available

### Story: Integrate published beat
- **Status**: Implemented
- **Current behavior**: Published beats are publicly accessible and discoverable. Integration includes proper status filtering, public visibility, and search functionality across the platform.
- **Acceptance criteria**: ✅ Published beats discoverable, public access working, search integration

### Story: Integrate All My Beats
- **Status**: Implemented
- **Current behavior**: User's complete beat library accessible through my-beats endpoint with filtering by status, search, and management capabilities. Includes draft, published, and scheduled beats.
- **Acceptance criteria**: ✅ All user beats accessible, status filtering working, management features available

### Story: Integrate Draft beat
- **Status**: Implemented
- **Current behavior**: Draft beats are private to the owner and accessible through my-beats endpoint with draft status filtering. Users can edit, publish, or delete draft beats.
- **Acceptance criteria**: ✅ Draft beats private, owner access only, editing capabilities available

### Story: Integrate Scheduled beat
- **Status**: Implemented
- **Current behavior**: Scheduled beats are private until release date, then automatically published. Users can view scheduled beats in my-beats with schedule information and management options.
- **Acceptance criteria**: ✅ Scheduled beats private until release, automatic publishing, schedule management

### Story: Play a beat
- **Status**: Implemented
- **Current behavior**: Beat playback integrated across platform with MediaPlayer component. Users can play beats from cards, detail pages, and playlists. Audio streaming uses secure URLs with proper authentication.
- **Acceptance criteria**: ✅ Beat playback working, secure streaming, cross-page integration

### Story: Implement Beat Playback
- **Status**: Implemented
- **Current behavior**: Comprehensive beat playback system with MediaPlayer component, context management, and secure audio streaming. Includes play/pause, progress tracking, and volume controls.
- **Acceptance criteria**: ✅ Playback system working, controls available, secure streaming

### Story: Redirect User to Explore page
- **Status**: Implemented
- **Current behavior**: Users are redirected to explore page after login and authentication. Explore page serves as main discovery interface with featured beats, playlists, and browsing capabilities.
- **Acceptance criteria**: ✅ Redirect working, explore page accessible, discovery features available

## Data & Validation

### Required inputs and constraints:
- **Beat ID**: Valid beat identifier for operations
- **Status filtering**: Draft, published, scheduled, archived
- **Search parameters**: Query, genre, BPM, key, price range
- **Pagination**: Page, limit parameters for large datasets
- **Sorting**: Newest, oldest, price, popularity options

### Key error cases the UI must handle:
- **Authentication errors**: Unauthorized access, expired tokens
- **Not found errors**: Beat doesn't exist, user doesn't own beat
- **Validation errors**: Invalid parameters, malformed requests
- **Network errors**: API failures, connection issues, timeout handling
- **Playback errors**: Audio streaming failures, format issues

## Open Risks / Decisions

- **Performance optimization**: Large beat collections may need pagination optimization
- **Search functionality**: Full-text search may need backend optimization
- **Analytics accuracy**: Play tracking needs to prevent duplicate counting
- **Audio streaming**: HLS processing and CDN optimization for large files
- **Caching strategy**: Beat data caching for improved performance
- **Real-time updates**: Beat status changes and analytics updates

## Test Scenarios

- **Beat discovery**: User browses beats, filtering and search work correctly
- **Beat details**: User views individual beat page, all information displayed
- **User library**: User views their beats, status filtering and management work
- **Beat playback**: User plays beats, audio streaming and controls work
- **Status management**: User publishes, unpublishes, and schedules beats
- **Search functionality**: User searches for beats, relevant results returned
- **Analytics tracking**: Play, like, download, and sales tracking work correctly
- **Error handling**: Invalid operations show appropriate error messages
- **Performance**: Large beat collections load efficiently with pagination
- **Security**: Unauthorized access properly blocked, secure URLs work correctly
