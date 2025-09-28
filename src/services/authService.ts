import api from './api';
import ErrorService from './errorService';

export interface LoginCredentials {
  // username?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type_name?: 'customer' | 'agent';
  user_type: number;
}

export interface UserProfile {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  gender_name?: string | null;
  current_address?: string | null;
  country_of_residence?: string | null;
  nationality?: string | null;
  user_type: number;
  role: number;
  custom_id?: string | null;
  profile_picture?: string;
  profile_picture_url?: string | null;
  email: string;
  extra_permissions?: any[];
  is_deleted: boolean;
  is_active: boolean;
  is_staff: boolean;
  created_by?: number | null;
  created_date: string;
  modified_by?: number | null;
  modified_date: string;
  last_login?: string | null;
  user_type_name: string;
  full_name: string;
  username?: string; // Not always present, but included for compatibility
  bio?: string;
  address?: string;
  country?: string;
}

export interface RegisterResponse {
  user_type: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type_name: 'customer' | 'agent';
}

const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/users/token/', credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      ErrorService.showSuccess('Login successful!');
      return response.data;
    } catch (error) {
      ErrorService.handleAuthError(error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/users/register/', {
        ...data,
        username: `${data.first_name.toLowerCase()}.${data.last_name.toLowerCase()}`
      });

      const { access, refresh, ...userData } = response.data;

      if (access && refresh) {
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Tokens stored after registration:', { access, refresh });
      }

      ErrorService.showSuccess('Registration successful!');
      return userData;
    } catch (error) {
      ErrorService.handleAuthError(error);
      throw error;
    }
  },

  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/users/profile/');
      console.log('Profile response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      ErrorService.handleApiError(error, { operation: 'Get Profile' });
      throw error;
    }
  },

  async updateProfile(data: Partial<UserProfile>) {
    try {
      const response = await api.patch('/users/profile/update/', data);
      ErrorService.showSuccess('Profile updated successfully!');
      return response.data;
    } catch (error) {
      ErrorService.handleFormError('Profile Update', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    ErrorService.showInfo('Logged out successfully');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService; 