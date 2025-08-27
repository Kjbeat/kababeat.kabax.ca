# 🚀 Developer Quick Start Guide

## Get Started in 3 Steps

### 1. Install & Run
```bash
cd external-features/Upload
npm install
npm run dev:mongo
```

### 2. Open Browser
Navigate to `http://localhost:5173`

### 3. Start Coding
- **Main work area**: `src/modules/upload/components/`
- **Mock data**: `src/adapters/mongo/UploadDraftService.mongo.ts`
- **Service layer**: `src/modules/upload/api.ts`

## 🎯 Your Mission

You're building the **Upload module** - users can upload beats through a multi-step wizard with audio files, artwork, metadata, pricing, and collaborator management.

## 🔧 Key Files to Work On

### Mock Implementation (Start Here)
```bash
src/adapters/mongo/UploadDraftService.mongo.ts
src/adapters/mongo/StorageService.mongo.ts
```
- Add realistic mock data
- Implement all service methods
- Test with different scenarios

### UI Components
```bash
src/modules/upload/components/
├── UploadBeatLayout.tsx      # Main upload wizard
├── FileUploadStep.tsx        # Audio file upload
├── ArtworkUploadStep.tsx     # Artwork upload & editing
├── BeatInfoStep.tsx          # Beat metadata input
├── PricingStep.tsx           # Pricing & licensing
├── CollaboratorSplitStep.tsx # Collaborator management
├── ReviewStep.tsx            # Final review
└── AIUploadDialog.tsx        # AI-assisted features
```

### API Layer
```bash
src/modules/upload/api.ts
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
import { useUploadAPI } from '@/modules/upload/api';

const { createDraft, uploadAudioFile, publishDraft, loading, error } = useUploadAPI();
```

### 2. Mock Data Structure
```typescript
// In UploadDraftService.mongo.ts, add:
private mockDrafts: UploadDraft[] = [
  {
    id: '1',
    userId: 'mock-user-1',
    step: 1,
    data: { title: 'My New Beat', genre: 'Hip Hop' },
    collaborators: [],
    pricing: { basicPrice: 29, premiumPrice: 99, exclusivePrice: 299 },
    files: [],
    isComplete: false,
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

1. **Implement mock data** in `UploadDraftService.mongo.ts`
2. **Update UI components** to use the service layer
3. **Test all features** with the Dev User Switcher
4. **Polish the UI** and add proper states
5. **Document your work** in the code

## 🆘 Need Help?

- Check the service interfaces in `src/core/services/UploadDraftService.ts`
- Look at existing UI components for patterns
- Use the Dev User Switcher to test different scenarios
- All the architecture is set up - just focus on the upload features!

## ✅ Success Checklist

- [ ] Mock data is realistic and comprehensive
- [ ] All upload steps work correctly
- [ ] File uploads work properly
- [ ] UI is responsive and accessible
- [ ] Loading and error states are handled
- [ ] Dev User Switcher works for testing
- [ ] Code is clean and well-documented

**You're ready to build amazing upload features! 🎵**
