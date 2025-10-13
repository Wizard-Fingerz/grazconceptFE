import axios from 'axios';
import { showErrorToast, shouldShowErrorToast } from '../utils/errorHandler';

// const API_BASE_URL = 'http://localhost:8002/api/';

const API_BASE_URL = 'https://grazconceptbe.onrender.com/api/';

// Get token from localStorage (if available) to set initial Authorization header
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

// Add request interceptor to add auth token (in case token changes after initialization)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh and error notifications
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token refresh)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('token');
        // window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed — logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for POST requests and other specified methods
    if (shouldShowErrorToast(error, originalRequest)) {
      showErrorToast(error);
    }

    return Promise.reject(error);
  }
);

export default api;

// --- NOTE ---
// The issue described (navigating to a page after signup, then being redirected back to dashboard after 1s)
// is NOT caused by this api.ts file. It is caused by the logic in AuthContext.tsx (see useEffect in AuthProvider).
// Specifically, the useEffect in AuthProvider checks authentication and redirects to dashboard if on a public page,
// but the "justLoggedInOrRegistered" flag is only set for login/register, not for navigation after signup.
// 
// To fix the issue, you need to ensure that after signup/login, the redirect logic in AuthProvider does not
// incorrectly redirect the user back to the dashboard when they are already navigating elsewhere.
// 
// This file (api.ts) does not perform any navigation or redirect except on token refresh failure (401).
