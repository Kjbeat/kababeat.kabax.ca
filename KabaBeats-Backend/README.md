# KabaBeats Backend API

A comprehensive Node.js/TypeScript backend API for the KabaBeats music marketplace platform.

## 🏗️ Architecture

The backend follows a modular architecture with clear separation of concerns:

```
src/
├── config/           # Configuration files
│   ├── database.ts   # MongoDB connection
│   ├── logger.ts     # Winston logging setup
│   └── cloudflare-r2.ts # Cloudflare R2 integration
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   │   ├── auth.model.ts
│   │   ├── auth.interface.ts
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── beat/         # Beat management module
│   │   ├── beat.model.ts
│   │   ├── beat.interface.ts
│   │   ├── beat.service.ts
│   │   └── beat.controller.ts
│   └── ...           # Other modules
├── routes/           # API routes
│   └── v1/           # Version 1 API routes
│       ├── auth.routes.ts
│       ├── beat.routes.ts
│       └── ...
├── utils/            # Utility functions
│   ├── auth.ts       # JWT authentication utilities
│   ├── validation.ts # Joi validation schemas
│   └── errorHandler.ts # Error handling
├── types/            # TypeScript type definitions
└── index.ts          # Application entry point
```

## 🚀 Features

### Core Modules

1. **Authentication Module** (`/modules/auth/`)
   - User registration and login
   - JWT token management
   - Password reset functionality
   - Google OAuth integration
   - Profile management

2. **Beat Management Module** (`/modules/beat/`)
   - Beat CRUD operations
   - Beat search and filtering
   - Beat analytics and statistics
   - License management
   - Publishing workflow

3. **User Management Module** (`/modules/user/`)
   - User profiles
   - Social connections
   - Following/followers system

4. **Playlist Module** (`/modules/playlist/`)
   - Playlist creation and management
   - Beat organization
   - Public/private playlists

5. **Media Module** (`/modules/media/`)
   - File upload handling
   - Cloudflare R2 integration
   - Presigned URL generation

6. **Browse Module** (`/modules/browse/`)
   - Beat discovery
   - Advanced filtering
   - Search functionality

7. **Connection Module** (`/modules/connection/`)
   - User connections
   - Social features

8. **Creator Module** (`/modules/creator/`)
   - Creator profiles
   - Creator analytics
   - Creator discovery

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudflare R2
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /google` - Google OAuth login
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Beat Management (`/api/v1/beats`)
- `GET /featured` - Get featured beats
- `GET /trending` - Get trending beats
- `GET /newest` - Get newest beats
- `GET /search` - Search beats
- `GET /:id` - Get beat by ID
- `POST /` - Create new beat (authenticated)
- `PUT /:id` - Update beat (authenticated)
- `DELETE /:id` - Delete beat (authenticated)
- `POST /:id/publish` - Publish beat (authenticated)
- `POST /:id/unpublish` - Unpublish beat (authenticated)

### User Management (`/api/v1/users`)
- `GET /:id` - Get user profile
- `PUT /profile` - Update profile (authenticated)
- `GET /:id/followers` - Get user followers
- `GET /:id/following` - Get user following
- `POST /:id/follow` - Follow user (authenticated)
- `DELETE /:id/follow` - Unfollow user (authenticated)

### Playlist Management (`/api/v1/playlists`)
- `GET /search` - Search playlists
- `GET /:id` - Get playlist
- `POST /` - Create playlist (authenticated)
- `GET /my/playlists` - Get user's playlists (authenticated)
- `PUT /:id` - Update playlist (authenticated)
- `DELETE /:id` - Delete playlist (authenticated)
- `POST /:id/beats/:beatId` - Add beat to playlist (authenticated)
- `DELETE /:id/beats/:beatId` - Remove beat from playlist (authenticated)

### Media Management (`/api/v1/media`)
- `POST /upload-url` - Generate upload URL (authenticated)
- `POST /download-url` - Generate download URL (authenticated)
- `DELETE /:key` - Delete file (authenticated)
- `GET /:key/info` - Get file info (authenticated)

### Browse (`/api/v1/browse`)
- `GET /beats` - Browse beats with filters
- `GET /genres` - Get available genres
- `GET /moods` - Get available moods
- `GET /keys` - Get available musical keys
- `GET /filters` - Get available filters

### Connections (`/api/v1/connections`)
- `GET /` - Get user connections (authenticated)
- `GET /followers` - Get followers (authenticated)
- `GET /following` - Get following (authenticated)
- `GET /:id/status` - Get connection status (authenticated)
- `POST /:id/follow` - Follow user (authenticated)
- `DELETE /:id/follow` - Unfollow user (authenticated)

### Creator Discovery (`/api/v1/creators`)
- `GET /search` - Search creators
- `GET /top` - Get top creators
- `GET /new` - Get new creators
- `GET /:id` - Get creator profile
- `GET /:id/beats` - Get creator's beats
- `GET /:id/stats` - Get creator statistics

## 🔧 Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KabaBeats-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your configuration values.

4. **Database Setup**
   - Set up MongoDB Atlas cluster
   - Update `MONGODB_URI` in `.env`

5. **Cloudflare R2 Setup**
   - Create Cloudflare R2 bucket
   - Update R2 credentials in `.env`

6. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 🔐 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kababeats

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=kababeats-media
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,https://kababeat.kabax.ca
```

## 📊 Database Schema

### User Model
- Basic user information (email, username, password)
- Profile data (name, bio, avatar, country)
- Social links (website, Instagram, Twitter, YouTube)
- Authentication data (refresh tokens, verification status)
- Role-based access control

### Beat Model
- Beat metadata (title, description, producer)
- Audio information (BPM, key, genre, tags)
- Pricing and licensing
- File metadata (duration, size, format)
- Statistics (plays, likes, downloads, shares)
- Publishing status

### Playlist Model
- Playlist information (title, description, cover)
- Beat organization
- Privacy settings
- Statistics

### Connection Model
- User relationships (following/followers)
- Connection status

## 🚦 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention (MongoDB)
- XSS protection

## 📈 Performance Features

- Database indexing
- Query optimization
- Response compression
- Efficient pagination
- Caching strategies
- Connection pooling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Logging

The application uses Winston for structured logging:
- Console output in development
- File logging in production
- Different log levels (error, warn, info, debug)
- Request/response logging

## 🚀 Deployment

The application is designed to be deployed on:
- Vercel
- Railway
- Heroku
- AWS
- DigitalOcean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for the KabaBeats community
