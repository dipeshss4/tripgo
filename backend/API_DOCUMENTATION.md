# TripGo Enhanced API Documentation

## Overview

TripGo Enhanced API is a comprehensive REST API for the travel booking platform with advanced features including intelligent caching, API versioning, enhanced authentication, request logging, and performance monitoring.

## Base URL
- Development: `http://localhost:4000`
- API Base: `/api` (defaults to v2) or `/api/v2`
- Legacy API: `/api/v1`

## Key Features

### 🚀 Enhanced Functionality
- **API Versioning**: Support for v1 (legacy) and v2 (enhanced)
- **Intelligent Caching**: Memory-based caching with TTL and cache invalidation
- **Advanced Query Parameters**: Filtering, sorting, pagination, search, field selection
- **Enhanced Authentication**: Multi-factor auth, device fingerprinting, session management
- **Request Logging**: Comprehensive logging with request tracking and performance monitoring
- **Input Validation**: Zod-based validation with sanitization
- **Rate Limiting**: User-based and IP-based rate limiting
- **Error Handling**: Structured error responses with detailed information

### 📊 Performance Features
- Response compression
- Request/response caching
- Performance monitoring (alerts on slow requests)
- Query optimization helpers
- Bulk operations support

## Authentication

### Headers
```
Authorization: Bearer <jwt_token>
API-Version: v2 (optional, defaults to v2)
X-Request-ID: <unique_request_id> (auto-generated if not provided)
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Sorting
- `sort`: Field and direction, e.g., `price:asc,name:desc`

### Filtering
- `filter`: JSON object for complex filtering
- Individual field filters as query params

### Search
- `search`: Full-text search across specified fields

### Field Selection
- `select`: Comma-separated list of fields to return
- `include`: Comma-separated list of relations to include

### Examples
```
GET /api/cruises?page=1&limit=20&sort=price:asc&filter={"available":true,"destination":"Caribbean"}
GET /api/hotels?search=luxury&select=name,price,rating&include=amenities
GET /api/packages?filter={"price":{"gte":500,"lte":2000}}&sort=rating:desc
```

## API Endpoints

### Health Check
```http
GET /health
```
Returns server status, uptime, and environment information.

### API Version Info
```http
GET /api/version
```
Returns supported API versions and deprecation information.

### Cruises

#### List Cruises
```http
GET /api/cruises
```

**Query Parameters:**
- All standard query parameters supported
- Available filters: `available`, `destination`, `departure`, `capacity`
- Search fields: `name`, `description`, `departure`, `destination`
- Sort fields: `name`, `price`, `duration`, `rating`, `createdAt`, `updatedAt`

**Response (v2):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Caribbean Adventure",
      "description": "7-day cruise through the Caribbean",
      "price": 1299.99,
      "duration": 7,
      "capacity": 2000,
      "available": true,
      "departure": "Miami",
      "destination": "Caribbean",
      "pricePerDay": 185.71,
      "availability": "available",
      "popularityScore": 85.3,
      "reviews": [...],
      "_count": {
        "bookings": 156,
        "reviews": 89
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "metadata": {
    "searchApplied": false,
    "filtersApplied": 1,
    "cached": false
  }
}
```

#### Get Cruise by ID
```http
GET /api/cruises/{id}
```

#### Create Cruise (Admin)
```http
POST /api/cruises
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Mediterranean Delight",
  "description": "10-day luxury cruise through the Mediterranean",
  "price": 2499.99,
  "duration": 10,
  "capacity": 1500,
  "departure": "Barcelona",
  "destination": "Mediterranean",
  "amenities": ["spa", "casino", "pool", "restaurants"],
  "itinerary": {
    "day1": "Barcelona, Spain",
    "day2": "Nice, France",
    "day3": "Rome, Italy"
  }
}
```

#### Update Cruise (Admin)
```http
PUT /api/cruises/{id}
Authorization: Bearer <admin_token>
If-Unmodified-Since: 2024-01-15T10:30:00Z
Content-Type: application/json

{
  "price": 2299.99,
  "available": true
}
```

#### Delete Cruise (Admin)
```http
DELETE /api/cruises/{id}
Authorization: Bearer <admin_token>
```

#### Bulk Operations (Admin)
```http
POST /api/cruises/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operation": "update",
  "cruiseIds": ["uuid1", "uuid2", "uuid3"],
  "data": {
    "available": false
  }
}
```

#### Cruise Analytics (Admin)
```http
GET /api/cruises/analytics
Authorization: Bearer <admin_token>
```

### Hotels

Similar endpoints to cruises with hotel-specific fields:
- Available filters: `available`, `location`, `amenities`, `starRating`
- Search fields: `name`, `description`, `location`
- Sort fields: `name`, `price`, `rating`, `starRating`, `createdAt`

### Packages

Similar endpoints to cruises with package-specific fields:
- Available filters: `available`, `type`, `destination`, `includes`
- Search fields: `name`, `description`, `destination`
- Sort fields: `name`, `price`, `duration`, `rating`, `createdAt`

### Bookings

#### List User Bookings
```http
GET /api/bookings
Authorization: Bearer <user_token>
```

#### Create Booking
```http
POST /api/bookings/cruise/{cruiseId}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "startDate": "2024-06-15",
  "endDate": "2024-06-22",
  "passengers": 2,
  "specialRequests": "Vegetarian meals"
}
```

### Admin Endpoints

#### Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### User Management
```http
GET /api/admin/users
POST /api/admin/users/bulk-actions
```

#### Content Management
```http
GET /api/admin/content
POST /api/admin/content/bulk-publish
```

#### System Management
```http
GET /api/admin/system/health
GET /api/admin/system/performance
POST /api/admin/system/maintenance
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_string"
      }
    ]
  },
  "requestId": "abc123"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Caching

### Cache Headers
- `X-Cache`: HIT or MISS
- `Cache-Control`: max-age=<seconds>

### Cache Invalidation
```http
DELETE /api/cache?pattern=cruises
Authorization: Bearer <admin_token>
```

## Rate Limiting

### Limits
- 1000 requests per 15 minutes per authenticated user
- Lower limits for unauthenticated requests
- Higher limits for admin users

### Headers
- `X-Rate-Limit-Remaining`: Requests remaining in window
- `Retry-After`: Seconds to wait before retrying (when limited)

## API Versioning

### Version Detection Methods
1. **Header**: `API-Version: v2`
2. **Accept Header**: `Accept: application/vnd.api+json;version=v2`
3. **URL Path**: `/api/v2/cruises`
4. **Query Parameter**: `?version=v2`

### Version Differences

#### V1 (Legacy)
- Basic CRUD operations
- Simple pagination
- Limited filtering
- No enhanced authentication features

#### V2 (Enhanced)
- All V1 features plus:
- Advanced query parameters
- Enhanced authentication with MFA
- Computed fields in responses
- Bulk operations
- Analytics endpoints
- Performance monitoring

### Deprecation
- V1 is maintained for backward compatibility
- New features only added to V2
- Deprecation warnings sent via `Warning` header

## Security Features

### Enhanced Authentication
- JWT with refresh tokens
- Device fingerprinting
- Session management
- Multi-factor authentication for high-risk operations
- Permission-based authorization

### Security Headers
- `X-Request-ID`: Request tracking
- `X-Frame-Options`: Clickjacking protection
- `X-Content-Type-Options`: MIME type sniffing protection
- `Strict-Transport-Security`: HTTPS enforcement

### Input Security
- Automatic input sanitization
- XSS protection
- SQL injection prevention
- File upload validation

## Monitoring & Logging

### Request Logging
All requests are logged with:
- Request ID
- User information
- Performance metrics
- Error details
- Security events

### Performance Monitoring
- Slow request detection (>2 seconds)
- Database query performance
- Cache hit rates
- API usage analytics

### Log Files
- `logs/info-YYYY-MM-DD.log`: General information
- `logs/error-YYYY-MM-DD.log`: Error logs
- `logs/warn-YYYY-MM-DD.log`: Warning logs
- `logs/combined-YYYY-MM-DD.log`: All logs combined

## Development Tools

### API Documentation
```http
GET /api/docs
```

### Health Monitoring
```http
GET /health
```

### Cache Statistics
```http
GET /api/admin/system/cache-stats
Authorization: Bearer <admin_token>
```

## Examples

### Advanced Cruise Search
```javascript
// Search for available Caribbean cruises under $2000, sorted by price
const response = await fetch('/api/cruises?' + new URLSearchParams({
  search: 'caribbean',
  filter: JSON.stringify({
    available: true,
    price: { lte: 2000 },
    destination: 'Caribbean'
  }),
  sort: 'price:asc,rating:desc',
  include: 'reviews',
  select: 'name,price,duration,rating,reviews',
  limit: 20
}), {
  headers: {
    'Authorization': 'Bearer ' + token,
    'API-Version': 'v2'
  }
});
```

### Bulk Update Hotels
```javascript
const response = await fetch('/api/hotels/bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    operation: 'update',
    hotelIds: ['hotel1', 'hotel2', 'hotel3'],
    data: {
      available: true,
      featured: false
    }
  })
});
```

### Create Booking with Validation
```javascript
const response = await fetch('/api/bookings/cruise/cruise-id', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2024-07-15T00:00:00Z',
    endDate: '2024-07-22T00:00:00Z',
    passengers: 2,
    cabinType: 'ocean-view',
    specialRequests: 'Anniversary celebration'
  })
});
```

## Migration Guide

### From V1 to V2

1. **Update API Version**:
   - Add `API-Version: v2` header, or
   - Change URL from `/api/v1/` to `/api/v2/`, or
   - Use default `/api/` which routes to v2

2. **Enhanced Query Parameters**:
   - Replace simple filters with JSON filter object
   - Use new sorting syntax: `sort=field:direction`
   - Utilize new `select` and `include` parameters

3. **Authentication**:
   - Update to handle enhanced security features
   - Implement refresh token rotation
   - Handle MFA challenges for admin operations

4. **Response Format**:
   - Expect additional computed fields in v2 responses
   - Handle new pagination format
   - Process metadata in responses

5. **Error Handling**:
   - Update error handling for new error format
   - Handle validation errors with field-specific details
   - Process rate limiting responses

## Support

For API support and questions:
- Documentation: `/api/docs`
- Health Check: `/health`
- Version Info: `/api/version`

---

*This documentation covers the enhanced TripGo API v2. For legacy v1 documentation, see the v1 section of this guide.*