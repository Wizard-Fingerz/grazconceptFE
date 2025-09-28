import { toast } from 'react-toastify';

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

/**
 * Formats API error messages for display
 */
export const formatApiError = (error: any): string => {
  // Handle different error response structures
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors (Django REST framework style)
    if (data.detail) {
      return data.detail;
    }
    
    // Handle field-specific validation errors
    if (typeof data === 'object' && !Array.isArray(data)) {
      const fieldErrors = Object.entries(data)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('; ');
      
      if (fieldErrors) {
        return fieldErrors;
      }
    }
    
    // Handle array of errors
    if (Array.isArray(data)) {
      return data.join('; ');
    }
    
    // Handle string errors
    if (typeof data === 'string') {
      return data;
    }
    
    // Handle nested error objects
    if (data.error) {
      return data.error;
    }
    
    if (data.message) {
      return data.message;
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  // Handle generic errors
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Shows error toast notification
 */
export const showErrorToast = (error: any, customMessage?: string) => {
  const errorMessage = customMessage || formatApiError(error);
  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows success toast notification
 */
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows warning toast notification
 */
export const showWarningToast = (message: string) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Shows info toast notification
 */
export const showInfoToast = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Determines if an error should show a toast notification
 */
export const shouldShowErrorToast = (error: any, config: any): boolean => {
  // Don't show toast for 401 errors (handled by auth interceptor)
  if (error.response?.status === 401) {
    return false;
  }
  
  // Don't show toast for 403 errors (permission denied)
  if (error.response?.status === 403) {
    return false;
  }
  
  // Don't show toast for cancelled requests
  if (error.code === 'ERR_CANCELED') {
    return false;
  }
  
  // Show toast for POST, PUT, PATCH, DELETE requests by default
  const method = config?.method?.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }
  
  // Don't show toast for GET requests unless explicitly requested
  return false;
};
