
import api from './api';


export async function getEuropeanCitizenshipPrograms() {
  try {
    const response = await api.get(`/app/european-citizenship-offer`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getEuropeanCitizenshipProgramsById(id: string | number) {
  try {
    const response = await api.get(`/app/european-citizenship-offer/${id}/`);
    if (!response.data) throw new Error("Failed to fetch offer details");
    return response.data;
  } catch (error) {
    throw error;
  }
}