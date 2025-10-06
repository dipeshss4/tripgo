const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error.message}`, 500, null);
  }
}

export const cruiseApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/cruises${query ? `?${query}` : ''}`);
    // Transform the response to match our expected structure
    return {
      data: response.data?.cruises || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getBySlug: (slug) => apiRequest(`/cruises/${slug}`),
  getReviews: (id) => apiRequest(`/cruises/${id}/reviews`),
  checkAvailability: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/cruises/${id}/availability${query ? `?${query}` : ''}`);
  },
  getRoute: (id) => apiRequest(`/cruises/${id}/route`),
};

export const hotelApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/hotels${query ? `?${query}` : ''}`);
    return {
      data: response.data?.hotels || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getById: (id) => apiRequest(`/hotels/${id}`),
  getReviews: (id) => apiRequest(`/hotels/${id}/reviews`),
};

export const packageApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/packages${query ? `?${query}` : ''}`);
    return {
      data: response.data?.packages || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getById: (id) => apiRequest(`/packages/${id}`),
  getReviews: (id) => apiRequest(`/packages/${id}/reviews`),
};

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getProfile: (token) => apiRequest('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  }),
};

export const bookingApi = {
  // Cruise booking
  createCruiseBooking: (cruiseId, bookingData, token) => apiRequest(`/bookings/cruise/${cruiseId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(bookingData),
  }),
  // Hotel booking
  createHotelBooking: (hotelId, bookingData, token) => apiRequest(`/bookings/hotel/${hotelId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(bookingData),
  }),
  // Package booking
  createPackageBooking: (packageId, bookingData, token) => apiRequest(`/bookings/package/${packageId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(bookingData),
  }),
  // General booking (legacy)
  create: (bookingData, token) => apiRequest('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(bookingData),
  }),
  getMyBookings: (token) => apiRequest('/bookings/user', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  getById: (id, token) => apiRequest(`/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  confirmPayment: (id, token) => apiRequest(`/bookings/${id}/confirm-payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

export { ApiError };