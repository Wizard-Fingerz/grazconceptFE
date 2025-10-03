
import api from './api';


export async function getAllInstitutions() {
  try {
    const response = await api.get(`/app/institutions`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getMyRecentSudyVisaApplicaton() {
  try {
    // Add ?limit=3 to only fetch the three most recent applications (if backend supports it)
    const response = await api.get(`/app/study-visa-application/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMyRecentSudyVisaOffer() {
  try {
    // Add ?limit=3 to only fetch the three most recent applications (if backend supports it)
    const response = await api.get(`/app/study-visa-offers/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getAddBanners() {
  try {
    // Add ?limit=3 to only fetch the three most recent applications (if backend supports it)
    const response = await api.get(`/app/ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}