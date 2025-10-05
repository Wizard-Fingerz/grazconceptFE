import React, { createContext, useContext, useState /*, useEffect*/ } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { type UserProfile } from '../services/authService';

/**
 * IMPORTANT ANALYSIS:
 * 
 * The checkAuth() function in this file is only run ONCE on mount of the AuthProvider (not on every navigation).
 * This is because the useEffect dependency array is [navigate], which is stable and does not change on route navigation.
 * 
 * Therefore, this file is NOT the cause of the issue where you are redirected to the dashboard on every navigation.
 * 
 * The bug is likely coming from your route configuration (src/routes/index.tsx) or from a custom ProtectedRoute component.
 * 
 * See below for more details after the code.
 */

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
  updateUser: () => Promise<void>;
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

  // Add updateUser function that fetches the latest profile and updates state/localStorage
  const updateUser = async () => {
    try {
      const updatedProfile = await authService.getProfile();
      setUser(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
    } catch (error) {
      // If fetching profile fails, do not update user state
      // Optionally, you could handle token expiration here
    }
  };

  // --- checkAuth logic commented out for now ---
  /*
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

        // Only redirect to dashboard if on a public page and not already on a dashboard
        if (
          isPublicPage &&
          path !== '/' &&
          path !== '/dashboard' &&
          path !== '/staff/dashboard'
        ) {
          const isAgent = storedUser.user_type_name?.toLowerCase() === 'agent';
          const dashboardPath = isAgent ? '/staff/dashboard' : '/dashboard';
          navigate(dashboardPath, { replace: true });
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
  */
  // --- end comment ---

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
      const dashboardPath = userTypeName === 'agent' ? '/staff/dashboard' : '/dashboard';
      navigate(dashboardPath, { replace: true });
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

      // On login, always go to dashboard for that user type
      const normalizedType = (userTypeOverride || userProfile.user_type_name || '').toLowerCase();
      const isCustomer = normalizedType === 'customer';
      const dashboardPath = isCustomer ? '/dashboard' : '/staff/dashboard';
      navigate(dashboardPath, { replace: true });
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
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, resetPassword, user, isStaff, updateUser }}>
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

/**
 * ----
 * 
 * SUMMARY:
 * 
 * - The checkAuth() logic in this file is NOT running on every navigation, only on mount.
 * - The bug you describe (redirecting to dashboard on every navigation) is NOT caused by this file.
 * 
 * ----
 * 
 * WHERE TO CHECK NEXT:
 * 
 * 1. src/routes/index.tsx
 *    - If you have a route like:
 *      { index: true, element: <Navigate to="dashboard" replace /> }
 *      or
 *      { path: 'staff', element: <Navigate to="/staff/dashboard" replace /> }
 *    - If you use <Navigate ... /> in a way that matches more than just the index route, it can cause this bug.
 *    - Make sure you only redirect to dashboard on the index route, not on every child route.
 * 
 * 2. src/pages/auth/ProtectedRoute.tsx
 *    - If you have logic that always redirects to dashboard after checking authentication, that can cause this.
 *    - Your ProtectedRoute should only redirect to /login if not authenticated, NOT to dashboard if already authenticated.
 * 
 * 3. Any custom navigation logic in your layouts (MainLayout, etc) or sidebars.
 * 
 * ----
 * 
 * TL;DR: This file is NOT the cause. Check your route definitions and ProtectedRoute logic.
 */
