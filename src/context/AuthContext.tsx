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
    userType: number,
  ) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  user: UserProfile | null;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): UserProfile | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());

  const navigate = useNavigate();

  const isStaff = typeof user?.user_type_name === 'string' && user.user_type_name.toLowerCase() === 'agent';

  // Only check authentication and load user from localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const path = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password'];
      const isPublicPage = publicPaths.some(publicPath => path.startsWith(publicPath));

      // Don't run auth check on public pages unless there's a token
      if (isPublicPage && !authService.isAuthenticated()) {
        return;
      }

      if (authService.isAuthenticated()) {
        // Try to get user from localStorage first
        let storedUser = getStoredUser();
        if (!storedUser) {
          try {
            // If not in localStorage, fetch from API and store
            storedUser = await authService.getProfile();
            setUser(storedUser);
            localStorage.setItem('user', JSON.stringify(storedUser));
          } catch (error) {
            // Token invalid or expired - clear auth state
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('user');
            if (!isPublicPage) {
              navigate('/login');
            }
            return;
          }
        } else {
          setUser(storedUser);
        }
        setIsAuthenticated(true);

        // If user is authenticated and on a public page, redirect to appropriate dashboard
        if (isPublicPage && path !== '/') {
          const isAgent = storedUser.user_type_name?.toLowerCase() === 'agent';
          navigate(isAgent ? '/staff/dashboard' : '/dashboard');
        }
      } else {
        // User is not authenticated - only redirect if not on a public page
        if (!isPublicPage) {
          navigate('/login');
        }
      }
    };

    checkAuth();
    // eslint-disable-next-line
  }, [navigate]);

  const register = async (
    email: string,
    password: string,
    password2: string,
    firstName: string,
    lastName: string,
    userType: number,
  ) => {
    try {
      // Call registration service and get the response data
      const registrationResponse = await authService.register({
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      });

      // After successful registration, get the user profile and set authentication state
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userProfile));

      // Navigate to the appropriate dashboard based on user_type
      const userTypeName = (registrationResponse.user_type || '').toString().toLowerCase();
      if (userTypeName === 'agent') {
        navigate('/staff/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      // Clear any partial authentication state on registration failure
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
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
      localStorage.setItem('user', JSON.stringify(userProfile));
      const normalizedType = (userTypeOverride || userProfile.user_type_name || '').toLowerCase();
      const isCustomer = normalizedType === 'customer';
      if (isCustomer) {
        navigate('/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (error) {
      // Clear any partial authentication state on login failure
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
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
    localStorage.removeItem('user');
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
