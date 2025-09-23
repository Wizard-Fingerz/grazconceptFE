
import api from './api';


export async function getMyHotelReservations() {
  try {
    const response = await api.get(`/app/hotel-bookings`);
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
  