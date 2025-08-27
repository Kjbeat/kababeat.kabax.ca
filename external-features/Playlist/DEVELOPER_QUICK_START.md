# 🚀 Developer Quick Start Guide

## Get Started in 3 Steps

### 1. Install & Run
```bash
cd dev1-playlists-package
npm install
npm run dev:mongo
```

### 2. Open Browser
Navigate to `http://localhost:5173`

### 3. Start Coding
- **Main work area**: `src/modules/playlists/components/`
- **Mock data**: `src/adapters/mongo/PlaylistService.mongo.ts`
- **Service layer**: `src/modules/playlists/api.ts`

## 🎯 Your Mission

You're building the **Playlists module** - users can create, edit, share, and discover playlists of beats.

## 🔧 Key Files to Work On

### Mock Implementation (Start Here)
```bash
src/adapters/mongo/PlaylistService.mongo.ts
```
- Add realistic mock data
- Implement all service methods
- Test with different scenarios

### UI Components
```bash
src/modules/playlists/components/
├── PlaylistsLayout.tsx      # Main page layout
├── PlaylistGrid.tsx         # Grid view of playlists
├── CreatePlaylistModal.tsx  # Create new playlist
├── EditPlaylistModal.tsx    # Edit existing playlist
└── SharePlaylistModal.tsx   # Share functionality
```

### API Layer
```bash
src/modules/playlists/api.ts
```
- Already set up to use service layer
- Provides hooks for components

## 🧪 Testing

### Dev User Switcher
- Bottom-right corner of the app
- Click to switch between mock users
- Test authenticated features easily

### Mock Users Available
- `alice@example.com` (alice)
- `bob@example.com` (bob)  
- `charlie@example.com` (charlie)

## 📝 Development Tips

### 1. Service Layer Pattern
```typescript
// In your components, use:
import { usePlaylistsAPI } from '@/modules/playlists/api';

const { getUserPlaylists, createPlaylist, loading, error } = usePlaylistsAPI();
```

### 2. Mock Data Structure
```typescript
// In PlaylistService.mongo.ts, add:
private mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'My Favorite Beats',
    description: 'Collection of my top picks',
    curatorId: 'mock-user-1',
    curatorName: 'Alice',
    isPublic: true,
    isCollaborative: false,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
```

### 3. Error Handling
```typescript
// Always handle loading and error states:
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

## 🎨 UI Guidelines

- Use components from `src/components/ui/`
- Follow the existing design patterns
- Make it responsive (mobile-friendly)
- Add proper loading and error states

## 🔄 Next Steps

1. **Implement mock data** in `PlaylistService.mongo.ts`
2. **Update UI components** to use the service layer
3. **Test all features** with the Dev User Switcher
4. **Polish the UI** and add proper states
5. **Document your work** in the code

## 🆘 Need Help?

- Check the service interfaces in `src/core/services/PlaylistService.ts`
- Look at existing UI components for patterns
- Use the Dev User Switcher to test different scenarios
- All the architecture is set up - just focus on the playlists!

## ✅ Success Checklist

- [ ] Mock data is realistic and comprehensive
- [ ] All playlist CRUD operations work
- [ ] UI is responsive and accessible
- [ ] Loading and error states are handled
- [ ] Dev User Switcher works for testing
- [ ] Code is clean and well-documented

**You're ready to build amazing playlists! 🎵**
