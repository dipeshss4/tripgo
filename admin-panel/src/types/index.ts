export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE' | 'CUSTOMER'
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  isActive: boolean
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
  tenant: Tenant
}

export interface LoginCredentials {
  email: string
  password: string
  tenantSubdomain?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Dashboard {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  totalCruises: number
  totalHotels: number
  totalPackages: number
  recentBookings: Booking[]
  revenueChart: RevenueData[]
  topDestinations: DestinationData[]
}

export interface Booking {
  id: string
  userId: string
  user: User
  type: 'CRUISE' | 'HOTEL' | 'PACKAGE'
  itemId: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  bookingDate: string
  checkIn: string
  checkOut: string
  guests: number
  createdAt: string
  updatedAt: string
}

export interface RevenueData {
  month: string
  revenue: number
}

export interface DestinationData {
  name: string
  bookings: number
}

export interface Cruise {
  id: string
  name: string
  description: string
  departure: string
  destination: string
  duration: number
  capacity: number
  price: number
  images: string[]
  amenities: string[]
  itinerary: CruiseItinerary[]
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface CruiseItinerary {
  day: number
  port: string
  arrival: string
  departure: string
  activities: string[]
}

export interface Hotel {
  id: string
  name: string
  description: string
  location: string
  address: string
  city: string
  country: string
  rating: number
  price: number
  images: string[]
  amenities: string[]
  rooms: HotelRoom[]
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface HotelRoom {
  id: string
  type: string
  capacity: number
  price: number
  amenities: string[]
  available: boolean
}

export interface Package {
  id: string
  name: string
  description: string
  duration: number
  price: number
  images: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: PackageItinerary[]
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface PackageItinerary {
  day: number
  title: string
  description: string
  activities: string[]
  meals: string[]
  accommodation: string
}

export interface Employee {
  id: string
  userId: string
  user: User
  employeeId: string
  departmentId: string
  department: Department
  position: string
  salary: number
  hireDate: string
  isActive: boolean
  manager: Employee | null
  managerId: string | null
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  managerId: string | null
  manager: Employee | null
  employees: Employee[]
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  description: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface MediaFile {
  id: string
  originalName: string
  filename: string
  path: string
  mimetype: string
  size: number
  category: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  tenantId: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}