export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CruiseFilters extends PaginationQuery {
  minPrice?: string;
  maxPrice?: string;
  duration?: string;
  type?: string;
  rating?: string;
}

export interface ShipFilters extends PaginationQuery {
  minPrice?: string;
  maxPrice?: string;
  duration?: string;
  type?: string;
  rating?: string;
}

export interface HotelFilters extends PaginationQuery {
  city?: string;
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
}

export interface PackageFilters extends PaginationQuery {
  destination?: string;
  minPrice?: string;
  maxPrice?: string;
  duration?: string;
  rating?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface BookingRequest {
  guests: number;
  checkIn?: string;
  checkOut?: string;
  specialRequests?: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}