import api from './api';

// Get all pilgrimage destinations/packages
export async function getAllPilgrimages() {
  try {
    const response = await api.get(`/app/pilgrimage-offer`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get the recent pilgrimage applications/bookings for the current user (limit 5)
export async function getMyRecentPilgrimageApplications() {
  try {
    const response = await api.get(`/app/pilgrimage-bookings/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get pilgrimage ad banners (limit 3)
export async function getPilgrimageBanners() {
  try {
    const response = await api.get(`/app/pilgrimage-ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

