# Explore Module

This module contains the main explore/discovery page for the Kababeats application.

## Structure

```
explore/
├── ExploreMain.tsx          # Main explore page component
├── index.ts                 # Module exports
├── components/              # Reusable UI components
│   ├── index.ts            # Component exports
│   ├── HeroSection.tsx     # Hero banner with CTA buttons
│   ├── StatsSection.tsx    # Statistics display cards
│   ├── CuratedPlaylistsSection.tsx  # Curated playlists grid
│   ├── FeaturedBeatsSection.tsx     # Trending beats grid
│   ├── InfiniteScrollBeatsSection.tsx  # Infinite scroll beats
│   └── GenresSection.tsx   # Genre badges section
├── hooks/                   # Custom hooks
│   ├── index.ts            # Hook exports
│   └── useInfiniteScrollBeats.ts  # Infinite scroll logic
└── utils/                   # Utility functions and data
    ├── index.ts            # Utility exports
    └── mockData.ts         # Mock data generators
```

## Components

### HeroSection
Main hero banner with call-to-action buttons for exploring and uploading beats.

### StatsSection
Displays platform statistics (beats count, producers count, downloads).

### CuratedPlaylistsSection
Shows curated playlists with proper grid layout.

### FeaturedBeatsSection
Displays trending/featured beats in a grid layout.

### InfiniteScrollBeatsSection
Handles infinite scrolling for additional beats with loading states.

### GenresSection
Genre badges for filtering/browsing by music genre.

## Hooks

### useInfiniteScrollBeats
Custom hook that manages:
- Beat data loading
- Infinite scroll logic
- Loading states
- End-of-data detection

## Utils

### mockData.ts
Contains:
- Mock playlist data
- Beat generation functions
- Sample data for development

## Usage

The explore page is accessible at `/explore` route and requires authentication. It serves as the main discovery page where users can:

- Browse trending beats
- Explore curated playlists
- Discover new producers
- Filter by genres
- Play beats using the media player
- Infinite scroll through more content
