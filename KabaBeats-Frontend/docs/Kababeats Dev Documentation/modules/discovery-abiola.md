# Discovery & Search — Abiola

## Purpose & User Value

The Discovery & Search module provides comprehensive beat discovery, filtering, and search capabilities. Users can explore beats by genre, mood, BPM, and other criteria, with advanced filtering and sorting options. The module enables content discovery through curated sections, trending content, and personalized recommendations.

## Current Frontend Flow

### Main routes/components involved:
- **Explore Main**: `src/modules/explore/ExploreMain.tsx` - main discovery interface
- **Browse Layout**: `src/modules/browse/components/BrowseLayout.tsx` - beat browsing with filters
- **Browse Filters**: `src/modules/browse/components/BrowseFilters.tsx` - filtering interface
- **Hero Section**: `src/modules/explore/components/HeroSection.tsx` - discovery landing
- **Featured Beats**: `src/modules/explore/components/FeaturedBeatsSection.tsx` - curated content
- **Infinite Scroll**: `src/modules/explore/components/InfiniteScrollBeatsSection.tsx` - pagination
- **Curated Playlists**: `src/modules/explore/components/CuratedPlaylistsSection.tsx` - playlist discovery
- **Genres Section**: `src/modules/explore/components/GenresSection.tsx` - genre browsing

### State management and key hooks:
- `useInfiniteScrollBeats()` hook manages beat loading and pagination
- Filter state managed through URL parameters and local state
- Search functionality integrated with beat API endpoints
- Caching and optimization for large datasets

### How the UI calls services/handlers:
- Beat discovery uses `/api/v1/beat/` (GET) with query parameters
- Search functionality uses `/api/v1/beat/search` (GET) endpoint
- Browse routes use `/api/v1/browse/*` endpoints (placeholder implementation)
- Filtering and sorting handled through API query parameters

## Current Backend/API Flow

### Handlers/routes involved:
- **Beat Routes**: `src/routes/v1/beat.routes.ts` - beat discovery and search
- **Browse Routes**: `src/routes/v1/browse.routes.ts` - browsing endpoints (placeholder)
- **Beat Controller**: `src/modules/beat/beat.controller.ts` - beat operations
- **Beat Service**: `src/modules/beat/beat.service.ts` - search and filtering logic

### Auth/ownership checks expected:
- Optional authentication for personalized content
- Public access for general discovery and search
- User-specific filtering and recommendations
- Rate limiting for search operations

### DB collections/documents touched:
- **beats** collection - beat metadata, tags, analytics for search
- **playlists** collection - curated content and featured playlists
- **users** collection - user preferences and search history

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/beat/` | GET | Optional | Browse beats | Implemented | Public discovery |
| `/beat/search` | GET | Optional | Search beats | Implemented | Full-text search |
| `/browse/beats` | GET | Optional | Browse with filters | Pending | Placeholder only |
| `/browse/genres` | GET | None | Get available genres | Pending | Placeholder only |
| `/browse/moods` | GET | None | Get available moods | Pending | Placeholder only |
| `/browse/keys` | GET | None | Get available keys | Pending | Placeholder only |
| `/browse/filters` | GET | None | Get filter options | Pending | Placeholder only |
| `/playlist/featured` | GET | None | Get featured playlists | Implemented | Curated content |
| `/playlist/trending` | GET | None | Get trending playlists | Implemented | Popular content |

## Stories & Status

### Story: Create Filter
- **Status**: Pending
- **How it should work**: Advanced filtering system should allow users to filter beats by multiple criteria including genre, mood, BPM range, key, price range, and tags. Filters should be combinable and provide real-time results with proper URL state management.
- **Acceptance criteria**: 
  - Multiple filter criteria available (genre, mood, BPM, key, price, tags)
  - Filters can be combined for precise results
  - Real-time filtering with URL state management
  - Filter persistence across page navigation
  - Clear filter options and reset functionality

### Story: Create Search
- **Status**: Implemented
- **Current behavior**: Search functionality implemented through `/beat/search` endpoint. Users can search beats by title, producer, and tags with pagination and sorting options. Search results displayed with proper filtering and relevance ranking.
- **Acceptance criteria**: ✅ Search functionality working, results displayed, pagination available

### Story: Create Sort
- **Status**: Implemented
- **Current behavior**: Sorting functionality implemented through beat API with options for newest, oldest, price (low/high), popularity, plays, and likes. Sorting integrated with search and browse functionality.
- **Acceptance criteria**: ✅ Sorting options available, results properly sorted, integration working

## Data & Validation

### Required inputs and constraints:
- **Search query**: Text search with minimum length requirements
- **Filter parameters**: Genre, mood, BPM range, key, price range, tags
- **Sort options**: Newest, oldest, price, popularity, plays, likes
- **Pagination**: Page and limit parameters for large result sets
- **Authentication**: Optional for personalized results

### Key error cases the UI must handle:
- **Search errors**: Invalid queries, empty results, search failures
- **Filter errors**: Invalid filter combinations, no results found
- **Network errors**: API failures, connection issues, timeout handling
- **Performance errors**: Large result sets, slow queries, pagination issues
- **Validation errors**: Invalid parameters, malformed requests

## Open Risks / Decisions

- **Search performance**: Full-text search may need optimization for large datasets
- **Filter complexity**: Complex filter combinations may impact performance
- **Real-time updates**: Search results may need real-time updates for new content
- **Personalization**: User-specific recommendations and search history
- **Caching strategy**: Search result caching for improved performance
- **Analytics**: Search analytics and user behavior tracking

## Test Scenarios

- **Basic search**: User searches for beats, relevant results returned
- **Advanced filtering**: User applies multiple filters, results properly filtered
- **Sorting functionality**: User sorts results, proper ordering displayed
- **Pagination**: User navigates through large result sets, pagination works
- **Empty results**: User searches with no results, appropriate message displayed
- **Filter combinations**: User combines multiple filters, results accurate
- **Search suggestions**: User gets search suggestions and autocomplete
- **Performance**: Large searches complete within acceptable time limits
- **Error handling**: Search failures show appropriate error messages
- **URL state**: Search and filter state properly reflected in URL
