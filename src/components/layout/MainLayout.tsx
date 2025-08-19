import React, { useState, useMemo } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  AppsOutlined,
  Calculate,
  Functions,
  Group,
  Handyman,
  Language,
  MenuBook,
  Transform,
  Translate,
} from '@mui/icons-material';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarContent from '../SideBar/SidebarContent';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

type RoleKey = 'customer' | 'agent' | 'admin';
type SidebarItem = { icon: React.ReactNode; label: string; to: string };
type SidebarSection = { section: string; icon: React.ReactNode; items: SidebarItem[] };

// Helper to normalize user_type_name to a valid role key
function getRoleFromUser(user: any): RoleKey {
  const role = typeof user?.user_type_name === 'string'
    ? user.user_type_name.trim().toLowerCase()
    : '';
  if (role === 'agent') return 'agent';
  if (role === 'admin') return 'admin';
  return 'customer';
}

export const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  // Updated agent sidebar: ensure at least one visible section and items
  const sidebarStructureByRole: Record<RoleKey, SidebarSection[]> = useMemo(() => ({
    customer: [
      {
        section: 'Menu',
        icon: <AppsOutlined />,
        items: [
          { icon: <MenuBook />, label: 'Notebooks', to: '/notebook' },
        ]
      },
      {
        section: 'Tool',
        icon: <Handyman />,
        items: [
          { icon: <Calculate />, label: 'Calculator', to: '/tools/calculator/basic' },
          { icon: <Transform />, label: 'Unit Converter', to: '/tools/converter' },
          { icon: <Language />, label: 'Dictionary & Thesaurus', to: '/tools/dictionary' },
          { icon: <Functions />, label: 'Equation Solver', to: '/tools/equation-solver' },
          { icon: <Translate />, label: 'Translator', to: '/tools/translator' },
        ]
      },
      {
        section: 'Learning Resources',
        icon: <MenuBook />,
        items: [
          { icon: <MenuBook />, label: 'E-books', to: '/resources/ebooks' },
          { icon: <SchoolIcon />, label: 'Tutorials', to: '/resources/tutorials' },
          { icon: <MenuBook />, label: 'Study Guides', to: '/resources/study-guides' },
        ]
      },
      {
        section: 'Settings',
        icon: <SettingsIcon />,
        items: [
          { icon: <NotificationsIcon />, label: 'Notifications', to: '/settings/notifications' },
          { icon: <HelpIcon />, label: 'Help & Support', to: '/settings/support' },
          { icon: <SettingsIcon />, label: 'Advanced Settings', to: '/settings/advanced' },
        ]
      },
    ],

    agent: [
      {
        section: 'Dashboard',
        icon: <AppsOutlined />,
        items: [
          { icon: <AppsOutlined />, label: 'Overview', to: '/staff/dashboard' },
          { icon: <Functions />, label: 'Performance Analytics', to: '/staff/analytics' },
          { icon: <MenuBook />, label: 'Service Usage Summary', to: '/staff/usage-summary' },
        ]
      },
      {
        section: 'Clients / Leads Manager',
        icon: <Group />,
        items: [
          { icon: <Group />, label: 'All Clients', to: '/staff/clients' },
          { icon: <Group />, label: 'Leads', to: '/staff/leads' },
          { icon: <Group />, label: 'Add New Client', to: '/staff/clients/new' },
          { icon: <MenuBook />, label: 'Documents', to: '/staff/clients/documents' },
          { icon: <SettingsIcon />, label: 'Assign to Teams', to: '/staff/clients/assign' },
          { icon: <MenuBook />, label: 'Notes & Reminders', to: '/staff/clients/notes' },
          { icon: <Language />, label: 'Contact (Email/WhatsApp)', to: '/staff/clients/contact' },
        ]
      },
      {
        section: 'Application Hub',
        icon: <BookIcon />,
        items: [
          { icon: <SchoolIcon />, label: 'Study Abroad', to: '/staff/applications/study' },
          { icon: <Translate />, label: 'Visa Applications', to: '/staff/applications/visa' },
          { icon: <MenuBook />, label: 'Exam Registrations', to: '/staff/applications/exams' },
          { icon: <MenuBook />, label: 'Car/Gadget/TV Orders', to: '/staff/applications/orders' },
          { icon: <MenuBook />, label: 'Property Interests', to: '/staff/applications/property' },
          { icon: <MenuBook />, label: 'Documents & Legal', to: '/staff/applications/documents' },
        ]
      },
      {
        section: 'Services Control Panel',
        icon: <Handyman />,
        items: [
          { icon: <SchoolIcon />, label: 'Study Abroad', to: '/staff/services/study' },
          { icon: <Translate />, label: 'Visa Services', to: '/staff/services/visa' },
          { icon: <MenuBook />, label: 'Exam Registration', to: '/staff/services/exams' },
          { icon: <MenuBook />, label: 'Asset Sales', to: '/staff/services/assets' },
          { icon: <MenuBook />, label: 'Property & Real Estate', to: '/staff/services/property' },
          { icon: <Language />, label: 'Business & Branding', to: '/staff/services/business' },
          { icon: <MenuBook />, label: 'Legal Documents', to: '/staff/services/legal' },
          { icon: <Calculate />, label: 'Loan & Investment', to: '/staff/services/loans' },
        ]
      },
      {
        section: 'Transactions & Commission',
        icon: <Calculate />,
        items: [
          { icon: <Calculate />, label: 'Payments', to: '/staff/transactions/payments' },
          { icon: <Calculate />, label: 'Commissions', to: '/staff/transactions/commissions' },
          { icon: <Calculate />, label: 'Withdrawals', to: '/staff/transactions/withdrawals' },
          { icon: <MenuBook />, label: 'Invoices & Receipts', to: '/staff/transactions/invoices' },
          { icon: <Functions />, label: 'Rewards & Tiers', to: '/staff/transactions/rewards' },
        ]
      },
      {
        section: 'Graz Marketplace',
        icon: <MenuBook />,
        items: [
          { icon: <MenuBook />, label: 'Listings', to: '/staff/marketplace/listings' },
          { icon: <MenuBook />, label: 'Add New Listing', to: '/staff/marketplace/new' },
          { icon: <MenuBook />, label: 'Stock & Availability', to: '/staff/marketplace/stock' },
          { icon: <Language />, label: 'Client-Product Chat', to: '/staff/marketplace/chat' },
        ]
      },
      {
        section: 'Training & Resource Center',
        icon: <SchoolIcon />,
        items: [
          { icon: <SchoolIcon />, label: 'Video Tutorials', to: '/staff/training/videos' },
          { icon: <MenuBook />, label: 'Templates', to: '/staff/training/templates' },
          { icon: <MenuBook />, label: 'Digital Catalogs', to: '/staff/training/catalogs' },
          { icon: <MenuBook />, label: 'Sales Scripts', to: '/staff/training/scripts' },
          { icon: <MenuBook />, label: 'Agent Playbook', to: '/staff/training/playbook' },
        ]
      },
      {
        section: 'Notifications & Broadcasts',
        icon: <NotificationsIcon />,
        items: [
          { icon: <NotificationsIcon />, label: 'Visa Alerts & Deadlines', to: '/staff/notifications/alerts' },
          { icon: <NotificationsIcon />, label: 'Broadcasts', to: '/staff/notifications/broadcasts' },
          { icon: <NotificationsIcon />, label: 'Campaigns', to: '/staff/notifications/campaigns' },
          { icon: <NotificationsIcon />, label: 'Badges', to: '/staff/notifications/badges' },
        ]
      },
      {
        section: 'Support / Helpdesk',
        icon: <HelpIcon />,
        items: [
          { icon: <HelpIcon />, label: 'Support Tickets', to: '/staff/support/tickets' },
          { icon: <HelpIcon />, label: 'Live Chat & Email', to: '/staff/support/chat' },
          { icon: <MenuBook />, label: 'Knowledge Base', to: '/staff/support/kb' },
        ]
      },
      {
        section: 'Profile & Settings',
        icon: <SettingsIcon />,
        items: [
          { icon: <SettingsIcon />, label: 'Profile & Company', to: '/staff/settings/profile' },
          { icon: <SettingsIcon />, label: 'KYC', to: '/staff/settings/kyc' },
          { icon: <Group />, label: 'Staff', to: '/staff/settings/staff' },
          { icon: <NotificationsIcon />, label: 'Notification Preferences', to: '/staff/settings/notifications' },
          { icon: <Calculate />, label: 'Bank Details', to: '/staff/settings/bank' },
          { icon: <Functions />, label: 'Upgrade Tier', to: '/staff/settings/upgrade' },
        ]
      },
      {
        section: 'Advanced Features',
        icon: <Functions />,
        items: [
          { icon: <Functions />, label: 'AI Assistant', to: '/staff/advanced/ai' },
          { icon: <Transform />, label: 'Smart Matching', to: '/staff/advanced/matching' },
          { icon: <Language />, label: 'White-Label', to: '/staff/advanced/white-label' },
          { icon: <MenuBook />, label: 'Bulk Data Export', to: '/staff/advanced/export' },
          { icon: <SchoolIcon />, label: 'Training Tracker', to: '/staff/advanced/training-tracker' },
          { icon: <Functions />, label: 'Sales Leaderboard', to: '/staff/advanced/leaderboard' },
        ]
      },
    ],
    admin: [
      {
        section: 'Menu',
        icon: <AppsOutlined />,
        items: [
          { icon: <SettingsIcon />, label: 'Settings', to: '/admin/settings' },
        ]
      }
    ],
   
  }), []);

  // Use helper to get normalized role
  const role: RoleKey = getRoleFromUser(user);

  // Find the current title based on the current path
  const currentTitle = useMemo(() => {
    const sections = sidebarStructureByRole[role] || [];
    for (const section of sections) {
      for (const item of section.items) {
        if (item.to && location.pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  }, [location.pathname, role, sidebarStructureByRole]);

  // Always pass a fresh array to SidebarContent to avoid stale props
  const drawer = (
    <SidebarContent
      isOpen={open}
      sidebarSections={sidebarStructureByRole[role] || []}
      toggleSidebar={handleDrawerToggle}
    />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedDrawerWidth}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
            {currentTitle}
          </Typography>

          <Stack direction="row" spacing={1}>
            <IconButton sx={{ bgcolor: theme.palette.background.paper }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton sx={{ bgcolor: theme.palette.background.paper }}>
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : collapsedDrawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : collapsedDrawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: theme.shadows[3],
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        sx={{
          flex: 1,
          p: 0,
          m: 0,
          mt: 10,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: {
            xs: '100vw',
            sm: open ? `calc(97vw - ${drawerWidth}px)` : `calc(97vw - ${collapsedDrawerWidth}px)`
          },
          ml: { sm: open ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`, xs: 0 },
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};