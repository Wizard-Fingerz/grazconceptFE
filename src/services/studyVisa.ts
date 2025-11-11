
import api from './api';

/**
 * Fetch all institutions.
 */
export async function getAllInstitutions() {
  try {
    const response = await api.get(`/app/institutions`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch institution countries.
 * @returns {Promise<any[]>} List of countries where institutions are located.
 */
export async function getInstitutionCountries() {
  try {
    const response = await api.get(`/app/institutions/countries/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch institutions filtered by country.
 * @param country {string} The country name or code.
 * @returns {Promise<any[]>} Institutions in the specified country.
 */
export async function getInstitutionsByCountry(country: string) {
  try {
    const response = await api.get(`/app/institutions/by-country/`, { params: { country } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch the most recent study visa applications (limit 5).
 */
export async function getMyRecentSudyVisaApplicaton() {
  try {
    const response = await api.get(`/app/study-visa-application/?limit=5`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all student visa applications with optional filters/pagination.
 */
export async function getAllStudyVisaApplication(params?: Record<string, any>) {
  try {
    const response = await api.get(`/app/study-visa-application/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch a study visa application by its ID.
 * @param id The application ID.
 * @returns Study application data.
 */
export async function getStudyVisaApplicationById(id: string | number) {
  try {
    const response = await api.get(`/app/study-visa-application/${id}/`);
    if (!response.data) throw new Error("Failed to fetch study application details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch the most recent study visa offers (limit 2).
 */
export async function getMyRecentSudyVisaOffer() {
  try {
    const response = await api.get(`/app/study-visa-offers/?limit=2`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch all study visa offers with optional filters/pagination.
 */
export async function getAllSudyVisaOffer(params?: Record<string, any>) {
  try {
    const response = await api.get(`/app/study-visa-offers/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch study visa offer details by id.
 */
export async function getStudyVisaOfferById(id: string | number) {
  try {
    const response = await api.get(`/app/study-visa-offers/${id}/`);
    if (!response.data) throw new Error("Failed to fetch offer details");
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch ad banners (limit 3).
 */
export async function getAddBanners() {
  try {
    const response = await api.get(`/app/ad-banner/?limit=3`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch courses based on selected institution and program type.
 * @param institutionId (string | number) The institution ID.
 * @param programTypeId (string | number) The program type ID.
 * @returns {Promise<any[]>} Array of courses for given institution and program type.
 */
export async function getCoursesForInstitutionAndProgramType(
  institutionId: string | number,
  programTypeId: string | number
) {
  try {
    // Using endpoint: /app/courses-of-study/?institution=...&program_type=...
    const response = await api.get('/app/courses-of-study/', {
      params: {
        institution: institutionId,
        program_type: programTypeId
      }
    });
    return response.data; // expected to be array of courses
  } catch (error) {
    throw error;
  }
}

