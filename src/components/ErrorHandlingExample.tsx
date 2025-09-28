import React, { useState } from 'react';
import { Button, Box, Typography, TextField } from '@mui/material';
import api from '../services/api';
import ErrorService from '../services/errorService';

/**
 * Example component demonstrating the new error handling system
 * This shows how to use the ErrorService for different scenarios
 */
const ErrorHandlingExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Example 1: Using ErrorService directly
  const handleDirectErrorService = async () => {
    try {
      setLoading(true);
      // This will trigger a 404 error
      await api.post('/non-existent-endpoint/', { test: 'data' });
    } catch (error) {
      ErrorService.handleOperationError('Test Operation', error);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Using ErrorService for form validation
  const handleFormValidation = async () => {
    try {
      setLoading(true);
      // This will trigger validation errors
      await api.post('/users/register/', {
        email: email || 'invalid-email',
        password: '123', // Too short
        password2: '456', // Doesn't match
        first_name: '',
        last_name: '',
        user_type: 0
      });
    } catch (error) {
      ErrorService.handleFormError('User Registration', error);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Using ErrorService for file upload
  const handleFileUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.txt'));
      
      await api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      ErrorService.handleUploadError(error, 'test.txt');
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Manual success/warning/info messages
  const handleSuccessMessage = () => {
    ErrorService.showSuccess('Operation completed successfully!');
  };

  const handleWarningMessage = () => {
    ErrorService.showWarning('This is a warning message');
  };

  const handleInfoMessage = () => {
    ErrorService.showInfo('This is an informational message');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Error Handling Examples
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click the buttons below to test different error handling scenarios.
        Toast notifications will appear showing the exact API errors.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email (for validation test)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          size="small"
        />

        <Button
          variant="contained"
          onClick={handleDirectErrorService}
          disabled={loading}
          color="error"
        >
          Test 404 Error (Direct ErrorService)
        </Button>

        <Button
          variant="contained"
          onClick={handleFormValidation}
          disabled={loading}
          color="warning"
        >
          Test Form Validation Errors
        </Button>

        <Button
          variant="contained"
          onClick={handleFileUpload}
          disabled={loading}
          color="info"
        >
          Test File Upload Error
        </Button>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleSuccessMessage}
            color="success"
            size="small"
          >
            Success Toast
          </Button>
          <Button
            variant="outlined"
            onClick={handleWarningMessage}
            color="warning"
            size="small"
          >
            Warning Toast
          </Button>
          <Button
            variant="outlined"
            onClick={handleInfoMessage}
            color="info"
            size="small"
          >
            Info Toast
          </Button>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Note: The API interceptor will automatically show toast notifications for POST, PUT, PATCH, and DELETE requests.
        Check the console for detailed error logs.
      </Typography>
    </Box>
  );
};

export default ErrorHandlingExample;
