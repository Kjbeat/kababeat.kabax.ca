# KabaBeats Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    KabaBeats Platform                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Frontend (React)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Auth      │  │   Upload    │  │   Explore   │  │  Playlists  │           │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │    Beat     │  │   Creator   │  │   Library   │  │  Checkout   │           │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        React Context Providers                         │   │
│  │  AuthContext │ MediaPlayerContext │ CartContext │ FavoritesContext     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/HTTPS API Calls
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Backend (Node.js)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Auth      │  │   Beat      │  │   Media     │  │  Playlist   │           │
│  │  Controller │  │  Controller │  │  Controller │  │  Controller │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   License   │  │    User     │  │   Upload    │  │   Browse    │           │
│  │  Controller │  │  Controller │  │  Controller │  │  Controller │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                            Services Layer                              │   │
│  │  AuthService │ BeatService │ MediaService │ PlaylistService │ etc.     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                            Models Layer                                 │   │
│  │  UserModel │ BeatModel │ MediaModel │ PlaylistModel │ LicenseModel     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database Operations
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Database Layer                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │    Users    │  │    Beats    │  │   Media     │  │  Playlists  │           │
│  │  Collection │  │  Collection │  │  Collection │  │  Collection │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Licenses   │  │   User      │  │   Redis     │  │   Logs      │           │
│  │  Collection │  │  Settings   │  │   Cache     │  │  Collection │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              User Interaction Flow                             │
└─────────────────────────────────────────────────────────────────────────────────┘

User Action → Frontend Component → Context/Hook → API Call → Backend Controller
     │                                                                      │
     │                                                                      ▼
     │                                                              Service Layer
     │                                                                      │
     │                                                                      ▼
     │                                                              Database Layer
     │                                                                      │
     │                                                                      ▼
     │                                                              Response Data
     │                                                                      │
     ▼                                                                      │
UI Update ← State Update ← Context Update ← API Response ← JSON Response ←──┘
```

## File Upload Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              File Upload Flow                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Frontend Upload → Chunked Upload → Cloudflare R2 → Media Processing → Database
     │                                                                      │
     │                                                                      ▼
     │                                                              File Metadata
     │                                                                      │
     ▼                                                                      │
Progress UI ← Upload Progress ← Chunk Status ← File Assembly ←──┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Authentication Flow                               │
└─────────────────────────────────────────────────────────────────────────────────┘

Login Request → JWT Generation → Token Storage → Protected Routes → Token Validation
     │                                                                      │
     │                                                                      ▼
     │                                                              User Access
     │                                                                      │
     ▼                                                                      │
Session Management ← Refresh Token ← Token Expiry ← Access Control ←──┘
```

## Media Playback Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Media Playback Flow                               │
└─────────────────────────────────────────────────────────────────────────────────┘

Play Request → Secure URL Generation → CDN Delivery → Audio Streaming → Player Controls
     │                                                                      │
     │                                                                      ▼
     │                                                              Playback State
     │                                                                      │
     ▼                                                                      │
Analytics Tracking ← Play Count ← Stream Complete ← Media Player ←──┘
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Technology Stack                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Frontend                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router       │
│  Context API + Custom Hooks + React Hook Form + Lucide Icons                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/HTTPS
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Backend                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Node.js + Express.js + TypeScript + MongoDB + Mongoose + JWT + Redis         │
│  Multer + Joi + Nodemailer + Cloudflare R2 + FFmpeg                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Database & Storage
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              External Services                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas + Cloudflare R2 + SMTP Provider + Google OAuth + CDN           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Module Dependencies                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Auth     │───▶│    User     │───▶│    Beat     │───▶│   Media     │
│   Module    │    │   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Playlist   │    │   License   │    │   Upload    │    │   Browse    │
│   Module    │    │   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Favorites  │    │   Cart      │    │  Checkout   │    │ Analytics   │
│   Module    │    │   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## API Endpoint Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Endpoint Structure                            │
└─────────────────────────────────────────────────────────────────────────────────┘

/api/v1/
├── auth/
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   ├── POST /forgot-password
│   ├── POST /reset-password
│   ├── POST /verify-otp
│   ├── POST /resend-otp
│   ├── GET /profile
│   ├── PUT /profile
│   ├── DELETE /account
│   ├── PUT /theme-preferences
│   └── GET /theme-preferences
├── beat/
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   ├── PATCH /:id/publish
│   ├── PATCH /:id/unpublish
│   ├── PATCH /:id/schedule
│   ├── GET /my-beats
│   ├── GET /stats
│   ├── GET /search
│   ├── GET /:id/audio
│   ├── GET /:id/artwork
│   ├── PATCH /:id/plays
│   ├── PATCH /:id/likes
│   ├── PATCH /:id/downloads
│   └── PATCH /:id/sales
├── media/
│   ├── POST /upload-url
│   ├── POST /confirm-upload
│   ├── GET /download-url
│   ├── DELETE /delete
│   ├── GET /user-files
│   ├── PUT /update-metadata
│   ├── POST /chunked/initialize
│   ├── POST /chunked/upload-url
│   ├── POST /chunked/mark-uploaded
│   ├── GET /chunked/progress
│   ├── POST /chunked/complete
│   └── POST /chunked/abort
├── playlist/
│   ├── GET /
│   ├── POST /
│   ├── GET /:playlistId
│   ├── PUT /:playlistId
│   ├── DELETE /:playlistId
│   ├── GET /user/:userId
│   ├── GET /user/me
│   ├── GET /featured
│   ├── GET /trending
│   ├── GET /search
│   ├── GET /:playlistId/tracks
│   ├── POST /:playlistId/tracks
│   ├── DELETE /:playlistId/tracks
│   ├── PUT /:playlistId/tracks/reorder
│   ├── POST /:playlistId/like
│   ├── DELETE /:playlistId/like
│   ├── POST /:playlistId/share
│   ├── POST /:playlistId/play
│   ├── POST /:playlistId/duplicate
│   └── GET /:playlistId/stats
├── license/
│   ├── GET /
│   ├── GET /active
│   ├── GET /:id
│   ├── GET /type/:type
│   ├── POST /
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── POST /calculate-price
├── user/
│   ├── GET /profile/me
│   ├── PUT /profile
│   ├── GET /:userId
│   ├── GET /:userId/followers
│   ├── GET /:userId/following
│   ├── POST /:targetUserId/follow
│   ├── DELETE /:targetUserId/follow
│   ├── GET /search
│   ├── GET /top-producers
│   ├── GET /recent
│   └── GET /recommendations
└── user-license-settings/
    ├── GET /
    ├── PUT /
    ├── POST /default
    └── GET /user/:userId
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Security Layers                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  Frontend Security                                                             │
│  • Input Validation                                                            │
│  • XSS Protection                                                              │
│  • CSRF Protection                                                             │
│  • Secure Token Storage                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Backend Security                                                              │
│  • JWT Authentication                                                          │
│  • Password Hashing (bcrypt)                                                   │
│  • Rate Limiting                                                               │
│  • Input Validation (Joi)                                                      │
│  • CORS Configuration                                                          │
│  • File Upload Security                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Secure Connection
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Database Security                                                             │
│  • MongoDB Authentication                                                      │
│  • Connection Encryption                                                       │
│  • Data Validation                                                             │
│  • Access Control                                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

This architecture diagram provides a comprehensive visual representation of the KabaBeats platform structure, data flow, and technology stack to help developers understand the system architecture and navigate the codebase effectively.
