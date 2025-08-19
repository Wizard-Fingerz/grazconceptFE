import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // If authenticated and on a generic root or dashboard, route based on role
    const isAgent = typeof user?.user_type_name === 'string' && user.user_type_name.toLowerCase() === 'agent';
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      navigate(isAgent ? '/staff/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return isAuthenticated ? <>{children}</> : null;
}; 