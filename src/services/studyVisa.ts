
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

export async function getAllStudyVisaApplication(params?: Record<string, any>) {
  try {
    // Pass params for pagination/filtering if provided
    const response = await api.get(`/app/study-visa-application/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMyRecentSudyVisaOffer() {
  try {
    // Add ?limit=3 to only fetch the three most recent applications (if backend supports it)
    const response = await api.get(`/app/study-visa-offers/?limit=2`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllSudyVisaOffer(params?: Record<string, any>) {
  try {
    // Pass params for pagination/filtering if provided
    const response = await api.get(`/app/study-visa-offers/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getStudyVisaOfferById(id: string | number) {
  // Replace with actual API call
  try {
    const response = await api.get(`/app/study-visa-offers/${id}/`);
    if (!response.data) throw new Error("Failed to fetch offer details");
    return await response.data;
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