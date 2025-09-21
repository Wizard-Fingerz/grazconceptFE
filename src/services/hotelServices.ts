import axios from 'axios';

const API_BASE_URL = '/api'; // Adjust base URL as needed

export async function getMyHotelReservations() {
  try {
    const response = await axios.get(`${API_BASE_URL}/hotel-bookings`);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getHotelSuggestions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotel-bookings`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  