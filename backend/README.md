# TripGo Backend API

A TypeScript-based REST API for the TripGo travel booking platform built with Express.js, Prisma, and PostgreSQL.

## Features

- 🚢 **Cruise Management** - Browse, search, and book cruises
- 🏨 **Hotel Booking** - Hotel search and reservation system
- 📦 **Travel Packages** - Complete travel package offerings
- 👤 **User Authentication** - JWT-based auth with registration/login
- 💳 **Payment Integration** - Stripe payment processing
- ⭐ **Reviews & Ratings** - User review system
- 🔒 **Security** - Rate limiting, CORS, helmet protection
- 📖 **Type Safety** - Full TypeScript implementation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Payment**: Stripe
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Zod schemas

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tripgo_db"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Cruises
- `GET /api/cruises` - List cruises with filters
- `GET /api/cruises/:slug` - Get cruise details
- `POST /api/cruises` - Create cruise (admin)
- `PUT /api/cruises/:id` - Update cruise (admin)
- `DELETE /api/cruises/:id` - Delete cruise (admin)
- `GET /api/cruises/:id/reviews` - Get cruise reviews
- `POST /api/cruises/:id/reviews` - Add cruise review

### Hotels
- `GET /api/hotels` - List hotels with filters
- `GET /api/hotels/:slug` - Get hotel details
- `POST /api/hotels` - Create hotel (admin)
- `PUT /api/hotels/:id` - Update hotel (admin)
- `DELETE /api/hotels/:id` - Delete hotel (admin)
- `GET /api/hotels/:id/reviews` - Get hotel reviews
- `POST /api/hotels/:id/reviews` - Add hotel review

### Travel Packages
- `GET /api/packages` - List packages with filters
- `GET /api/packages/:slug` - Get package details
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)
- `GET /api/packages/:id/reviews` - Get package reviews
- `POST /api/packages/:id/reviews` - Add package review

### Bookings
- `POST /api/bookings/cruise/:cruiseId` - Book a cruise
- `POST /api/bookings/hotel/:hotelId` - Book a hotel
- `POST /api/bookings/package/:packageId` - Book a package
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/confirm-payment` - Confirm payment

## API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

## Database Schema

The database includes the following main entities:

- **Users** - User accounts and profiles
- **Cruises** - Cruise offerings with details
- **Hotels** - Hotel listings
- **Packages** - Travel package deals
- **Bookings** - User reservations
- **Reviews** - User feedback and ratings

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# View database
npm run db:studio
```

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Configured for frontend domain
- **Helmet Security** - HTTP security headers
- **Password Hashing** - bcrypt for secure passwords
- **Input Validation** - Request validation with Zod

## Deployment

The API is ready for deployment on platforms like:

- **Railway** - Database + API hosting
- **Vercel** - Serverless deployment
- **DigitalOcean** - VPS deployment
- **Heroku** - Container deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.