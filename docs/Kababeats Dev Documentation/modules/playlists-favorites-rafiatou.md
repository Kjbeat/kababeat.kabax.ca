# Playlists & Favorites — Rafiatou

## Purpose & User Value

The Playlists & Favorites module enables users to organize and manage their music collections. Users can create custom playlists, add beats to playlists, manage favorites, and share their curated collections. This module provides personal music organization tools and social sharing capabilities for the beat marketplace.

## Current Frontend Flow

### Main routes/components involved:
- **Playlists Layout**: `src/modules/playlists/components/PlaylistsLayout.tsx` - main playlists management interface
- **Playlist Grid**: `src/modules/playlists/components/PlaylistGrid.tsx` - displays playlists in grid format
- **Playlist Detail**: `src/modules/playlists/components/PlaylistDetailLayout.tsx` - individual playlist view
- **Create/Edit Modals**: `src/modules/playlists/components/CreatePlaylistModal.tsx`, `EditPlaylistModal.tsx`
- **Favorites Layout**: `src/modules/favorites/components/FavoritesLayout.tsx` - favorites management
- **Playlist Context**: `src/contexts/PlaylistsContext.tsx` - playlist state management
- **Favorites Context**: `src/contexts/FavoritesContext.tsx` - favorites state management

### State management and key hooks:
- `usePlaylists()` hook manages playlist CRUD operations and state
- `useFavorites()` hook manages liked beats and favorites functionality
- Local storage for user preferences (search, filters, sort options)
- Mock data currently used for development (playlists and beats)

### How the UI calls services/handlers:
- Playlist operations call `/api/v1/playlist/*` endpoints
- Favorites use local context state (not yet connected to backend)
- Search and filtering handled client-side with mock data
- Playlist sharing and social features use placeholder implementations

## Current Backend/API Flow

### Handlers/routes involved:
- **Playlist Routes**: `src/routes/v1/playlist.routes.ts` - comprehensive playlist endpoints
- **Playlist Controller**: `src/modules/playlist/playlist.controller.ts` - handles all playlist operations
- **Playlist Service**: `src/modules/playlist/playlist.service.ts` - business logic and database operations
- **Playlist Model**: `src/modules/playlist/playlist.model.ts` - playlist data structure

### Auth/ownership checks expected:
- JWT token validation via `authMiddleware` for playlist creation/modification
- User ownership verification for playlist updates and deletion
- Public/private playlist visibility controls
- Permission checks for playlist sharing and collaboration

### DB collections/documents touched:
- **playlists** collection - stores playlist metadata, tracks, curator info, stats
- **users** collection - playlist ownership and curator information

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/playlist/` | POST | Required | Create playlist | Implemented | Full CRUD support |
| `/playlist/:playlistId` | GET | Optional | Get playlist details | Implemented | Public/private visibility |
| `/playlist/:playlistId` | PUT | Required | Update playlist | Implemented | Owner verification |
| `/playlist/:playlistId` | DELETE | Required | Delete playlist | Implemented | Owner verification |
| `/playlist/user/:userId` | GET | Optional | Get user playlists | Implemented | Public playlists only |
| `/playlist/user/me` | GET | Required | Get my playlists | Implemented | All user playlists |
| `/playlist/featured` | GET | None | Get featured playlists | Implemented | Public endpoint |
| `/playlist/trending` | GET | None | Get trending playlists | Implemented | Public endpoint |
| `/playlist/search` | GET | Optional | Search playlists | Implemented | Public search |
| `/playlist/:playlistId/tracks` | GET | Optional | Get playlist tracks | Implemented | Populated beat data |
| `/playlist/:playlistId/tracks` | POST | Required | Add track to playlist | Implemented | Owner verification |
| `/playlist/:playlistId/tracks` | DELETE | Required | Remove track from playlist | Implemented | Owner verification |
| `/playlist/:playlistId/tracks/reorder` | PUT | Required | Reorder tracks | Implemented | Owner verification |
| `/playlist/:playlistId/like` | POST | Required | Like playlist | Implemented | Social features |
| `/playlist/:playlistId/like` | DELETE | Required | Unlike playlist | Implemented | Social features |
| `/playlist/:playlistId/share` | POST | Required | Share playlist | Implemented | Social features |
| `/playlist/:playlistId/play` | POST | Optional | Play playlist | Implemented | Analytics tracking |
| `/playlist/:playlistId/duplicate` | POST | Required | Duplicate playlist | Implemented | Owner verification |
| `/playlist/:playlistId/stats` | GET | Optional | Get playlist stats | Implemented | Public analytics |

## Stories & Status

### Story: Display favorite page
- **Status**: Implemented
- **Current behavior**: Favorites page displays liked beats in grid/list view with search functionality. Users can play all favorites, remove individual items, and manage their favorites collection through the FavoritesLayout component.
- **Acceptance criteria**: ✅ Favorites displayed, search functionality, play all feature, remove items capability

### Story: Favorite page
- **Status**: Implemented
- **Current behavior**: Main favorites interface provides comprehensive favorites management with infinite scroll, bulk operations, and responsive design. Uses FavoritesContext for state management.
- **Acceptance criteria**: ✅ Favorites management, infinite scroll, bulk operations, responsive design

### Story: Create favorites pages
- **Status**: Implemented
- **Current behavior**: Favorites pages created with proper routing and component structure. Includes search, filtering, and management capabilities for liked beats.
- **Acceptance criteria**: ✅ Favorites pages created, routing implemented, management features working

### Story: Playlist page
- **Status**: Implemented
- **Current behavior**: Playlist detail page shows individual playlist with tracks, metadata, and social features. Includes play functionality, sharing options, and track management.
- **Acceptance criteria**: ✅ Playlist details displayed, tracks shown, social features available

### Story: Create new playlist
- **Status**: Implemented
- **Current behavior**: Users can create playlists via CreatePlaylistModal with title, description, cover image, and privacy settings. Form validation and submission handled through playlist API.
- **Acceptance criteria**: ✅ Playlist creation form, validation, API integration, success handling

### Story: Add beat to user playlists
- **Status**: Implemented
- **Current behavior**: Beats can be added to playlists via `/playlist/:playlistId/tracks` endpoint. Users can select from their playlists and add beats with proper ownership verification.
- **Acceptance criteria**: ✅ Beat addition to playlists, ownership verification, playlist selection

### Story: Delete playlist
- **Status**: Implemented
- **Current behavior**: Playlists can be deleted via `/playlist/:playlistId` (DELETE) endpoint. Requires owner verification and provides confirmation dialog in UI.
- **Acceptance criteria**: ✅ Playlist deletion, owner verification, confirmation dialog

## Data & Validation

### Required inputs and constraints:
- **Playlist title**: 1-100 characters, required for creation
- **Description**: Maximum 500 characters, optional
- **Cover image**: Valid URL format, optional
- **Privacy settings**: Boolean for public/private visibility
- **Tags**: Array of strings, maximum 10 tags, 50 characters each
- **Genre/Mood**: Optional categorization fields
- **Track management**: Beat IDs must be valid and accessible

### Key error cases the UI must handle:
- **Authentication errors**: Unauthorized access to private playlists, expired tokens
- **Validation errors**: Invalid playlist data, duplicate names, invalid beat IDs
- **Permission errors**: Attempting to modify playlists user doesn't own
- **Network errors**: API failures, connection issues, timeout handling
- **Data errors**: Missing playlists, invalid track references, corrupted data

## Open Risks / Decisions

- **Favorites backend integration**: Currently using mock data, needs backend API connection
- **Playlist collaboration**: No multi-user playlist editing implemented
- **Playlist analytics**: Basic stats implemented, may need enhanced analytics
- **Search performance**: Client-side search may need backend optimization for large datasets
- **Playlist sharing**: Basic sharing implemented, may need enhanced social features
- **Offline support**: No offline playlist management currently implemented

## Test Scenarios

- **Create playlist**: User creates new playlist with valid data, playlist appears in user's collection
- **Add beats to playlist**: User adds beats to playlist, tracks appear in playlist detail view
- **Delete playlist**: User deletes playlist, playlist removed from collection and database
- **Playlist privacy**: Private playlists not visible to other users, public playlists accessible
- **Search playlists**: User searches for playlists, relevant results returned with proper filtering
- **Favorites management**: User likes/unlikes beats, favorites list updates accordingly
- **Playlist sharing**: User shares playlist, sharing functionality works with proper permissions
- **Track reordering**: User reorders tracks in playlist, new order persisted and displayed
- **Playlist duplication**: User duplicates playlist, new playlist created with same tracks
- **Error handling**: Invalid operations show appropriate error messages and don't break UI
