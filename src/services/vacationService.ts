
import api from './api';

// Get all vacation packages
export async function getAllVacations(params?: Record<string, any
  // Get all vacation packages
  >) {
  try {
    const response = await api.get(`/app/vacation-offer`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get recent vacation bookings for the current user (limit 5)
export async function getMyRecentVacationBookings() {
  try {
    const response = await api.get(`/app/vacation-bookings/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get vacation ad banners (limit 3)
export async function getVacationBanners() {
  try {
    const response = await api.get(`/app/vacation-ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}