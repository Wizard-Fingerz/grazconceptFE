import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Simple error boundary for this component
class ProtectedRouteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }
  componentDidCatch(_error: any, _errorInfo: any) {
    // You can log error to an error reporting service here
  }
  handleRefresh = () => {
    window.location.reload();
  };
  handleContactSupport = () => {
    window.location.href = 'mailto:support@grazconcept.com?subject=Protected%20Route%20Error';
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#b71c1c' }}>
          <h2>Something went wrong.</h2>
          <p>
            An error occurred while loading this page. Please try refreshing, or contact support if the problem persists.
          </p>
          <div style={{ marginTop: 24 }}>
            <button
              style={{
                marginRight: 12,
                padding: '8px 20px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 16,
              }}
              onClick={this.handleRefresh}
            >
              Refresh Page
            </button>
            <button
              style={{
                padding: '8px 20px',
                background: '#b71c1c',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 16,
              }}
              onClick={this.handleContactSupport}
            >
              Contact Support
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  let isAuthenticated: boolean = false;
  const navigate = useNavigate();
  const location = useLocation();

  // Defensive: Catch error if useAuth is called outside AuthProvider
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch (e) {
    // Show a fallback error UI
    const handleGoToLogin = () => {
      navigate('/login', { replace: true, state: { from: location } });
    };
    const handleContactSupport = () => {
      window.location.href = 'mailto:support@grazconcept.com?subject=Authentication%20Error';
    };
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#b71c1c' }}>
        <h2>Authentication Error</h2>
        <p>
          This page requires authentication, but the authentication context was not found.<br />
          Please ensure you are logged in and try again.
        </p>
        <div style={{ marginTop: 24 }}>
          <button
            style={{
              marginRight: 12,
              padding: '8px 20px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={handleGoToLogin}
          >
            Go to Login
          </button>
          <button
            style={{
              padding: '8px 20px',
              background: '#b71c1c',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={handleContactSupport}
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Only redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
    // No dashboard redirect logic here; let the route config handle it
  }, [isAuthenticated, navigate]);

  // Only render children if authenticated, and wrap in error boundary
  return isAuthenticated ? (
    <ProtectedRouteErrorBoundary>
      {children}
    </ProtectedRouteErrorBoundary>
  ) : null;
};