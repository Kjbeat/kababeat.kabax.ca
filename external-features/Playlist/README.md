# Kababeat Playlists Module - Developer Package

This is an isolated development environment for working on the Playlists module of the Kababeat application.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev:mongo
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
dev1-playlists-package/
├── src/
│   ├── core/                 # Shared types and service interfaces
│   ├── adapters/            # Mock and Supabase implementations
│   ├── providers/           # Auth and Services providers
│   ├── modules/playlists/   # Playlists module components
│   ├── components/ui/       # UI components
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 Development Modes

### Mock Mode (Default)
- Uses in-memory mock data
- No backend required
- Perfect for UI development
- Start with: `npm run dev:mongo`

### Supabase Mode
- Uses real Supabase backend
- Requires Supabase configuration
- Start with: `npm run dev:supabase`

## 🎯 What You're Working On

### Playlists Module Features:
- Create, edit, and delete playlists
- Add/remove beats from playlists
- Share playlists
- Playlist collaboration
- Playlist discovery and browsing

### Key Components:
- `PlaylistsLayout` - Main playlists page
- `PlaylistGrid` - Grid view of playlists
- `CreatePlaylistModal` - Create new playlist
- `EditPlaylistModal` - Edit existing playlist
- `SharePlaylistModal` - Share playlist functionality

## 🛠️ Development Workflow

1. **Implement Mock Services:**
   - Edit files in `src/adapters/mongo/`
   - Add realistic mock data
   - Implement service methods

2. **Update UI Components:**
   - Work in `src/modules/playlists/components/`
   - Use the new service layer via `usePlaylistsAPI()`

3. **Test Features:**
   - Use the Dev User Switcher (bottom-right corner)
   - Switch between mock users to test different scenarios

## 🔌 Service Layer

The application uses a service layer pattern:

```typescript
// Use the service layer in components
import { usePlaylistsAPI } from '@/modules/playlists/api';

function MyComponent() {
  const { getUserPlaylists, createPlaylist, loading, error } = usePlaylistsAPI();
  
  // Your component logic here
}
```

## 🎨 UI Components

All UI components are in `src/components/ui/` and follow the shadcn/ui pattern. You can add new components as needed.

## 📝 Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# For mock development (default)
VITE_IMPL=mongo
VITE_AUTH=mock

# For Supabase development
VITE_IMPL=supabase
VITE_AUTH=supabase
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## 🧪 Testing

- Use the Dev User Switcher to test authenticated features
- Mock data is in `src/adapters/mongo/` - update it for realistic testing
- All service methods should be implemented in the mock adapters

## 📦 Building

```bash
# Build for mock mode
npm run build:mongo

# Build for Supabase mode
npm run build:supabase
```

## 🔄 Integration

When ready to integrate with the main project:
1. Your UI components will work unchanged
2. The service layer provides a clean interface
3. Mock implementations can be replaced with real ones
4. No changes needed to the UI code

## 🆘 Getting Help

- Check the service interfaces in `src/core/services/`
- Look at the mock implementations for examples
- Use the Dev User Switcher for testing
- All components use the new service layer

## 🎉 Success Criteria

Your work is complete when:
- [ ] All playlist features work with mock data
- [ ] UI is responsive and accessible
- [ ] Error states are handled gracefully
- [ ] Loading states are implemented
- [ ] Components follow the design system
- [ ] Code is clean and well-documented

Happy coding! 🎵
