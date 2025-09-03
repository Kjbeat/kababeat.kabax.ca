# Analytics — Abiola

## Purpose & User Value

The Analytics module provides comprehensive insights into beat performance, user engagement, and sales metrics. Users can track plays, likes, downloads, and sales for their beats, with detailed analytics cards and recent sales information. The module enables data-driven decision making for content creators.

## Current Frontend Flow

### Main routes/components involved:
- **Dashboard Analytics**: `src/modules/dashboard/components/` - analytics dashboard components
- **Beat Stats**: Integrated with beat detail and user library views
- **Analytics Cards**: Display performance metrics and trends
- **Recent Sales**: Sales history and transaction information
- **User Stats**: User profile and performance metrics

### State management and key hooks:
- Analytics data fetched through API calls with caching
- Real-time updates for play counts and engagement metrics
- Historical data tracking and trend analysis
- User-specific analytics and performance insights

### How the UI calls services/handlers:
- Beat analytics accessed through `/api/v1/beat/stats` endpoint
- Play tracking via `/api/v1/beat/:id/plays` (PATCH) endpoint
- Like tracking via `/api/v1/beat/:id/likes` (PATCH) endpoint
- Download tracking via `/api/v1/beat/:id/downloads` (PATCH) endpoint
- Sales tracking via `/api/v1/beat/:id/sales` (PATCH) endpoint

## Current Backend/API Flow

### Handlers/routes involved:
- **Beat Routes**: `src/routes/v1/beat.routes.ts` - analytics tracking endpoints
- **Beat Controller**: `src/modules/beat/beat.controller.ts` - analytics operations
- **Beat Service**: `src/modules/beat/beat.service.ts` - analytics logic and database operations
- **Beat Model**: `src/modules/beat/beat.model.ts` - analytics data structure

### Auth/ownership checks expected:
- JWT token validation for user-specific analytics
- User ownership verification for beat analytics access
- Public access for play tracking and engagement metrics
- Rate limiting for analytics tracking endpoints

### DB collections/documents touched:
- **beats** collection - analytics data (plays, likes, downloads, sales)
- **users** collection - user statistics and performance metrics
- **purchases** collection - sales data and transaction history

## API Inventory

| Endpoint | Method | Auth | Purpose | Status | Notes |
|----------|--------|------|---------|--------|-------|
| `/beat/stats` | GET | Required | Get user beat stats | Implemented | Analytics dashboard |
| `/beat/:id/plays` | PATCH | Optional | Increment plays | Implemented | Public tracking |
| `/beat/:id/likes` | PATCH | Optional | Increment likes | Implemented | Public tracking |
| `/beat/:id/downloads` | PATCH | Optional | Increment downloads | Implemented | Public tracking |
| `/beat/:id/sales` | PATCH | Optional | Increment sales | Implemented | Public tracking |
| `/analytics/dashboard` | GET | Required | Get dashboard analytics | Pending | Not implemented |
| `/analytics/recent-sales` | GET | Required | Get recent sales | Pending | Not implemented |
| `/analytics/search` | GET | Required | Search analytics | Pending | Not implemented |

## Stories & Status

### Story: Display analytics card
- **Status**: Pending
- **How it should work**: Analytics cards should display comprehensive performance metrics including total plays, likes, downloads, and sales. Cards should show trends over time, top-performing beats, and revenue insights with visual charts and graphs.
- **Acceptance criteria**: 
  - Analytics cards display key performance metrics
  - Visual charts and graphs for trends
  - Top-performing beats highlighted
  - Revenue and earnings information
  - Time-based filtering and comparison

### Story: Display recent sales
- **Status**: Pending
- **How it should work**: Recent sales section should show latest transactions, purchase details, and revenue information. Users should be able to view sales history, download receipts, and track earnings with proper transaction details.
- **Acceptance criteria**: 
  - Recent sales displayed with transaction details
  - Purchase history and receipts available
  - Revenue tracking and earnings calculation
  - Export functionality for sales data
  - Real-time sales notifications

### Story: Create Sales's search
- **Status**: Pending
- **How it should work**: Sales search functionality should allow users to search through their sales history, filter by date range, beat, license type, and customer information. Advanced search should provide detailed transaction filtering and export capabilities.
- **Acceptance criteria**: 
  - Sales search with multiple filter criteria
  - Date range filtering and sorting
  - Beat and license type filtering
  - Customer information search
  - Export functionality for search results

## Data & Validation

### Required inputs and constraints:
- **Analytics data**: Plays, likes, downloads, sales counts
- **Time ranges**: Daily, weekly, monthly, yearly analytics
- **Beat filtering**: Individual beat or aggregate analytics
- **User permissions**: Owner access for detailed analytics
- **Data accuracy**: Real-time updates and duplicate prevention

### Key error cases the UI must handle:
- **Data errors**: Missing analytics data, calculation errors
- **Permission errors**: Unauthorized access to analytics
- **Performance errors**: Large datasets, slow queries
- **Network errors**: API failures, data synchronization issues
- **Validation errors**: Invalid date ranges, malformed requests

## Open Risks / Decisions

- **Data accuracy**: Analytics tracking needs to prevent duplicate counting
- **Performance**: Large analytics datasets may need optimization
- **Real-time updates**: Analytics may need real-time synchronization
- **Data retention**: Historical analytics data storage and cleanup
- **Privacy compliance**: User data and analytics privacy requirements
- **Export functionality**: Large data export performance and format options

## Test Scenarios

- **Analytics display**: User views analytics dashboard, metrics displayed correctly
- **Play tracking**: Beat plays tracked accurately, no duplicate counting
- **Sales analytics**: Sales data displayed with proper transaction details
- **Trend analysis**: Analytics trends calculated and displayed correctly
- **Search functionality**: Sales search returns accurate filtered results
- **Data export**: Analytics data exported in proper format
- **Real-time updates**: Analytics update in real-time with new activity
- **Error handling**: Analytics errors show appropriate error messages
- **Performance**: Large analytics datasets load within acceptable time
- **Security**: Unauthorized access to analytics properly blocked
