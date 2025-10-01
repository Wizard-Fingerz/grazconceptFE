
import api from './api';

// Get all work visa offers
export async function getAllWorkVisas() {
  try {
    const response = await api.get(`/app/work-visa-offers`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get recent work visa applications for the current user (limit 5)
export async function getMyRecentWorkVisaApplications() {
  try {
    const response = await api.get(`/app/work-visa-applications/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get work visa ad banners (limit 3)
export async function getWorkVisaBanners() {
  try {
    const response = await api.get(`/app/work-visa-ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}