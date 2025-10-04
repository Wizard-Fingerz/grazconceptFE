import api from "./api";

export async function fetchCountries() {
  try {
    const response = await api.get("/app/countries");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchUniversities() {
  try {
    const response = await api.get("/app/universities");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchGenders() {
  try {
    const response = await api.get("/app/genders");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchVisaTypes() {
  try {
    const response = await api.get("/definitions/by-table-name/?table_name=visa-types");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchSponsorshipTypes() {
  try {
    const response = await api.get("/definitions/by-table-name/?table_name=sponsorship-types");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getHotelSuggestions() {
  try {
    const response = await api.get(`/app/hotels`);
    return response.data;
  } catch (error) {
    throw error;
  }
}