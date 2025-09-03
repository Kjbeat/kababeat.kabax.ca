# KabaBeats Architecture Documentation

## Project Overview

KabaBeats is a full-stack music marketplace platform built with modern web technologies. The platform enables producers to upload, sell, and manage their beats while providing users with discovery, playback, and purchasing capabilities.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with custom hooks
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Package Manager**: npm/bun

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudflare R2
- **Email Service**: Nodemailer with SMTP
- **Media Processing**: FFmpeg (implied)
- **Caching**: Redis
- **Validation**: Joi
- **File Upload**: Multer
- **Package Manager**: npm

### Infrastructure & Services
- **CDN**: Cloudflare
- **File Storage**: Cloudflare R2
- **Email**: SMTP (configurable provider)
- **Deployment**: Vercel (Frontend), Node.js hosting (Backend)
- **Environment**: Development, Staging, Production

## Project Structure

```
kababeat.kabax.ca/
├── KabaBeats-Frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── beat-card/      # Beat-specific components
│   │   │   ├── media/          # Media player components
│   │   │   └── shared/         # Shared components
│   │   ├── contexts/           # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── modules/            # Feature-based modules
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── upload/         # Upload module
│   │   │   ├── explore/        # Discovery module
│   │   │   ├── playlists/      # Playlist module
│   │   │   ├── favorites/      # Favorites module
│   │   │   ├── browse/         # Browse module
│   │   │   ├── beat/           # Beat detail module
│   │   │   ├── creator/        # Creator profile module
│   │   │   ├── library/        # User library module
│   │   │   ├── dashboard/      # Dashboard module
│   │   │   ├── checkout/       # Checkout module
│   │   │   └── notifications/  # Notifications module
│   │   ├── interface-types/    # TypeScript interfaces
│   │   ├── lib/                # Utility libraries
│   │   └── utils/              # Helper functions
│   ├── public/                 # Static assets
│   └── docs/                   # Frontend documentation
└── KabaBeats-Backend/          # Node.js backend application
    ├── src/
    │   ├── config/             # Configuration files
    │   ├── modules/            # Feature modules
    │   │   ├── auth/           # Authentication module
    │   │   ├── beat/           # Beat management module
    │   │   ├── media/          # Media processing module
    │   │   ├── playlist/       # Playlist module
    │   │   ├── license/        # License module
    │   │   └── user/           # User management module
    │   ├── routes/             # API routes
    │   │   └── v1/             # API version 1
    │   ├── middleware/         # Express middleware
    │   ├── utils/              # Utility functions
    │   ├── types/              # TypeScript types
    │   └── scripts/            # Database scripts
    ├── logs/                   # Application logs
    └── docs/                   # Backend documentation
```

## Architecture Patterns

### Frontend Architecture

#### 1. Module-Based Organization
- **Feature Modules**: Each major feature is organized in its own module
- **Component Hierarchy**: Components are organized by feature and reusability
- **Context Providers**: Global state managed through React Context
- **Custom Hooks**: Business logic encapsulated in reusable hooks

#### 2. State Management Strategy
```typescript
// Context-based state management
- AuthContext: User authentication and session
- MediaPlayerContext: Audio playback state
- CartContext: Shopping cart state
- FavoritesContext: User favorites
- PlaylistsContext: Playlist management
- NotificationsContext: System notifications
- LanguageContext: Internationalization
```

#### 3. Component Architecture
```typescript
// Component structure pattern
interface ComponentProps {
  // Props interface
}

export function Component({ props }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### Backend Architecture

#### 1. Layered Architecture
```
Routes (Controllers) → Services → Models → Database
```

#### 2. Module Structure
Each module follows the same pattern:
```
module/
├── module.controller.ts    # HTTP request handling
├── module.service.ts       # Business logic
├── module.model.ts         # Database schema
├── module.interface.ts     # TypeScript interfaces
└── index.ts               # Module exports
```

#### 3. API Design
- **RESTful APIs**: Standard HTTP methods and status codes
- **Versioning**: API versioning through URL paths (`/api/v1/`)
- **Validation**: Request validation using Joi schemas
- **Error Handling**: Consistent error response format
- **Authentication**: JWT-based authentication middleware

## Data Flow

### Frontend Data Flow
```
User Action → Component → Hook/Context → API Call → Backend → Database
                ↓
            State Update → UI Re-render
```

### Backend Data Flow
```
HTTP Request → Middleware → Controller → Service → Model → Database
                ↓
            Response ← JSON ← Business Logic ← Data Processing
```

## Key Features & Modules

### 1. Authentication System
- **JWT Tokens**: Access and refresh token strategy
- **OTP Verification**: Email-based verification
- **Google OAuth**: Social authentication
- **Password Management**: Secure password handling
- **Session Management**: Multi-device session support

### 2. File Upload System
- **Chunked Upload**: Large file upload support
- **Media Processing**: Audio and image processing
- **Storage Integration**: Cloudflare R2 integration
- **Progress Tracking**: Real-time upload progress

### 3. Media Playback
- **Audio Streaming**: Secure audio URL generation
- **HLS Support**: Adaptive streaming for large files
- **CDN Integration**: Optimized media delivery
- **Player Controls**: Custom media player component

### 4. Beat Management
- **CRUD Operations**: Create, read, update, delete beats
- **Status Management**: Draft, published, scheduled states
- **Analytics**: Play, like, download, sales tracking
- **Search & Discovery**: Advanced filtering and search

### 5. Licensing System
- **Multiple License Types**: MP3, WAV, Exclusive, etc.
- **Dynamic Pricing**: User-configurable pricing
- **Usage Rights**: Detailed usage restrictions
- **Currency Support**: Multi-currency pricing

## Development Guidelines

### Code Standards

#### TypeScript
- **Strict Mode**: Enable strict TypeScript configuration
- **Interface Definitions**: Define clear interfaces for all data structures
- **Type Safety**: Avoid `any` types, use proper typing
- **Generic Types**: Use generics for reusable components

#### React Best Practices
- **Functional Components**: Use function components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Component Composition**: Prefer composition over inheritance
- **Props Interface**: Define clear prop interfaces
- **Error Boundaries**: Implement error boundaries for error handling

#### Backend Best Practices
- **Error Handling**: Consistent error handling and logging
- **Validation**: Validate all inputs using Joi schemas
- **Security**: Implement proper authentication and authorization
- **Performance**: Optimize database queries and API responses
- **Documentation**: Document all API endpoints and business logic

### File Naming Conventions

#### Frontend
```
Components: PascalCase (e.g., BeatCard.tsx)
Hooks: camelCase with 'use' prefix (e.g., useAuth.ts)
Utils: camelCase (e.g., formatPrice.ts)
Types: PascalCase (e.g., BeatInterface.ts)
```

#### Backend
```
Controllers: kebab-case.controller.ts (e.g., auth.controller.ts)
Services: kebab-case.service.ts (e.g., auth.service.ts)
Models: kebab-case.model.ts (e.g., user.model.ts)
Routes: kebab-case.routes.ts (e.g., auth.routes.ts)
```

### Environment Configuration

#### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=KabaBeats
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Backend Environment Variables
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kababeats
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDFLARE_R2_ACCESS_KEY=your_r2_access_key
CLOUDFLARE_R2_SECRET_KEY=your_r2_secret_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register          # User registration
POST /api/v1/auth/login             # User login
POST /api/v1/auth/refresh-token     # Token refresh
POST /api/v1/auth/logout            # User logout
POST /api/v1/auth/forgot-password   # Password reset request
POST /api/v1/auth/reset-password    # Password reset completion
```

### Beat Management Endpoints
```
GET    /api/v1/beat/                # Get beats (with filters)
POST   /api/v1/beat/                # Create beat
GET    /api/v1/beat/:id             # Get beat details
PUT    /api/v1/beat/:id             # Update beat
DELETE /api/v1/beat/:id             # Delete beat
PATCH  /api/v1/beat/:id/publish     # Publish beat
PATCH  /api/v1/beat/:id/schedule    # Schedule beat
```

### Media Endpoints
```
POST /api/v1/media/upload-url       # Generate upload URL
POST /api/v1/media/confirm-upload   # Confirm file upload
GET  /api/v1/media/download-url     # Get download URL
POST /api/v1/media/chunked/initialize # Initialize chunked upload
```

## Database Schema

### Users Collection
```typescript
interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  role: 'user' | 'creator' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  refreshTokens: string[];
  emailVerificationOTP?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  socialLinks?: SocialLinks;
  themePreferences?: ThemePreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### Beats Collection
```typescript
interface Beat {
  _id: ObjectId;
  title: string;
  producer: string;
  description?: string;
  artwork?: string;
  audioFile?: string;
  bpm: number;
  key: string;
  genre: string;
  mood?: string;
  tags: string[];
  allowFreeDownload: boolean;
  basePrice: number;
  salePrice?: number;
  isExclusive: boolean;
  duration?: number;
  fileSize?: number;
  audioFormat: 'mp3' | 'wav' | 'm4a';
  hlsUrl?: string;
  hlsProcessed: boolean;
  storageKey?: string;
  stemsStorageKey?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledDate?: Date;
  plays: number;
  likes: number;
  downloads: number;
  sales: number;
  collaborators: Collaborator[];
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting for security
- **CORS**: Proper CORS configuration
- **Input Validation**: Comprehensive input validation

### Data Protection
- **Environment Variables**: Sensitive data in environment variables
- **Database Security**: MongoDB security best practices
- **File Upload Security**: File type and size validation
- **XSS Protection**: Input sanitization and output encoding

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized image delivery
- **Caching**: Browser caching strategies
- **Bundle Optimization**: Vite build optimization

### Backend Optimization
- **Database Indexing**: Proper MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Cloudflare CDN for static assets

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component and hook testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing

### Backend Testing
- **Unit Tests**: Service and utility function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Database operation testing

## Deployment

### Frontend Deployment (Vercel)
```bash
# Build and deploy
npm run build
vercel deploy
```

### Backend Deployment
```bash
# Build and start
npm run build
npm start
```

## Monitoring & Logging

### Application Logging
- **Winston**: Structured logging
- **Error Tracking**: Error monitoring and alerting
- **Performance Monitoring**: API response time tracking

### Database Monitoring
- **Query Performance**: Slow query monitoring
- **Connection Pooling**: Database connection management
- **Backup Strategy**: Regular database backups

## Development Workflow

### Git Workflow
1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: Code review through pull requests
3. **Testing**: Run tests before merging
4. **Deployment**: Automated deployment on merge

### Code Review Process
1. **Automated Checks**: Linting, formatting, type checking
2. **Manual Review**: Peer code review
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update documentation as needed

## Troubleshooting Guide

### Common Issues

#### Frontend Issues
- **Build Errors**: Check TypeScript errors and dependencies
- **Runtime Errors**: Check browser console and network requests
- **Performance Issues**: Use React DevTools for profiling

#### Backend Issues
- **Database Connection**: Check MongoDB connection string
- **Authentication**: Verify JWT secret configuration
- **File Upload**: Check Cloudflare R2 credentials
- **Email Service**: Verify SMTP configuration

### Debugging Tools
- **Frontend**: React DevTools, Browser DevTools
- **Backend**: Node.js debugger, MongoDB Compass
- **Network**: Postman, curl for API testing

## Contributing Guidelines

### Getting Started
1. **Clone Repository**: Clone the project repository
2. **Install Dependencies**: Run `npm install` in both frontend and backend
3. **Environment Setup**: Configure environment variables
4. **Database Setup**: Set up MongoDB database
5. **Start Development**: Run development servers

### Code Contribution
1. **Follow Standards**: Adhere to coding standards and conventions
2. **Write Tests**: Include tests for new features
3. **Update Documentation**: Update relevant documentation
4. **Submit PR**: Create pull request with clear description

This architecture documentation provides a comprehensive guide for developers to understand, navigate, and contribute to the KabaBeats project effectively.
