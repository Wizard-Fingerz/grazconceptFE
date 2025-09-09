import api from './api';

/**
 * Service to submit action form data to the backend API.
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
    "Book Flight": "/flights/book/",
    "Reserve Hotel": "/hotels/reserve/",
    "Apply for Visa": "/visa/apply/",
    "Chat with Agent": "/chat/start/",
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

  try {
    const response = await api.post(endpoint, formData);
    return response.data;
  } catch (error: any) {
    // Optionally, you can handle error formatting here
    throw error;
  }
}
