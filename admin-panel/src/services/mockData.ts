import { User, Booking, Cruise, Dashboard } from '../types'

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@tripgo.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'ADMIN',
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'sarah.manager@tripgo.com',
    firstName: 'Sarah',
    lastName: 'Manager',
    role: 'HR_MANAGER',
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z',
  },
  {
    id: '3',
    email: 'mike.employee@tripgo.com',
    firstName: 'Mike',
    lastName: 'Employee',
    role: 'EMPLOYEE',
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-17T11:15:00Z',
    updatedAt: '2024-01-17T11:15:00Z',
  },
  {
    id: '4',
    email: 'customer@email.com',
    firstName: 'Jane',
    lastName: 'Customer',
    role: 'CUSTOMER',
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
  {
    id: '5',
    email: 'inactive@email.com',
    firstName: 'Bob',
    lastName: 'Inactive',
    role: 'CUSTOMER',
    isActive: false,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-19T16:45:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
  },
]

// Mock Bookings Data
export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: '4',
    user: mockUsers[3],
    type: 'CRUISE',
    itemId: '1',
    totalAmount: 2500,
    status: 'CONFIRMED',
    bookingDate: '2024-01-20T10:00:00Z',
    checkIn: '2024-03-15T00:00:00Z',
    checkOut: '2024-03-22T00:00:00Z',
    guests: 2,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    userId: '4',
    user: mockUsers[3],
    type: 'HOTEL',
    itemId: '2',
    totalAmount: 800,
    status: 'PENDING',
    bookingDate: '2024-01-21T14:30:00Z',
    checkIn: '2024-02-10T00:00:00Z',
    checkOut: '2024-02-15T00:00:00Z',
    guests: 1,
    createdAt: '2024-01-21T14:30:00Z',
    updatedAt: '2024-01-21T14:30:00Z',
  },
  {
    id: '3',
    userId: '5',
    user: mockUsers[4],
    type: 'PACKAGE',
    itemId: '3',
    totalAmount: 1200,
    status: 'CANCELLED',
    bookingDate: '2024-01-19T09:15:00Z',
    checkIn: '2024-04-01T00:00:00Z',
    checkOut: '2024-04-08T00:00:00Z',
    guests: 3,
    createdAt: '2024-01-19T09:15:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
  },
]

// Mock Cruises Data
export const mockCruises: Cruise[] = [
  {
    id: '1',
    name: 'Caribbean Adventure',
    description: 'Explore the beautiful Caribbean islands with our luxury cruise ship.',
    departure: 'Miami, FL',
    destination: 'Caribbean Islands',
    duration: 7,
    capacity: 2000,
    price: 1299,
    images: ['/images/cruise1.jpg', '/images/cruise2.jpg'],
    amenities: ['Pool', 'Spa', 'Theater', 'Casino', 'Multiple Restaurants'],
    itinerary: [
      {
        day: 1,
        port: 'Miami, FL',
        arrival: 'Embarkation',
        departure: '5:00 PM',
        activities: ['Ship Orientation', 'Welcome Dinner'],
      },
      {
        day: 2,
        port: 'Nassau, Bahamas',
        arrival: '8:00 AM',
        departure: '5:00 PM',
        activities: ['Beach Excursion', 'Paradise Island', 'Local Market'],
      },
      {
        day: 3,
        port: 'Cozumel, Mexico',
        arrival: '7:00 AM',
        departure: '6:00 PM',
        activities: ['Snorkeling', 'Mayan Ruins Tour', 'Tequila Tasting'],
      },
    ],
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Mediterranean Delight',
    description: 'Discover the charm of Mediterranean coastal cities.',
    departure: 'Barcelona, Spain',
    destination: 'Mediterranean Coast',
    duration: 10,
    capacity: 1500,
    price: 1899,
    images: ['/images/med1.jpg'],
    amenities: ['Pool', 'Library', 'Wine Bar', 'Cooking Classes'],
    itinerary: [
      {
        day: 1,
        port: 'Barcelona, Spain',
        arrival: 'Embarkation',
        departure: '7:00 PM',
        activities: ['City Tour', 'Tapas Dinner'],
      },
      {
        day: 2,
        port: 'Palma, Mallorca',
        arrival: '8:00 AM',
        departure: '6:00 PM',
        activities: ['Cathedral Visit', 'Beach Time', 'Local Markets'],
      },
    ],
    isActive: true,
    tenantId: 'demo-tenant-1',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
]

// Mock Dashboard Data
export const mockDashboard: Dashboard = {
  totalUsers: mockUsers.length,
  totalBookings: mockBookings.length,
  totalRevenue: mockBookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
  totalCruises: mockCruises.length,
  totalHotels: 5,
  totalPackages: 8,
  recentBookings: mockBookings.slice(0, 3),
  revenueChart: [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 14000 },
    { month: 'May', revenue: 20000 },
    { month: 'Jun', revenue: 22000 },
  ],
  topDestinations: [
    { name: 'Caribbean', bookings: 45 },
    { name: 'Mediterranean', bookings: 32 },
    { name: 'Alaska', bookings: 28 },
    { name: 'Hawaii', bookings: 25 },
  ],
}

// Helper function to simulate API delay
export const simulateDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Mock pagination helper
export const paginateArray = <T>(array: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const items = array.slice(startIndex, endIndex)

  return {
    items,
    total: array.length,
    page,
    limit,
    totalPages: Math.ceil(array.length / limit),
  }
}