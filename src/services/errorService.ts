import { showErrorToast, showSuccessToast, showWarningToast, showInfoToast, formatApiError } from '../utils/errorHandler';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  timestamp?: string;
}

export class ErrorService {
  /**
   * Handle API errors with context
   */
  static handleApiError(error: any, context?: ErrorContext) {
    const errorMessage = formatApiError(error);
    
    // Log error for debugging
    console.error('API Error:', {
      error,
      context,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    // Show toast notification
    showErrorToast(error);
    
    return errorMessage;
  }

  /**
   * Handle specific operation errors
   */
  static handleOperationError(operation: string, error: any) {
    const context: ErrorContext = {
      operation,
      timestamp: new Date().toISOString()
    };
    
    return this.handleApiError(error, context);
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(formName: string, error: any) {
    const context: ErrorContext = {
      operation: `Form submission: ${formName}`,
      timestamp: new Date().toISOString()
    };
    
    return this.handleApiError(error, context);
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any) {
    const context: ErrorContext = {
      operation: 'Authentication',
      timestamp: new Date().toISOString()
    };
    
    return this.handleApiError(error, context);
  }

  /**
   * Handle file upload errors
   */
  static handleUploadError(error: any, fileName?: string) {
    const context: ErrorContext = {
      operation: `File upload${fileName ? `: ${fileName}` : ''}`,
      timestamp: new Date().toISOString()
    };
    
    return this.handleApiError(error, context);
  }

  /**
   * Show success message
   */
  static showSuccess(message: string, context?: ErrorContext) {
    console.log('Success:', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
    
    showSuccessToast(message);
  }

  /**
   * Show warning message
   */
  static showWarning(message: string, context?: ErrorContext) {
    console.warn('Warning:', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
    
    showWarningToast(message);
  }

  /**
   * Show info message
   */
  static showInfo(message: string, context?: ErrorContext) {
    console.info('Info:', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
    
    showInfoToast(message);
  }

  /**
   * Handle specific HTTP status codes
   */
  static handleHttpError(status: number, error: any) {
    switch (status) {
      case 400:
        return this.handleApiError(error, { operation: 'Bad Request' });
      case 401:
        return this.handleApiError(error, { operation: 'Unauthorized' });
      case 403:
        return this.handleApiError(error, { operation: 'Forbidden' });
      case 404:
        return this.handleApiError(error, { operation: 'Not Found' });
      case 422:
        return this.handleApiError(error, { operation: 'Validation Error' });
      case 500:
        return this.handleApiError(error, { operation: 'Server Error' });
      case 502:
        return this.handleApiError(error, { operation: 'Bad Gateway' });
      case 503:
        return this.handleApiError(error, { operation: 'Service Unavailable' });
      default:
        return this.handleApiError(error, { operation: `HTTP ${status}` });
    }
  }
}

export default ErrorService;
