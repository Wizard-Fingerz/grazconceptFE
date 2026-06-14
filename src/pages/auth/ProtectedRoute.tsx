import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Brand tokens ─────────────────────────────────────────────────
const C = {
  brand:    '#6D28D9',
  accent:   '#8B5CF6',
  accentXL: '#F5F3FF',
  g50:      '#FAFAFA',
  g100:     '#F4F4F5',
  g200:     '#E4E4E7',
  g400:     '#A1A1AA',
  g500:     '#71717A',
  g700:     '#3F3F46',
  g900:     '#18181B',
};

// ─── Shared error page layout ─────────────────────────────────────
interface ErrorPageProps {
  code?: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  actions: React.ReactNode;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, subtitle, illustration, actions }) => (
  <div style={{
    minHeight: '100vh',
    background: C.g50,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  }}>
    {/* Top nav bar */}
    <nav style={{
      height: 64,
      background: '#fff',
      borderBottom: `1px solid ${C.g200}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: C.brand,
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 16, color: '#fff',
          boxShadow: '0 3px 10px rgba(109,40,217,.25)',
        }}>G</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.3px', color: C.g900, lineHeight: 1.2 }}>
            GrazConcept
          </div>
          <div style={{ fontSize: 10, color: C.g400, fontWeight: 500 }}>Travel + FinTech</div>
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        <a href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: C.g500, textDecoration: 'none' }}>
          Dashboard
        </a>
        <a href="/support/tickets" style={{ fontSize: 13, fontWeight: 600, color: C.g500, textDecoration: 'none' }}>
          Support
        </a>
      </div>
    </nav>

    {/* Main content */}
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: '#fff',
        borderRadius: 20,
        border: `1px solid ${C.g200}`,
        boxShadow: '0 4px 24px rgba(0,0,0,.07)',
        padding: '48px 40px',
        textAlign: 'center',
      }}>

        {/* Illustration */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          {illustration}
        </div>

        {/* Error code badge */}
        {code && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.accentXL, color: C.brand,
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, fontWeight: 700, letterSpacing: .5,
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, background: C.brand, borderRadius: '50%', display: 'inline-block' }} />
            {code}
          </div>
        )}

        <h1 style={{
          fontSize: 24, fontWeight: 800, color: C.g900,
          letterSpacing: '-.5px', margin: '0 0 12px',
          lineHeight: 1.25,
        }}>
          {title}
        </h1>

        <p style={{
          fontSize: 14, color: C.g500, lineHeight: 1.7,
          margin: '0 0 36px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {subtitle}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {actions}
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer style={{
      padding: '20px 32px',
      borderTop: `1px solid ${C.g200}`,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      flexWrap: 'wrap',
    }}>
      {['Help Centre', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(link => (
        <a key={link} href="/support/tickets" style={{
          fontSize: 12, color: C.g400, textDecoration: 'none', fontWeight: 500,
        }}>
          {link}
        </a>
      ))}
      <span style={{ fontSize: 12, color: C.g400 }}>
        © {new Date().getFullYear()} GrazConcept
      </span>
    </footer>
  </div>
);

// ─── Reusable button primitives ────────────────────────────────────
const PrimaryBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', padding: '13px 24px',
      background: C.brand, color: '#fff', border: 'none',
      borderRadius: 10, fontSize: 14, fontWeight: 700,
      cursor: 'pointer', transition: 'all .15s',
      boxShadow: '0 3px 12px rgba(109,40,217,.3)',
      letterSpacing: '-.1px',
    }}
    onMouseOver={e => (e.currentTarget.style.background = C.accent)}
    onMouseOut={e => (e.currentTarget.style.background = C.brand)}
  >
    {label}
  </button>
);

const SecondaryBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', padding: '13px 24px',
      background: '#fff', color: C.g700,
      border: `1.5px solid ${C.g200}`,
      borderRadius: 10, fontSize: 14, fontWeight: 600,
      cursor: 'pointer', transition: 'all .15s',
      letterSpacing: '-.1px',
    }}
    onMouseOver={e => {
      e.currentTarget.style.borderColor = C.brand;
      e.currentTarget.style.color = C.brand;
    }}
    onMouseOut={e => {
      e.currentTarget.style.borderColor = C.g200;
      e.currentTarget.style.color = C.g700;
    }}
  >
    {label}
  </button>
);

// ─── SVG Illustration: broken connection ───────────────────────────
const BrokenConnectionIllustration = () => (
  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Globe */}
    <circle cx="80" cy="56" r="38" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2" />
    <ellipse cx="80" cy="56" rx="18" ry="38" fill="none" stroke="#C4B5FD" strokeWidth="1.5" />
    <line x1="42" y1="56" x2="118" y2="56" stroke="#C4B5FD" strokeWidth="1.5" />
    <line x1="46" y1="40" x2="114" y2="40" stroke="#C4B5FD" strokeWidth="1.2" />
    <line x1="46" y1="72" x2="114" y2="72" stroke="#C4B5FD" strokeWidth="1.2" />
    {/* Broken plug left */}
    <rect x="14" y="48" width="24" height="16" rx="4" fill="#E4E4E7" />
    <rect x="19" y="44" width="4" height="6" rx="2" fill="#A1A1AA" />
    <rect x="27" y="44" width="4" height="6" rx="2" fill="#A1A1AA" />
    <line x1="38" y1="56" x2="43" y2="56" stroke="#A1A1AA" strokeWidth="2" />
    {/* Break gap */}
    <line x1="44" y1="52" x2="50" y2="60" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="52" x2="44" y2="60" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    {/* Broken plug right */}
    <rect x="122" y="48" width="24" height="16" rx="4" fill="#E4E4E7" />
    <rect x="127" y="44" width="4" height="6" rx="2" fill="#A1A1AA" />
    <rect x="135" y="44" width="4" height="6" rx="2" fill="#A1A1AA" />
    <line x1="122" y1="56" x2="117" y2="56" stroke="#A1A1AA" strokeWidth="2" />
    {/* Exclamation on globe */}
    <circle cx="80" cy="56" r="9" fill="#6D28D9" />
    <rect x="79" y="50" width="2" height="7" rx="1" fill="#fff" />
    <circle cx="80" cy="60" r="1.2" fill="#fff" />
  </svg>
);

// ─── SVG Illustration: auth / lock ───────────────────────────────
const AuthErrorIllustration = () => (
  <svg width="140" height="120" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield body */}
    <path d="M70 12 L106 28 L106 62 C106 84 70 104 70 104 C70 104 34 84 34 62 L34 28 Z"
      fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round" />
    {/* Lock icon */}
    <rect x="56" y="56" width="28" height="22" rx="4" fill="#6D28D9" />
    <path d="M62 56 L62 50 C62 44 78 44 78 50 L78 56" stroke="#6D28D9" strokeWidth="3"
      strokeLinecap="round" fill="none" />
    <circle cx="70" cy="67" r="3.5" fill="#fff" />
    <rect x="69" y="67" width="2" height="5" rx="1" fill="#fff" />
    {/* Badge X */}
    <circle cx="96" cy="28" r="12" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" />
    <line x1="91" y1="23" x2="101" y2="33" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="101" y1="23" x2="91" y2="33" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Error Boundary (catches render errors) ───────────────────────
class ProtectedRouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(_error: any, _errorInfo: any) {
    // TODO: send to error reporting service (e.g. Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="Page Error"
          title="Something went wrong"
          subtitle="We hit an unexpected snag loading this page. This is on our end, not yours. Try refreshing — it usually works. If the problem keeps coming back, our support team is standing by."
          illustration={<BrokenConnectionIllustration />}
          actions={
            <>
              <PrimaryBtn label="↺  Refresh Page" onClick={() => window.location.reload()} />
              <SecondaryBtn
                label="Contact Support"
                onClick={() => {
                  window.location.href =
                    'mailto:support@grazconcept.com?subject=Page%20Error%20Report';
                }}
              />
            </>
          }
        />
      );
    }
    return this.props.children;
  }
}

// ─── ProtectedRoute ───────────────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  let isAuthenticated = false;
  const navigate = useNavigate();
  const location = useLocation();

  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch {
    // Auth context not found — show auth error page
    return (
      <ErrorPage
        code="Auth Error"
        title="Authentication required"
        subtitle="This page is protected and your session couldn't be verified. Please sign in again to continue. If you keep seeing this, your session may have expired."
        illustration={<AuthErrorIllustration />}
        actions={
          <>
            <PrimaryBtn
              label="Go to Sign In"
              onClick={() => navigate('/login', { replace: true, state: { from: location } })}
            />
            <SecondaryBtn
              label="Contact Support"
              onClick={() => {
                window.location.href =
                  'mailto:support@grazconcept.com?subject=Authentication%20Error';
              }}
            />
          </>
        }
      />
    );
  }

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? (
    <ProtectedRouteErrorBoundary>{children}</ProtectedRouteErrorBoundary>
  ) : null;
};
