# TripGo Admin Panel

A modern React-based admin panel for managing the TripGo travel platform with multi-tenant support.

## Features

- 🔐 **Authentication System** - JWT-based authentication with role-based access control
- 🏢 **Multi-Tenant Support** - Manage multiple tenants with data isolation
- 📊 **Dashboard** - Analytics and statistics overview
- 👥 **User Management** - Manage users with different roles
- 🚢 **Cruise Management** - CRUD operations for cruise packages
- 🏨 **Hotel Management** - Hotel inventory and booking management
- 📦 **Package Management** - Travel package creation and management
- 👔 **HR Module** - Employee management, attendance, leave, payroll
- 📁 **Media Library** - File upload and media management
- ⚙️ **Site Settings** - Dynamic configuration management
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with validation
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## User Roles

- **SUPER_ADMIN**: Full system access across all tenants
- **ADMIN**: Tenant-level administrative access
- **HR_MANAGER**: HR module access and employee management
- **EMPLOYEE**: Limited access to personal information
- **CUSTOMER**: Read-only access to booking information

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TripGo Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your API URL:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Default Login Credentials

After seeding the backend database, you can use these default credentials:

**Main Tenant (main.tripgo.local):**
- Email: `admin@main.tripgo.com`
- Password: `admin123`
- Role: ADMIN

**Cruises Tenant (cruises.tripgo.local):**
- Email: `admin@cruises.tripgo.com`
- Password: `admin123`
- Role: ADMIN

**Hotels Tenant (hotels.tripgo.local):**
- Email: `admin@hotels.tripgo.com`
- Password: `admin123`
- Role: ADMIN

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── ui/             # Basic UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services and HTTP client
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## API Integration

The admin panel integrates with the TripGo backend API:

- **Base URL**: Configurable via `VITE_API_URL`
- **Authentication**: JWT tokens stored in localStorage
- **Tenant Isolation**: Automatic tenant ID headers
- **Error Handling**: Global error interceptors with toast notifications

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Features Overview

### Authentication
- Secure login with email/password
- Optional tenant subdomain specification
- Automatic token refresh
- Role-based route protection

### Dashboard
- Key metrics and statistics
- Recent bookings overview
- Revenue analytics
- Quick navigation to main features

### User Management
- Create, edit, and manage users
- Role assignment and permissions
- User status management
- Bulk operations

### Booking Management
- View all bookings across tenants
- Filter and search capabilities
- Status updates and management
- Customer communication

### Content Management
- Cruise packages with itineraries
- Hotel listings with amenities
- Travel packages with pricing
- Rich media support

### HR Module
- Employee profiles and management
- Attendance tracking
- Leave request workflows
- Payroll management
- Performance reviews

### Media Library
- File upload with drag & drop
- Image, video, and document support
- Automatic file categorization
- CDN integration ready

### Site Settings
- Dynamic configuration management
- Tenant-specific settings
- JSON, string, number, boolean types
- Environment-based configurations

## Multi-Tenant Architecture

The admin panel supports multiple tenants:

1. **Tenant Detection**: Automatic tenant resolution from subdomain or manual selection
2. **Data Isolation**: All API requests include tenant context
3. **UI Adaptation**: Tenant-specific branding and settings
4. **Role Permissions**: Tenant-aware role-based access control

## Development Guidelines

### Adding New Features

1. Create TypeScript interfaces in `src/types/`
2. Add API service functions in `src/services/`
3. Create page components in `src/pages/`
4. Add routes in `App.tsx`
5. Update navigation in `Sidebar.tsx`

### Code Style

- Use TypeScript for all new code
- Follow React functional component patterns
- Use Tailwind CSS classes for styling
- Implement proper error handling
- Add loading states for async operations

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Implement proper error handling
4. Test with multiple user roles
5. Ensure mobile responsiveness

## License

Private project for TripGo platform.