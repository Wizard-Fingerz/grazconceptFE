import React from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { MenuOpen, Menu as MenuIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

// ─── Brand tokens (mirrors Dashboard.tsx) ────────────────────────
const C = {
  brand: '#8b2b8c',
  accent: '#cfa5f2',
  accentLight: '#f0d9fb',
  accentXL: '#f9f0fe',
  red: '#DC2626',
  g50: '#FAFAFA',
  g100: '#F4F4F5',
  g200: '#E4E4E7',
  g400: '#A1A1AA',
  g500: '#71717A',
  g700: '#3F3F46',
  g900: '#18181B',
} as const;

interface NavItem {
  emoji: string;
  label: string;
  to: string;
  badge?: number;
  exact?: boolean; // when true, only mark active on exact path match
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ─── Customer nav ────────────────────────────────────────────────
const customerNav: NavSection[] = [
  {
    label: 'Home',
    items: [
      { emoji: '🏠', label: 'Dashboard', to: '/dashboard' },
      { emoji: '📋', label: 'Track Applications', to: '/track-progress' },
      { emoji: '💳', label: 'Payments & Bills', to: '/services/airtime-and-bills' },
    ],
  },
  {
    label: 'Mobility Hub',
    items: [
      { emoji: '✈️', label: 'Flight & Hotel', to: '/travel/book-flight' },
      { emoji: '📄', label: 'Study Abroad', to: '/travel/study-visa', exact: true },
      { emoji: '🔍', label: 'Search Programs', to: '/travel/study-visa/offers' },
      { emoji: '💼', label: 'Work Abroad', to: '/travel/work-visa' },
      { emoji: '🕌', label: 'Pilgrimage', to: '/travel/pilgrimage' },
      { emoji: '🏖️', label: 'Travel & Vacation', to: '/travel/vacation' },
      { emoji: '🌍', label: 'Citizenship Pathways', to: '/citizenship/investment-plan' },
    ],
  },
  {
    label: 'Financial Hub',
    items: [
      { emoji: '🎓', label: 'Study Loan', to: '/edufinance/study-abroad-loan' },
      { emoji: '🛫', label: 'Travel Now Pay Later', to: '/finance/travel-now-pay-later' },
      { emoji: '💰', label: 'Travel Savings Plan', to: '/dashboard/savings-plan' },
      { emoji: '🤝', label: 'Investment Circle', to: '/finance/investment-circle' },
      { emoji: '💸', label: 'Cross-Border Payments', to: '/finance/cross-border-payments' },
    ],
  },
  {
    label: 'Learning Hub',
    items: [
      { emoji: '💻', label: 'Learn Tech, Work Globally', to: '/learn/tech' },
      { emoji: '🗣️', label: 'Language for Abroad Jobs', to: '/learn/language' },
      { emoji: '🔧', label: 'Vocational Skills', to: '/learn/vocational' },
      { emoji: '🏅', label: 'Certifications & Qualifications', to: '/learn/certifications' },
      { emoji: '📅', label: 'Career Webinars', to: '/learn/webinars' },
    ],
  },
  {
    label: 'Other Hubs',
    items: [
      { emoji: '🎉', label: 'Global Event Services', to: '/hubs/events' },
      { emoji: '📢', label: 'Business Branding', to: '/hubs/branding' },
      { emoji: '📺', label: 'Franchise & Media', to: '/hubs/franchise-media' },
    ],
  },
  {
    label: 'Account',
    items: [
      { emoji: '🎁', label: 'Referrals', to: '/referrals' },
      { emoji: '🔔', label: 'Notifications', to: '/settings/notifications', badge: 0 },
      { emoji: '⚙️', label: 'Settings', to: '/settings/advanced' },
      { emoji: '❓', label: 'Help Centre', to: '/support/tickets' },
    ],
  },
];

// ─── Generic fallback — convert legacy section format ─────────────
function toNavSections(sidebarSections: any[]): NavSection[] {
  return sidebarSections.map(sec => ({
    label: sec.section,
    items: sec.items.map((it: any) => ({
      emoji: '',
      label: it.label,
      to: it.to,
      badge: undefined,
    })),
  }));
}

// ─── Single nav item ──────────────────────────────────────────────
const NavRow = ({
  item, isOpen, isActive, onClick,
}: {
  item: NavItem; isOpen: boolean; isActive: boolean; onClick: () => void;
}) => (
  <Tooltip title={isOpen ? '' : item.label} placement="right" arrow>
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.2,
        px: isOpen ? '22px' : '12px', py: '9px',
        cursor: 'pointer', position: 'relative',
        color: isActive ? C.brand : C.g500,
        fontWeight: isActive ? 600 : 500,
        transition: 'all .15s',
        justifyContent: isOpen ? 'flex-start' : 'center',
        '&:hover': { color: C.g900, bgcolor: C.g50 },
      }}
    >
      {/* Icon wrap */}
      <Box sx={{
        width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, transition: 'all .15s',
        bgcolor: isActive ? C.accentLight : 'transparent',
        '&:hover': { bgcolor: C.g100 },
      }}>
        {item.emoji || '•'}
      </Box>

      {/* Label + badge */}
      {isOpen && (
        <>
          <Typography sx={{
            fontSize: 13, fontWeight: 'inherit', color: 'inherit',
            lineHeight: 1, flex: 1, whiteSpace: 'nowrap',
          }}>
            {item.label}
          </Typography>
          {!!item.badge && (
            <Box sx={{
              bgcolor: C.red, color: '#fff', borderRadius: '20px',
              px: '7px', py: '1px', fontSize: 10, fontWeight: 700,
              minWidth: 20, textAlign: 'center', lineHeight: '16px',
            }}>
              {item.badge}
            </Box>
          )}
        </>
      )}

      {/* Active right-border indicator */}
      {isActive && (
        <Box sx={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 20, bgcolor: C.brand, borderRadius: '2px 0 0 2px',
        }} />
      )}
    </Box>
  </Tooltip>
);

// ─── Props ────────────────────────────────────────────────────────
interface SidebarContentProps {
  isOpen: boolean;
  sidebarSections: any[];
  toggleSidebar?: () => void;
}

// ─── Main component ───────────────────────────────────────────────
const SidebarContent: React.FC<SidebarContentProps> = ({ isOpen, sidebarSections, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect role to pick nav structure
  const role = typeof user?.user_type_name === 'string'
    ? user.user_type_name.trim().toLowerCase()
    : 'customer';

  const navSections: NavSection[] = role === 'customer'
    ? customerNav
    : toNavSections(sidebarSections);

  const isActive = (item: NavItem) =>
    location.pathname === item.to ||
    (!item.exact && location.pathname.startsWith(item.to + '/'));

  return (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: '#fff', borderRight: `1px solid ${C.g200}`,
    }}>

      {/* ── LOGO + TOGGLE ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: isOpen ? '22px' : '12px', pt: '22px', pb: '16px',
        justifyContent: isOpen ? 'flex-start' : 'center',
      }}>
        {isOpen ? (
          <>
            <img src={logo} alt="GrazConcept"
              style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }} />
            <Box sx={{ ml: 0.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.3px', color: C.g900, lineHeight: 1.2 }}>
                GrazConcept
              </Typography>
              <Typography sx={{ fontSize: 10, color: C.g400, fontWeight: 500, mt: 0.2 }}>
                Travel + FinTech
              </Typography>
            </Box>
          </>
        ) : (
          <img src={logo} alt="GrazConcept"
            style={{ width: 38, height: 38, objectFit: 'contain' }} />
        )}
        {toggleSidebar && (
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{ ml: isOpen ? 'auto' : 0, color: C.g400, '&:hover': { color: C.brand } }}
          >
            {isOpen ? <MenuOpen fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* ── USER PILL ── */}
      {user && (
        <Box sx={{
          mx: isOpen ? '22px' : '12px', mb: 2,
          bgcolor: C.accentXL, borderRadius: '10px',
          display: 'flex', alignItems: 'center',
          gap: isOpen ? 1.2 : 0,
          p: isOpen ? '10px 12px' : '8px',
          justifyContent: isOpen ? 'flex-start' : 'center',
          cursor: 'pointer',
        }}
          onClick={() => navigate('/settings/profile')}
        >
          <Avatar
            src={user.profile_picture_url || user.profile_picture}
            sx={{ width: 34, height: 34, bgcolor: C.brand, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
          >
            {(user.first_name?.[0] || 'U').toUpperCase()}
          </Avatar>
          {isOpen && (
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.g900, lineHeight: 1.2 }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Box sx={{
                display: 'inline-block', mt: 0.4, fontSize: 10, fontWeight: 600,
                color: C.brand, bgcolor: C.accentLight,
                borderRadius: '4px', px: '5px', py: '1px',
                textTransform: 'capitalize',
              }}>
                {user.user_type_name || 'Customer'}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ── NAV SECTIONS ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: C.g200, borderRadius: 4 } }}>
        {navSections.map(section => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            {/* Section label (only when expanded) */}
            {isOpen && (
              <Typography sx={{
                px: '22px', pt: '4px', pb: '2px',
                fontSize: 9, fontWeight: 700, color: C.g400,
                letterSpacing: '1.2px', textTransform: 'uppercase',
              }}>
                {section.label}
              </Typography>
            )}

            {/* Items */}
            {section.items.map(item => (
              <NavRow
                key={item.to}
                item={item}
                isOpen={isOpen}
                isActive={isActive(item)}
                onClick={() => navigate(item.to)}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ p: isOpen ? '16px 22px' : '12px', borderTop: `1px solid ${C.g100}` }}>
        {/* Upgrade CTA */}
        {isOpen && (
          <Box
            onClick={() => navigate('/settings/profile')}
            sx={{
              background: `linear-gradient(135deg,${C.brand},${C.accent})`,
              borderRadius: '10px', p: '14px', color: '#fff',
              mb: '14px', cursor: 'pointer',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.3 }}>Upgrade to Gold</Typography>
            <Typography sx={{ fontSize: 10, opacity: .75 }}>Unlock priority visa support & lower fees</Typography>
            <Box
              component="button"
              sx={{
                mt: 1.2, width: '100%', bgcolor: 'rgba(255,255,255,.2)',
                border: 'none', color: '#fff', borderRadius: '6px',
                py: '5px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,.3)' },
              }}
            >
              Learn More
            </Box>
          </Box>
        )}

        {/* Sign out */}
        <Tooltip title={isOpen ? '' : 'Sign Out'} placement="right">
          <Box
            onClick={logout}
            sx={{
              display: 'flex', alignItems: 'center',
              gap: isOpen ? 1 : 0,
              justifyContent: isOpen ? 'flex-start' : 'center',
              color: C.g400, fontSize: 12, cursor: 'pointer', py: '6px',
              borderRadius: '8px', px: 1,
              transition: 'all .15s',
              '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
            }}
          >
            <ExitToAppIcon sx={{ fontSize: 18 }} />
            {isOpen && <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Sign Out</Typography>}
          </Box>
        </Tooltip>

        {/* Copyright */}
        {isOpen && (
          <Typography sx={{ fontSize: 10, color: C.g400, textAlign: 'center', mt: 1.5 }}>
            © GrazConcept {new Date().getFullYear()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SidebarContent;
