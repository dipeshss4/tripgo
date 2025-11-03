import { API_BASE_URL } from './api';

// Fetch all cruise categories
export async function getCruiseCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/cruise-categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.data.categories || [];
  } catch (error) {
    console.error('Error fetching cruise categories:', error);
    return [];
  }
}

// Fetch cruises by category
export async function getCruisesByCategory(categorySlug) {
  try {
    const response = await fetch(`${API_BASE_URL}/cruise-categories/slug/${categorySlug}`);
    if (!response.ok) throw new Error('Failed to fetch category cruises');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching category cruises:', error);
    return null;
  }
}

// Fetch departures for a cruise
export async function getCruiseDepartures(cruiseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cruise-departures/cruise/${cruiseId}`);
    if (!response.ok) throw new Error('Failed to fetch departures');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching cruise departures:', error);
    return [];
  }
}

// Calculate final price with modifier
export function calculateDeparturePrice(basePrice, priceModifier = 1.0) {
  return Math.round(basePrice * priceModifier);
}

// Format departure date range
export function formatDepartureDates(departureDate, returnDate) {
  const departure = new Date(departureDate);
  const returnDt = new Date(returnDate);

  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const departureStr = departure.toLocaleDateString('en-US', options);
  const returnStr = returnDt.toLocaleDateString('en-US', options);

  return `${departureStr} - ${returnStr}`;
}

// Get status badge color
export function getDepartureStatusColor(status) {
  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-800',
    FILLING_FAST: 'bg-orange-100 text-orange-800',
    SOLD_OUT: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// Get status display text
export function getDepartureStatusText(status) {
  const statusText = {
    AVAILABLE: 'Available',
    FILLING_FAST: 'Filling Fast 🔥',
    SOLD_OUT: 'Sold Out',
    CANCELLED: 'Cancelled'
  };
  return statusText[status] || status;
}