
import api from './api';

/**
 * Fetch all civil servant loan offers, with optional params (e.g., limit).
 * Example usage: getCivilServantLoanOffers({ limit: 5 })
 */
export async function getCivilServantLoanOffers(params?: Record<string, any>) {
  try {
    const response = await api.get(`/wallet/loan-offers/civil-servant-loans/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch the recent civil servant loan offers for the current user (limit 5 by default).
 */
export async function getRecentCivilServantLoanOffers(limit: number = 5) {
  try {
    const response = await api.get(`/wallet/loan-offers/civil-servant-loans/`, { params: { limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all study loan offers, with optional params (e.g., limit).
 * Example usage: getStudyLoanOffers({ limit: 5 })
 */
export async function getStudyLoanOffers(params?: Record<string, any>) {
  try {
    const response = await api.get(`/wallet/loan-offers/study-loans/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch the recent study loan offers/applications for the current user (limit 5 by default).
 */
export async function getRecentStudyLoanOffers(limit: number = 5) {
  try {
    const response = await api.get(`/wallet/loan-offers/study-loans/`, { params: { limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all loan offers (optionally paginated/filtered).
 */
export async function getAllLoanOffers(params?: Record<string, any>) {
  try {
    const response = await api.get(`/wallet/loan-offers/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch recent loan applications for the current user (limit 5 by default).
 */
export async function getMyRecentLoanApplications(limit: number = 5) {
  try {
    const response = await api.get(`/wallet/loan-applications/`, { params: { limit } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch loan offer by ID.
 */
export async function getLoanOfferById(id: string | number) {
  try {
    const response = await api.get(`/app/loan-offers/${id}/`);
    if (!response.data) throw new Error("Failed to fetch offer details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch loan analytics summary for the current user.
 * Returns aggregate analytics (e.g., total loans, outstanding, paid, etc).
 * GET /wallet/loan-analytics/summary/
 */
export async function getLoanAnalyticsSummary() {
  try {
    const response = await api.get('/wallet/loan-analytics/summary/');
    return response.data;
  } catch (error) {
    throw error;
  }
}
