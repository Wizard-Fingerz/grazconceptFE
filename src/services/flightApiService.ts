// Flight API service functions. Fill in the endpoints as needed.

import api from './api';

/**
 * Fetch flight search results based on search parameters.
 * @param params Search parameters (e.g., from, to, date, etc.)
 * @returns Promise resolving to flight results
 */
export async function getFlightResults(params: Record<string, any>): Promise<any> {
  // Replace '/flights/search/' with your actual endpoint
  const response = await api.get('/flights/search/', { params });
  return response.data;
}
/**
 * Fetch the list of flights booked by the current user.
 * @returns Promise resolving to the user's booked flights
 */
export async function getBookedFlights(): Promise<any> {
  // Replace '/flights/booked/' with your actual endpoint if different
  const response = await api.get('/app/booked-flights/');
  return response.data;
}

/**
 * Fetch location suggestions for flight search (e.g., airports, cities).
 * This function will always attempt to get suggestions automatically, using the user's current location if no query is provided.
 * It will always trigger a new request when called.
 * 
 * @param query The search query string (optional)
 * @param countryCode Restrict to a country (optional)
 * @returns Promise resolving to location suggestions
 */
export async function getLocationResults(
  query?: string,
  countryCode?: string
): Promise<any> {
  // Helper to get user's country code from browser geolocation (reverse geocode)
  async function getCountryCodeFromBrowserLocation(): Promise<string | undefined> {
    if (!navigator.geolocation) return undefined;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            // Use a public reverse geocoding API (OpenStreetMap Nominatim)
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            const res = await fetch(url, {
              headers: {
                "Accept-Language": "en",
              },
            });
            if (!res.ok) return resolve(undefined);
            const data = await res.json();
            // Try to extract country code (ISO 3166-1 alpha-2)
            const cc =
              data.address?.country_code?.toUpperCase() ||
              data.address?.country_code ||
              undefined;
            resolve(cc);
          } catch {
            resolve(undefined);
          }
        },
        () => resolve(undefined),
        { maximumAge: 60000, timeout: 5000 }
      );
    });
  }

  // Fallback: get user's country code from IP geolocation
  async function getCountryCodeFromIP(): Promise<string | undefined> {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.country_code || undefined;
    } catch {
      return undefined;
    }
  }

  let params: Record<string, any> = {};

  if (query && query.trim()) {
    params.q = query.trim();
    if (countryCode) {
      params.countryCode = countryCode;
    }
  } else {
    // If no query, try browser geolocation first, then IP geolocation
    let cc = countryCode;
    if (!cc) {
      cc = await getCountryCodeFromBrowserLocation();
    }
    if (!cc) {
      cc = await getCountryCodeFromIP();
    }
    if (cc) {
      params.countryCode = cc;
    }
  }

  // Always trigger the request
  const response = await api.get('/app/suggest-locations/', { params });
  return response.data;
}

/**
 * Fetch suggested flights for the user (e.g., based on profile or trends).
 * @returns Promise resolving to suggested flights
 */
export async function getSuggestedFlights(): Promise<any> {
  // Replace '/flights/suggested/' with your actual endpoint
  const response = await api.get('/app/suggest-flights/');
  return response.data;
}
