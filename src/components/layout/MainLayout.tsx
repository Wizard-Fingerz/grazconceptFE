import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  AppsOutlined as AppsOutlinedIcon,
  Calculate as CalculateIcon,
  Functions as FunctionsIcon,
  Group as GroupIcon,
  Handyman as HandymanIcon,
  Language as LanguageIcon,
  MenuBook as MenuBookIcon,
  Transform as TransformIcon,
  Translate as TranslateIcon,
  AttachMoney as AttachMoneyIcon,
  BusinessCenter as BusinessCenterIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  AssignmentInd as AssignmentIndIcon,
  AccountBalance as AccountBalanceIcon,
  Public as PublicIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  SupportAgent as SupportAgentIcon,
  FlightTakeoff as FlightTakeoffIcon,
  School as SchoolBaseIcon, // renamed to avoid name collision
  SchoolOutlined as SchoolOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
  Groups as GroupsIcon,
  BeachAccess as BeachAccessIcon,
  Hotel as HotelIcon,
  PhoneIphone as PhoneIphoneIcon} from '@mui/icons-material';
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

  // Track previous pathname to detect navigation
  const prevPathname = useRef(location.pathname);

  // When the route changes on mobile, close the drawer
  useEffect(() => {
    if (isMobile && mobileOpen && prevPathname.current !== location.pathname) {
      setMobileOpen(false);
    }
    prevPathname.current = location.pathname;
  }, [location.pathname, isMobile, mobileOpen]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  // Updated customer sidebar: fixed paths and icons
  const sidebarStructureByRole: Record<RoleKey, SidebarSection[]> = useMemo(() => ({
    customer: [
      {
        section: 'Home',
        icon: <HomeIcon />,
        items: [
          { icon: <HomeIcon />, label: 'Dashboard', to: '/dashboard' },
          { icon: <NotificationsIcon />, label: 'Track Application', to: '/track-progress' },
        ]
      },
      {
        section: 'Travel Solution',
        icon: <FlightTakeoffIcon />,
        items: [
          { icon: <SchoolBaseIcon />, label: 'Search Study Program', to: '/travel/study-visa/offers' },
          { icon: <SchoolOutlinedIcon />, label: 'Apply Study Program', to: '/travel/study-visa' },
          { icon: <WorkOutlineIcon />, label: 'Work Visa', to: '/travel/work-visa' },
          { icon: <GroupsIcon />, label: 'Pilgrimage', to: '/travel/pilgrimage' },
          { icon: <BeachAccessIcon />, label: 'Vacation', to: '/travel/vacation' },
          { icon: <HotelIcon />, label: 'Hotel Reservation', to: '/travel/hotel-reservation' },
          { icon: <FlightTakeoffIcon />, label: 'Book Flight', to: '/travel/book-flight' },
        ]
      },
      {
        section: 'Edufinance Solution',
        icon: <AccountBalanceIcon />,
        items: [
          { icon: <AttachMoneyIcon />, label: 'Study Abroad Loan', to: '/edufinance/study-abroad-loan' },
          { icon: <BusinessCenterIcon />, label: 'Civil Servant Loan', to: '/edufinance/civil-servant-loan' },
        ]
      },
      {
        section: 'Citizenship by Investment',
        icon: <EmojiEventsIcon />,
        items: [
          { icon: <PublicIcon />, label: 'Europe Second Citizenship', to: '/citizenship/europe' },
          { icon: <AssignmentIndIcon />, label: 'Investment Plan', to: '/citizenship/investment-plan' },
        ]
      },
      // 🟡 Airtime & Bills Payment
      {
        section: 'Other Services',
        icon: <AppsOutlinedIcon />,
        items: [
          {
            icon: <PhoneIphoneIcon />,
            label: 'Airtime & Bills',
            to: '/services/airtime-and-bills',
            description: 'Buy airtime & pay bills for all networks and services',
          },
          {
            icon: <FlightTakeoffIcon />,
            label: 'Visa & Travel Services',
            to: '/travel/study-visa',
            description: 'Access visa application and travel support',
          },
          {
            icon: <SchoolIcon />,
            label: 'Education Services',
            to: '/services/education-fees',
            description: 'Pay school and exam fees, or explore study support',
          },
        ],
      },

      {
        section: 'Referrals',
        icon: <PeopleIcon />,
        items: [
          { icon: <PeopleIcon />, label: 'My Referrals', to: '/referrals' },
        ]
      },
      {
        section: 'Help Center',
        icon: <SupportAgentIcon />,
        items: [
          { icon: <SupportAgentIcon />, label: 'Support Tickets', to: '/support/tickets' },
          { icon: <SupportAgentIcon />, label: 'Live Chat & Email', to: '/support/chat' },
          { icon: <MenuBookIcon />, label: 'Knowledge Base', to: '/support/kb' },
        ]
      },
      {
        section: 'Account Settings',
        icon: <SettingsIcon />,
        items: [
          { icon: <NotificationsIcon />, label: 'Notifications', to: '/settings/notifications' },
          { icon: <HelpIcon />, label: 'Help & Support', to: '/settings/support' },
          { icon: <SettingsIcon />, label: 'Advanced Settings', to: '/settings/advanced' },
          { icon: <PersonIcon />, label: 'Profile', to: '/settings/profile' },
        ]
      },
    ],

    agent: [
      {
        section: 'Dashboard',
        icon: <AppsOutlinedIcon />,
        items: [
          { icon: <AppsOutlinedIcon />, label: 'Overview', to: '/staff/dashboard' },
          { icon: <FunctionsIcon />, label: 'Performance Analytics', to: '/staff/analytics' },
          { icon: <MenuBookIcon />, label: 'Service Usage Summary', to: '/staff/usage-summary' },
        ]
      },
      {
        section: 'Clients / Leads Manager',
        icon: <GroupIcon />,
        items: [
          { icon: <GroupIcon />, label: 'All Clients', to: '/staff/clients' },
          { icon: <GroupIcon />, label: 'Leads', to: '/staff/leads' },
          { icon: <GroupIcon />, label: 'Add New Client', to: '/staff/clients/new' },
          { icon: <MenuBookIcon />, label: 'Documents', to: '/staff/clients/documents' },
          { icon: <SettingsIcon />, label: 'Assign to Teams', to: '/staff/clients/assign' },
          { icon: <MenuBookIcon />, label: 'Notes & Reminders', to: '/staff/clients/notes' },
          { icon: <LanguageIcon />, label: 'Contact (Email/WhatsApp)', to: '/staff/clients/contact' },
        ]
      },
      {
        section: 'Application Hub',
        icon: <BookIcon />,
        items: [
          { icon: <SchoolIcon />, label: 'Study Abroad', to: '/staff/applications/study' },
          { icon: <TranslateIcon />, label: 'Visa Applications', to: '/staff/applications/visa' },
          { icon: <MenuBookIcon />, label: 'Exam Registrations', to: '/staff/applications/exams' },
          { icon: <MenuBookIcon />, label: 'Car/Gadget/TV Orders', to: '/staff/applications/orders' },
          { icon: <MenuBookIcon />, label: 'Property Interests', to: '/staff/applications/property' },
          { icon: <MenuBookIcon />, label: 'Documents & Legal', to: '/staff/applications/documents' },
        ]
      },
      {
        section: 'Services Control Panel',
        icon: <HandymanIcon />,
        items: [
          { icon: <SchoolIcon />, label: 'Study Abroad', to: '/staff/services/study' },
          { icon: <TranslateIcon />, label: 'Visa Services', to: '/staff/services/visa' },
          { icon: <MenuBookIcon />, label: 'Exam Registration', to: '/staff/services/exams' },
          { icon: <MenuBookIcon />, label: 'Asset Sales', to: '/staff/services/assets' },
          { icon: <MenuBookIcon />, label: 'Property & Real Estate', to: '/staff/services/property' },
          { icon: <LanguageIcon />, label: 'Business & Branding', to: '/staff/services/business' },
          { icon: <MenuBookIcon />, label: 'Legal Documents', to: '/staff/services/legal' },
          { icon: <CalculateIcon />, label: 'Loan & Investment', to: '/staff/services/loans' },
        ]
      },
      {
        section: 'Transactions & Commission',
        icon: <CalculateIcon />,
        items: [
          { icon: <CalculateIcon />, label: 'Payments', to: '/staff/transactions/payments' },
          { icon: <CalculateIcon />, label: 'Commissions', to: '/staff/transactions/commissions' },
          { icon: <CalculateIcon />, label: 'Withdrawals', to: '/staff/transactions/withdrawals' },
          { icon: <MenuBookIcon />, label: 'Invoices & Receipts', to: '/staff/transactions/invoices' },
          { icon: <FunctionsIcon />, label: 'Rewards & Tiers', to: '/staff/transactions/rewards' },
        ]
      },
      {
        section: 'Graz Marketplace',
        icon: <MenuBookIcon />,
        items: [
          { icon: <MenuBookIcon />, label: 'Listings', to: '/staff/marketplace/listings' },
          { icon: <MenuBookIcon />, label: 'Add New Listing', to: '/staff/marketplace/new' },
          { icon: <MenuBookIcon />, label: 'Stock & Availability', to: '/staff/marketplace/stock' },
          { icon: <LanguageIcon />, label: 'Client-Product Chat', to: '/staff/marketplace/chat' },
        ]
      },
      {
        section: 'Training & Resource Center',
        icon: <SchoolIcon />,
        items: [
          { icon: <SchoolIcon />, label: 'Video Tutorials', to: '/staff/training/videos' },
          { icon: <MenuBookIcon />, label: 'Templates', to: '/staff/training/templates' },
          { icon: <MenuBookIcon />, label: 'Digital Catalogs', to: '/staff/training/catalogs' },
          { icon: <MenuBookIcon />, label: 'Sales Scripts', to: '/staff/training/scripts' },
          { icon: <MenuBookIcon />, label: 'Agent Playbook', to: '/staff/training/playbook' },
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
          { icon: <MenuBookIcon />, label: 'Knowledge Base', to: '/staff/support/kb' },
        ]
      },
      {
        section: 'Profile & Settings',
        icon: <SettingsIcon />,
        items: [
          { icon: <SettingsIcon />, label: 'Profile & Company', to: '/staff/settings/profile' },
          { icon: <SettingsIcon />, label: 'KYC', to: '/staff/settings/kyc' },
          { icon: <GroupIcon />, label: 'Staff', to: '/staff/settings/staff' },
          { icon: <NotificationsIcon />, label: 'Notification Preferences', to: '/staff/settings/notifications' },
          { icon: <CalculateIcon />, label: 'Bank Details', to: '/staff/settings/bank' },
          { icon: <FunctionsIcon />, label: 'Upgrade Tier', to: '/staff/settings/upgrade' },
        ]
      },
      {
        section: 'Advanced Features',
        icon: <FunctionsIcon />,
        items: [
          { icon: <FunctionsIcon />, label: 'AI Assistant', to: '/staff/advanced/ai' },
          { icon: <TransformIcon />, label: 'Smart Matching', to: '/staff/advanced/matching' },
          { icon: <LanguageIcon />, label: 'White-Label', to: '/staff/advanced/white-label' },
          { icon: <MenuBookIcon />, label: 'Bulk Data Export', to: '/staff/advanced/export' },
          { icon: <SchoolIcon />, label: 'Training Tracker', to: '/staff/advanced/training-tracker' },
          { icon: <FunctionsIcon />, label: 'Sales Leaderboard', to: '/staff/advanced/leaderboard' },
        ]
      },
    ],
    admin: [
      {
        section: 'Menu',
        icon: <AppsOutlinedIcon />,
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
        if (item.to && location.pathname === item.to) {
          return item.label;
        }
      }
    }
    // If no exact match, try to find a partial match (startsWith)
    for (const section of sections) {
      for (const item of section.items) {
        if (item.to && location.pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    // Fallback: use the first sidebar item label if available
    if (sections.length > 0 && sections[0].items.length > 0) {
      return sections[0].items[0].label;
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