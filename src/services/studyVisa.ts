
import api from './api';


export async function getAllInstitutions() {
  try {
    const response = await api.get(`/app/institutions`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getMyAppliedInstitutions() {
    try {
      const response = await api.get(`/app/hotels`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  