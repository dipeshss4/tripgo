// Main API configuration
export { default as api, isDemoMode } from './api'

// Import services for the unified services object
import { authService } from './auth'
import adminService from './admin'
import adminContentService from './adminContent'
import adminSystemService from './adminSystem'
import dashboardService from './dashboard'
import { cruisesService } from './cruises'
import { hotelsService } from './hotels'
import { packagesService } from './packages'
import { usersService } from './users'
import { bookingsService } from './bookings'
import { hrService } from './hr'
import { mediaService } from './media'

// Export services individually
export { authService }
export { default as adminService } from './admin'
export { default as adminContentService } from './adminContent'
export { default as adminSystemService } from './adminSystem'
export { default as dashboardService } from './dashboard'

// Content management services (existing)
export { cruisesService } from './cruises'
export { hotelsService } from './hotels'
export { packagesService } from './packages'

// User and booking management (existing)
export { usersService } from './users'
export { bookingsService } from './bookings'

// HR services
export { hrService } from './hr'

// Media services
export { mediaService } from './media'

// Re-export types
export type {
  // Admin Content types
  Cruise,
  Hotel,
  Package,
  ListResponse,
  ListParams,
} from './adminContent'

export type {
  // Admin System types
  SiteSetting,
  Tenant,
  MediaFile,
  SystemLog,
  BackupInfo,
} from './adminSystem'

export type {
  // Dashboard types
  DashboardStats,
  AnalyticsData,
} from './dashboard'

export type {
  // HR types
  AttendanceRecord,
  LeaveRequest,
  CreateEmployeeData,
  UpdateEmployeeData,
  HRDashboard,
} from './hr'

// Unified service object for easy import
export const services = {
  // Authentication
  auth: authService,

  // Admin services
  admin: adminService,
  adminContent: adminContentService,
  adminSystem: adminSystemService,

  // Dashboard
  dashboard: dashboardService,

  // Content services
  cruises: cruisesService,
  hotels: hotelsService,
  packages: packagesService,

  // User management
  users: usersService,
  bookings: bookingsService,

  // HR services
  hr: hrService,

  // Media services
  media: mediaService,
}

export default services