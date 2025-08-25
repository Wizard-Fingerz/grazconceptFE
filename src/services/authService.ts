import api from './api';

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
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type_name: 'customer' | 'agent';
  profile_picture?: string;
  bio?: string;
  date_of_birth?: string | null;
  phone_number?: string;
  address?: string;
}

export interface RegisterResponse {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type_name: 'customer' | 'agent';
}

const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/users/token/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

async register(data: RegisterData): Promise<RegisterResponse> {
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

  return userData;
},


  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile/');
    console.log('Profile response:', response.data); // Debug log
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>) {
    const response = await api.patch('/users/profile/update/', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService; 