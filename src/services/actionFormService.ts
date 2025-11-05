import api from './api';
import ErrorService from './errorService';

/**
 * Service to submit action form data to the backend API.
 * Includes Bearer token from localStorage in the request headers.
 * @param actionLabel The label of the action (e.g., "Book Flight", "Reserve Hotel", etc.)
 * @param formData The form data object to submit
 * @returns Promise resolving to the API response
 */
export async function submitActionForm(
  actionLabel: string,
  formData: Record<string, any>
): Promise<any> {
  // Map action labels to backend API endpoints
  const endpointMap: Record<string, string> = {
    "Book Flight": "/app/search-flights/",
    "Reserve Hotel": "/app/hotel-bookings/",
    "Apply for Visa": "/visa/apply/",
    "Chat with Agent": "/support/chat/",
    "Create Savings Plan": "/savings/create/",
    "Apply for Study Loan": "/loans/study/apply/",
    "Study Abroad Loan": "/loans/study-abroad/apply/",
    "Pilgrimage Package": "/pilgrimage/apply/",
    "Business Loan for Travel Project": "/loans/business-travel/apply/",
    // Add more mappings as needed
  };

  const endpoint = endpointMap[actionLabel];
  if (!endpoint) {
    throw new Error(`No API endpoint mapped for action: ${actionLabel}`);
  }

  // Get the latest token from localStorage
  const token = localStorage.getItem('token');
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  try {
    const response = await api.post(endpoint, formData, { headers });
    ErrorService.showSuccess(`${actionLabel} submitted successfully!`);
    return response.data;
  } catch (error: any) {
    ErrorService.handleFormError(actionLabel, error);
    throw error;
  }
}
