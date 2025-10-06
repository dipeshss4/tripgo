const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Rate limiting and retry utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const requestQueue = new Map();

async function apiRequestWithRetry(endpoint, options = {}, retryCount = 0) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  try {
    const response = await apiRequest(endpoint, options);
    return response;
  } catch (error) {
    if (error.status === 429 && retryCount < maxRetries) {
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
      const retryAfter = error.data?.retryAfter ? parseInt(error.data.retryAfter) * 1000 : delay;

      console.log(`Rate limited. Retrying in ${Math.ceil(retryAfter / 1000)}s... (attempt ${retryCount + 1}/${maxRetries})`);
      await sleep(retryAfter);

      return apiRequestWithRetry(endpoint, options, retryCount + 1);
    }
    throw error;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const requestKey = `${options.method || 'GET'}-${endpoint}`;

  // Prevent duplicate concurrent requests
  if (requestQueue.has(requestKey)) {
    return requestQueue.get(requestKey);
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);

      // Handle rate limiting
      if (response.status === 429) {
        throw new ApiError('Too many requests. Please try again later.', 429, {
          retryAfter: response.headers.get('Retry-After')
        });
      }

      // Try to parse JSON, fallback for non-JSON responses
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        if (!response.ok) {
          throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status,
            null
          );
        }
        data = {};
      }

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
    } finally {
      // Remove from queue when done
      requestQueue.delete(requestKey);
    }
  })();

  requestQueue.set(requestKey, requestPromise);
  return requestPromise;
}

export const cruiseApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequestWithRetry(`/cruises${query ? `?${query}` : ''}`);
    return {
      data: response.data?.cruises || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getBySlug: (slug) => apiRequestWithRetry(`/cruises/${slug}`),
  getReviews: (id) => apiRequestWithRetry(`/cruises/${id}/reviews`),
};

export const hotelApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequestWithRetry(`/hotels${query ? `?${query}` : ''}`);
    return {
      data: response.data?.hotels || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getById: (id) => apiRequestWithRetry(`/hotels/${id}`),
  getReviews: (id) => apiRequestWithRetry(`/hotels/${id}/reviews`),
};

export const packageApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequestWithRetry(`/packages${query ? `?${query}` : ''}`);
    return {
      data: response.data?.packages || response.data || [],
      pagination: response.data?.pagination || response.pagination
    };
  },
  getById: (id) => apiRequestWithRetry(`/packages/${id}`),
  getReviews: (id) => apiRequestWithRetry(`/packages/${id}/reviews`),
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
  create: (bookingData, token) => apiRequest('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(bookingData),
  }),
  getMyBookings: (token) => apiRequest('/bookings/my', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  getById: (id, token) => apiRequest(`/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
};

export { ApiError };