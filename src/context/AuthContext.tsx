import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { type UserProfile } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string, userTypeOverride?: 'customer' | 'agent') => Promise<void>;
  register: (
    email: string,
    password: string,
    password2: string,
    firstName: string,
    lastName: string,
    userType: 'customer' | 'agent'
  ) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  user: UserProfile | null;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const navigate = useNavigate();
  console.log();

  const isStaff = typeof user?.user_type_name === 'string' && user.user_type_name.toLowerCase() === 'agent';

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired
          authService.logout();
          setIsAuthenticated(false);
          setUser(null);
          navigate('/login');
        }
      } else {
        // User is not authenticated
        // Only allow these routes for unauthenticated users:
        const publicPaths = ['/', '/login', '/register', '/forgot-password'];
        const path = window.location.pathname;

        if (!publicPaths.some(publicPath => path.startsWith(publicPath))) {
          // Redirect unauthorized access to login page
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const register = async (
    email: string,
    password: string,
    password2: string,
    firstName: string,
    lastName: string,
    userType: 'customer' | 'agent'
  ) => {
    try {
      await authService.register({
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        user_type_name: userType,
      });

      // Auto login after registration
      await login(email, password);

      // Then navigate to profile setup
      navigate('/profile-setup');
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  };


  
  const login = async (email: string, password: string, userTypeOverride?: 'customer' | 'agent') => {
    try {
      await authService.login({ email, password });
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      const normalizedType = (userTypeOverride || userProfile.user_type_name || '').toLowerCase();
      const isCustomer = normalizedType === 'customer';
      if (isCustomer) {
        navigate('/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (error) {
      throw new Error('Login failed');


    }
  };

  const resetPassword = async (_email: string) => {
    try {
      // TODO: Implement password reset functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      return Promise.resolve();
    } catch (error) {
      throw new Error('Password reset failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, resetPassword, user, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
