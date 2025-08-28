# 🎵 KabaBeat - Complete Architecture Documentation

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  React App (Vite + TypeScript)                                             │
│  ├── External Features (Standalone Packages)                               │
│  │   ├── Playlist Module (external-features/Playlist/)                     │
│  │   ├── Upload Module (external-features/Upload/)                         │
│  │   └── My-Beats Module (external-features/MyBeats/)                      │
│  └── Core Modules (src/modules/)                                           │
│      ├── Authentication, Browse, Library, Favorites                        │
│      ├── Checkout, Dashboard, Notifications                                │
│      └── Landing, Explore, Creator, Connections                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                           MASTER API LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Custom API Framework (Fastify/Express + TypeScript)                       │
│  ├── Authentication & Authorization                                        │
│  ├── Rate Limiting & Security                                              │
│  ├── Data Transformation & Validation                                      │
│  └── Error Handling & Logging                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                          DATA SOURCE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                    │  MongoDB (Document Store)      │
│  ├── User Management & Auth               │  ├── Beat Content & Metadata   │
│  ├── Financial Data & Transactions        │  ├── User-Generated Content    │
│  ├── Security & Permissions               │  ├── Analytics & Insights      │
│  └── Real-time Features                   │  └── Search & Discovery        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema Design

### 🔐 SUPABASE (PostgreSQL) - Critical Data & Transactions

#### **1. Authentication & Users**
```sql
-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_creator BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  social_links JSONB,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Roles & Permissions
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'creator', 'admin'
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. Financial & Payment Data**
```sql
-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'refunded'
  payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL,
  beat_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  license_type VARCHAR(20) NOT NULL, -- 'basic', 'premium', 'exclusive'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Licenses
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_type VARCHAR(20) NOT NULL,
  download_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payouts (for creators)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  stripe_payout_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

#### **3. Core Beat Management**
```sql
-- Beats (Core Data Only)
CREATE TABLE beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  license_types JSONB NOT NULL, -- {'basic': 10, 'premium': 25, 'exclusive': 100}
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Beat Permissions
CREATE TABLE beat_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_type VARCHAR(20) NOT NULL, -- 'owner', 'collaborator', 'viewer'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. Playlists (Core Data)**
```sql
-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Playlist Items (Core)
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL,
  added_by UUID REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);
```

#### **5. Cart & Favorites**
```sql
-- Shopping Cart
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL,
  license_type VARCHAR(20) NOT NULL,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, beat_id)
);
```

### 📄 MONGODB - Content & Analytics

#### **1. Beat Content Collections**
```javascript
// beats collection
{
  _id: ObjectId,
  supabase_id: "uuid", // Reference to Supabase beat
  creator_id: "uuid",
  title: "Summer Vibes",
  description: "Chill summer beat...",
  
  // Rich metadata
  metadata: {
    bpm: 140,
    key: "C#",
    genre: "Hip Hop",
    mood: "Chill",
    tags: ["summer", "chill", "hip-hop"],
    duration: 180, // seconds
    waveform: [/* waveform data */],
    stems: {
      drums: "url",
      bass: "url",
      melody: "url"
    }
  },
  
  // Audio files
  audio: {
    preview_url: "https://...",
    full_url: "https://...",
    file_size: 15000000,
    format: "mp3",
    quality: "320kbps"
  },
  
  // Artwork
  artwork: {
    thumbnail_url: "https://...",
    full_url: "https://...",
    colors: ["#FF6B6B", "#4ECDC4"]
  },
  
  // Collaboration data
  collaborators: [
    {
      user_id: "uuid",
      role: "producer",
      split_percentage: 50,
      credited_name: "Producer Name"
    }
  ],
  
  // Version history
  versions: [
    {
      version: 1,
      changes: "Initial upload",
      created_at: ISODate("2024-01-01")
    }
  ],
  
  created_at: ISODate("2024-01-01"),
  updated_at: ISODate("2024-01-01")
}

// beat_analytics collection
{
  _id: ObjectId,
  beat_id: "uuid",
  plays: 1250,
  downloads: 89,
  likes: 234,
  shares: 45,
  revenue: 445.50,
  
  // Time-based analytics
  daily_stats: [
    {
      date: "2024-01-01",
      plays: 25,
      downloads: 2,
      revenue: 8.50
    }
  ],
  
  // Geographic data
  geographic_data: {
    "US": { plays: 500, downloads: 30 },
    "UK": { plays: 200, downloads: 15 }
  },
  
  // User engagement
  engagement: {
    avg_listen_duration: 45.5,
    completion_rate: 0.78,
    bounce_rate: 0.22
  }
}
```

#### **2. User Content Collections**
```javascript
// playlists collection (rich content)
{
  _id: ObjectId,
  supabase_id: "uuid", // Reference to Supabase playlist
  curator_id: "uuid",
  name: "My Summer Mix",
  description: "Perfect for summer vibes...",
  
  // Rich playlist data
  items: [
    {
      beat_id: "uuid",
      added_at: ISODate("2024-01-01"),
      added_by: "uuid",
      position: 1,
      notes: "Great summer vibe"
    }
  ],
  
  // Playlist analytics
  analytics: {
    total_plays: 1500,
    followers: 89,
    shares: 23
  },
  
  // Collaborative features
  collaborators: [
    {
      user_id: "uuid",
      role: "editor",
      added_at: ISODate("2024-01-01")
    }
  ],
  
  created_at: ISODate("2024-01-01"),
  updated_at: ISODate("2024-01-01")
}

// user_activity collection
{
  _id: ObjectId,
  user_id: "uuid",
  activity_type: "beat_play", // "beat_play", "beat_like", "playlist_create", etc.
  target_id: "uuid", // beat_id, playlist_id, etc.
  metadata: {
    duration: 45,
    source: "browse_page"
  },
  created_at: ISODate("2024-01-01")
}

// social_interactions collection
{
  _id: ObjectId,
  user_id: "uuid",
  target_user_id: "uuid",
  interaction_type: "follow", // "follow", "unfollow", "like", "comment"
  target_type: "user", // "user", "beat", "playlist"
  target_id: "uuid",
  created_at: ISODate("2024-01-01")
}
```

#### **3. Search & Discovery Collections**
```javascript
// search_index collection
{
  _id: ObjectId,
  beat_id: "uuid",
  title: "Summer Vibes",
  artist_name: "Producer Name",
  genre: "Hip Hop",
  tags: ["summer", "chill", "hip-hop"],
  bpm: 140,
  key: "C#",
  price: 25.00,
  
  // Search weights
  search_score: 0.85,
  popularity_score: 0.72,
  
  // Full-text search
  search_text: "summer vibes producer name hip hop chill",
  
  created_at: ISODate("2024-01-01")
}

// recommendations collection
{
  _id: ObjectId,
  user_id: "uuid",
  beat_id: "uuid",
  recommendation_type: "collaborative", // "collaborative", "content-based", "popular"
  score: 0.92,
  reason: "Based on your listening history",
  created_at: ISODate("2024-01-01")
}
```

## 🔌 API Endpoints Design

### **Master API Framework Endpoints**

#### **1. Authentication Endpoints**
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/logout
// POST /api/auth/refresh
// GET /api/auth/me
// PUT /api/auth/profile
```

#### **2. Beat Management Endpoints**
```typescript
// GET /api/beats
interface GetBeatsRequest {
  page?: number;
  limit?: number;
  genre?: string;
  bpm?: { min: number; max: number };
  key?: string;
  price?: { min: number; max: number };
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/beats/:id
// POST /api/beats (create)
// PUT /api/beats/:id (update)
// DELETE /api/beats/:id
// POST /api/beats/:id/publish
// POST /api/beats/:id/unpublish
```

#### **3. User Management Endpoints**
```typescript
// GET /api/users/profile
// PUT /api/users/profile
// GET /api/users/:id/beats
// GET /api/users/:id/playlists
// POST /api/users/:id/follow
// DELETE /api/users/:id/follow
```

#### **4. Playlist Endpoints**
```typescript
// GET /api/playlists
// GET /api/playlists/:id
// POST /api/playlists
// PUT /api/playlists/:id
// DELETE /api/playlists/:id
// POST /api/playlists/:id/items
// DELETE /api/playlists/:id/items/:itemId
```

#### **5. Financial Endpoints**
```typescript
// POST /api/cart/items
// GET /api/cart
// PUT /api/cart/items/:itemId
// DELETE /api/cart/items/:itemId
// POST /api/orders
// GET /api/orders
// GET /api/orders/:id
// POST /api/orders/:id/pay
```

#### **6. Analytics Endpoints**
```typescript
// GET /api/analytics/beats/:id
// GET /api/analytics/user
// GET /api/analytics/creator
// POST /api/analytics/events
```

## 🎯 Page-by-Page Architecture

### **1. Landing Page (`/landing`, `/`)**
```typescript
// Components: LandingLayout
// Data Sources: MongoDB (featured beats, trending content)
// APIs: GET /api/beats/featured, GET /api/analytics/trending
// Real-time: None
```

### **2. Authentication Pages (`/login`, `/signup`)**
```typescript
// Components: LoginForm, SignupForm
// Data Sources: Supabase (auth)
// APIs: POST /api/auth/login, POST /api/auth/register
// Real-time: None
```

### **3. Browse Page (`/browse`)**
```typescript
// Components: BrowseLayout, BrowseFilters
// Data Sources: MongoDB (beat content), Supabase (permissions)
// APIs: GET /api/beats, GET /api/beats/search
// Real-time: Search results updates
```

### **4. Beat Detail Page (`/beat/:id`)**
```typescript
// Components: BeatDetailLayout
// Data Sources: MongoDB (beat content), Supabase (licenses, permissions)
// APIs: GET /api/beats/:id, GET /api/beats/:id/analytics
// Real-time: Play count updates, comments
```

### **5. Playlists Pages (`/playlists`, `/playlist/:id`)**
```typescript
// Components: PlaylistsLayout, PlaylistDetailLayout (External Feature)
// Data Sources: Supabase (core playlist data), MongoDB (rich content)
// APIs: GET /api/playlists, GET /api/playlists/:id
// Real-time: Collaborative playlist updates
```

### **6. Upload Page (`/upload`)**
```typescript
// Components: UploadBeatLayout (External Feature)
// Data Sources: Supabase (drafts), MongoDB (file metadata)
// APIs: POST /api/beats, POST /api/upload/files
// Real-time: Upload progress
```

### **7. My Beats Page (`/my-beats`)**
```typescript
// Components: MyBeatsLayout (External Feature)
// Data Sources: Supabase (ownership), MongoDB (content, analytics)
// APIs: GET /api/users/me/beats, GET /api/analytics/creator
// Real-time: Analytics updates
```

### **8. Library Page (`/library`)**
```typescript
// Components: LibraryLayout
// Data Sources: Supabase (licenses), MongoDB (content)
// APIs: GET /api/users/me/library
// Real-time: New purchases
```

### **9. Favorites Page (`/favorites`)**
```typescript
// Components: FavoritesLayout
// Data Sources: Supabase (favorites), MongoDB (content)
// APIs: GET /api/users/me/favorites
// Real-time: Favorites updates
```

### **10. Checkout Page (`/checkout`)**
```typescript
// Components: CheckoutLayout, PaymentForm
// Data Sources: Supabase (cart, orders)
// APIs: POST /api/orders, POST /api/payments
// Real-time: Payment status
```

### **11. Dashboard Pages (`/dashboard/*`)**
```typescript
// Components: DashboardLayout, DashboardHome, DashboardAnalytics, etc.
// Data Sources: Supabase (orders, licenses), MongoDB (analytics)
// APIs: GET /api/analytics/creator, GET /api/orders
// Real-time: Sales updates, analytics
```

### **12. Creator Profile Page (`/creator/:username`)**
```typescript
// Components: CreatorProfileLayout
// Data Sources: Supabase (user data), MongoDB (content, analytics)
// APIs: GET /api/users/:username, GET /api/users/:username/beats
// Real-time: Profile updates
```

### **13. Explore Page (`/explore`)**
```typescript
// Components: Explore
// Data Sources: MongoDB (discovery content)
// APIs: GET /api/explore, GET /api/recommendations
// Real-time: Trending updates
```

### **14. Notifications Page (`/notifications`)**
```typescript
// Components: NotificationsLayout
// Data Sources: Supabase (notifications)
// APIs: GET /api/notifications, PUT /api/notifications/:id/read
// Real-time: New notifications
```

## 🔄 Data Flow Architecture

### **1. Beat Creation Flow**
```
1. User uploads beat → UploadBeatLayout (External Feature)
2. File upload → MongoDB (metadata) + Supabase (draft)
3. Beat creation → Supabase (core data) + MongoDB (content)
4. Publishing → Supabase (status update) + MongoDB (search index)
5. Real-time update → All connected clients
```

### **2. Beat Purchase Flow**
```
1. User adds to cart → Supabase (cart items)
2. User checks out → Supabase (order creation)
3. Payment processing → Stripe + Supabase (payment status)
4. License generation → Supabase (license creation)
5. Library update → MongoDB (user content)
6. Analytics update → MongoDB (beat analytics)
```

### **3. Search & Discovery Flow**
```
1. User searches → Master API
2. Query processing → MongoDB (search index)
3. Permission filtering → Supabase (user permissions)
4. Results ranking → MongoDB (popularity scores)
5. Response formatting → Master API
6. Real-time updates → Search suggestions
```

## 🛡️ Security Architecture

### **1. Authentication & Authorization**
- **Supabase Auth**: JWT tokens, session management
- **Row Level Security**: Granular permissions in Supabase
- **API Security**: Rate limiting, input validation
- **Data Access**: Permission-based data filtering

### **2. Data Protection**
- **Encryption**: Data at rest and in transit
- **Audit Logging**: All data access tracked
- **Backup Strategy**: Automated backups for both databases
- **Compliance**: GDPR, CCPA compliance

## ⚡ Performance Architecture

### **1. Caching Strategy**
- **Redis**: Session data, frequently accessed content
- **CDN**: Static assets, audio files
- **Database Caching**: Query result caching
- **Browser Caching**: Static resources

### **2. Optimization**
- **Database Indexing**: Strategic indexes for fast queries
- **Query Optimization**: Efficient SQL and MongoDB queries
- **Connection Pooling**: Optimized database connections
- **Load Balancing**: Traffic distribution

## 📊 Monitoring & Analytics

### **1. Application Monitoring**
- **Error Tracking**: Sentry or similar
- **Performance Monitoring**: APM tools
- **User Analytics**: User behavior tracking
- **Business Metrics**: Revenue, engagement tracking

### **2. Database Monitoring**
- **Query Performance**: Slow query detection
- **Connection Monitoring**: Connection pool health
- **Storage Monitoring**: Database size and growth
- **Backup Monitoring**: Backup success/failure

---

## 🎵 Summary

This architecture provides:

1. **🛡️ Security**: Multi-layer security with RLS and API protection
2. **⚡ Performance**: Optimized data access and caching
3. **📈 Scalability**: Horizontal scaling capabilities
4. **🔧 Flexibility**: Easy to extend and modify
5. **👥 Developer Experience**: Clear separation of concerns
6. **💰 Cost Optimization**: Efficient resource usage

**The system is designed to handle high traffic, provide excellent user experience, and scale with your business growth! 🚀**
