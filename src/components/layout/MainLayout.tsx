import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
} from "@mui/material";
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
  PhoneIphone as PhoneIphoneIcon,
  TravelExplore,
  AttachMoney,
  MoneyRounded,
  Work,
  CastForEducation,
  ModeOfTravel,
  PaymentSharp,
  LinkRounded,
  SellSharp,
  BookSharp,
  ProductionQuantityLimitsSharp,
  LiveTv,
  Label,
  Error as ErrorIcon,
  Info as InfoIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SidebarContent from "../SideBar/SidebarContent";
import {
  subscribeToNotifications,
  requestUserNotifications
} from "../../services/notificationServices";

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

type RoleKey = "customer" | "agent" | "admin";
type SidebarItem = { icon: React.ReactNode; label: string; to: string };
type SidebarSection = {
  section: string;
  icon: React.ReactNode;
  items: SidebarItem[];
};

type Notification = {
  id: string | number;
  type: string;
  message: string;
  read: boolean;
  time?: string;
  [key: string]: any;
};

// Helper to normalize user_type_name to a valid role key
function getRoleFromUser(user: any): RoleKey {
  const role =
    typeof user?.user_type_name === "string"
      ? user.user_type_name.trim().toLowerCase()
      : "";
  if (role === "agent") return "agent";
  if (role === "admin") return "admin";
  return "customer";
}

// Simple time formatting for notifications (optional utility)
function formatNotificationTime(ts?: string | number | Date) {
  if (!ts) return "";
  const date =
    typeof ts === "object"
      ? ts
      : typeof ts === "number"
      ? new Date(ts)
      : new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 24 * 3600) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Notification State
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Track unread notifications: either a boolean 'read' field or fallback to all as unread
  const unreadCount = notifications.filter((n) => !n.read).length;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  // Notification handlers
  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    // Explicitly request notifications every time the menu opens
    requestUserNotifications();
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  // Track ref to latest notifications to preserve unread state on repeat requests
  const notificationsRef = useRef<Notification[]>([]);
  useEffect(() => { notificationsRef.current = notifications }, [notifications]);

  // Notifications WebSocket subscription
  useEffect(() => {
    let isMounted = true;

    // Handle incoming notification WebSocket data, supports backend structure: {notifications: [...]}
    const MAX_MESSAGE_LENGTH = 30; // Or adjust as needed

    const truncateMessage = (msg?: string) => {
      if (typeof msg !== "string") return msg;
      return msg.length > MAX_MESSAGE_LENGTH
        ? msg.slice(0, MAX_MESSAGE_LENGTH) + "..."
        : msg;
    };

    const onNotification = (data: any) => {
      if (!isMounted) return;

      // If the server sends the new API structure: { notifications: [...] }
      let notificationsArr: any[] | null = null;
      if (Array.isArray(data)) {
        notificationsArr = data;
      } else if (
        typeof data === "object" &&
        data !== null &&
        Array.isArray(data.notifications)
      ) {
        notificationsArr = data.notifications;
      }

      if (notificationsArr) {
        // Use new structure for each notification, with message truncation
        const normalized = notificationsArr
          .map((n, idx) => ({
            ...n,
            message: truncateMessage(n.message),
            id: n.id ?? n.pk ?? n._id ?? (n.message ? truncateMessage(n.message) + (n.time ?? idx) : idx),
            type: n.notification_type || n.type || "info",
            read: "read" in n ? !!n.read : ("is_read" in n ? !!n.is_read : false),
            time: n.time || n.created_at || n.timestamp || n.updated_at,
            title: n.title, // allow for explicit title property if available
          }))
          .reverse();

        // If all IDs in normalized already exist, don't update
        const incomingIds = new Set(normalized.map(n => n.id));
        const existingIds = new Set(notificationsRef.current.map(n => n.id));
        const hasNew = [...incomingIds].some(id => !existingIds.has(id));
        if (hasNew || notificationsRef.current.length !== normalized.length) {
          setNotifications(normalized);
        }
      } else if (typeof data === "object" && data !== null) {
        // Single notification, as either a fresh push or legacy, with truncation
        setNotifications((prev) => {
          const id =
            data.id ??
            data.pk ??
            data._id ??
            (data.message ? truncateMessage(data.message) + (data.time ?? Date.now()) : Date.now());
          if (prev.length > 0 && prev[0].id === id) return prev;
          return [
            {
              ...data,
              message: truncateMessage(data.message),
              id,
              type: data.notification_type || data.type || "info",
              read: "read" in data
                ? !!data.read
                : ("is_read" in data ? !!data.is_read : false),
              time: data.time || data.created_at || data.timestamp || data.updated_at,
              title: data.title,
            },
            ...prev,
          ];
        });
      }
    };


    const unsubscribe = subscribeToNotifications(onNotification);
    // Request notifications on mount as additional safety
    requestUserNotifications();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  // Updated customer sidebar: fixed paths and icons
  const sidebarStructureByRole: Record<RoleKey, SidebarSection[]> = useMemo(
    () => ({
      customer: [
        {
          section: "Home",
          icon: <HomeIcon />,
          items: [
            { icon: <HomeIcon />, label: "Dashboard", to: "/dashboard" },
            {
              icon: <NotificationsIcon />,
              label: "Track Application",
              to: "/track-progress",
            },
          ],
        },
        {
          section: "Travel Solution",
          icon: <FlightTakeoffIcon />,
          items: [
            {
              icon: <SchoolBaseIcon />,
              label: "Search Study Program",
              to: "/travel/study-visa/offers",
            },
            {
              icon: <SchoolOutlinedIcon />,
              label: "Apply Study Program",
              to: "/travel/study-visa",
            },
            {
              icon: <WorkOutlineIcon />,
              label: "Work Visa",
              to: "/travel/work-visa",
            },
            {
              icon: <GroupsIcon />,
              label: "Pilgrimage",
              to: "/travel/pilgrimage",
            },
            {
              icon: <BeachAccessIcon />,
              label: "Vacation",
              to: "/travel/vacation",
            },
            {
              icon: <HotelIcon />,
              label: "Hotel Reservation",
              to: "/travel/hotel-reservation",
            },
            {
              icon: <FlightTakeoffIcon />,
              label: "Book Flight",
              to: "/travel/book-flight",
            },
          ],
        },
        {
          section: "Edufinance Solution",
          icon: <AccountBalanceIcon />,
          items: [
            {
              icon: <AttachMoneyIcon />,
              label: "Study Abroad Loan",
              to: "/edufinance/study-abroad-loan",
            },
            {
              icon: <BusinessCenterIcon />,
              label: "Civil Servant Loan",
              to: "/edufinance/civil-servant-loan",
            },
          ],
        },
        {
          section: "Citizenship by Investment",
          icon: <EmojiEventsIcon />,
          items: [
            {
              icon: <PublicIcon />,
              label: "Europe Second Citizenship",
              to: "/citizenship/europe",
            },
            {
              icon: <AssignmentIndIcon />,
              label: "Investment Plan",
              to: "/citizenship/investment-plan",
            },
          ],
        },
        // 🟡 Airtime & Bills Payment
        {
          section: "Other Services",
          icon: <AppsOutlinedIcon />,
          items: [
            {
              icon: <PhoneIphoneIcon />,
              label: "Airtime & Bills",
              to: "/services/airtime-and-bills",
              description:
                "Buy airtime & pay bills for all networks and services",
            },
            {
              icon: <FlightTakeoffIcon />,
              label: "Visa & Travel Services",
              to: "/services/visa-and-travel",
              description: "Access visa application and travel support",
            },
            {
              icon: <SchoolIcon />,
              label: "Education Services",
              to: "/services/education-services",
              description: "Pay school and exam fees, or explore study support",
            },
          ],
        },

        {
          section: "Referrals",
          icon: <PeopleIcon />,
          items: [
            { icon: <PeopleIcon />, label: "My Referrals", to: "/referrals" },
          ],
        },
        {
          section: "Help Center",
          icon: <SupportAgentIcon />,
          items: [
            {
              icon: <SupportAgentIcon />,
              label: "Support Tickets",
              to: "/support/tickets",
            },
            // {
            //   icon: <SupportAgentIcon />,
            //   label: "Live Chat & Email",
            //   to: "/support/chat",
            // },
            {
              icon: <MenuBookIcon />,
              label: "Knowledge Base",
              to: "/support/kb",
            },
          ],
        },
        {
          section: "Account Settings",
          icon: <SettingsIcon />,
          items: [
            {
              icon: <NotificationsIcon />,
              label: "Notifications",
              to: "/settings/notifications",
            },
            // {
            //   icon: <HelpIcon />,
            //   label: "Help & Support",
            //   to: "/settings/support",
            // },
            {
              icon: <SettingsIcon />,
              label: "Advanced Settings",
              to: "/settings/advanced",
            },
            { icon: <PersonIcon />, label: "Profile", to: "/settings/profile" },
          ],
        },
      ],

      agent: [
        {
          section: "Dashboard",
          icon: <AppsOutlinedIcon />,
          items: [
            {
              icon: <AppsOutlinedIcon />,
              label: "Overview",
              to: "/staff/dashboard",
            },
            {
              icon: <FunctionsIcon />,
              label: "Performance Analytics",
              to: "/staff/analytics",
            },
            {
              icon: <MenuBookIcon />,
              label: "Service Usage Summary",
              to: "/staff/usage-summary",
            },
          ],
        },
        {
          section: "Clients / Leads Manager",
          icon: <GroupIcon />,
          items: [
            { icon: <GroupIcon />, label: "All Clients", to: "/staff/clients" },
            { icon: <GroupIcon />, label: "Leads", to: "/staff/leads" },
            {
              icon: <GroupIcon />,
              label: "Add New Client",
              to: "/staff/clients/new",
            },
            {
              icon: <MenuBookIcon />,
              label: "Documents",
              to: "/staff/clients/documents",
            },
            {
              icon: <SettingsIcon />,
              label: "Assign to Teams",
              to: "/staff/clients/assign",
            },
            {
              icon: <MenuBookIcon />,
              label: "Notes & Reminders",
              to: "/staff/clients/notes",
            },
            {
              icon: <LanguageIcon />,
              label: "Contact (Email/WhatsApp)",
              to: "/staff/clients/contact",
            },
          ],
        },
        {
          section: "Application Hub",
          icon: <BookIcon />,
          items: [
            {
              icon: <SchoolIcon />,
              label: "Study Abroad",
              to: "/staff/applications/study",
            },
            {
              icon: <TranslateIcon />,
              label: "Visa Applications",
              to: "/staff/applications/visa",
            },
            {
              icon: <MenuBookIcon />,
              label: "Exam Registrations",
              to: "/staff/applications/exams",
            },
            {
              icon: <MenuBookIcon />,
              label: "Car/Gadget/TV Orders",
              to: "/staff/applications/orders",
            },
            {
              icon: <MenuBookIcon />,
              label: "Property Interests",
              to: "/staff/applications/property",
            },
            {
              icon: <MenuBookIcon />,
              label: "Documents & Legal",
              to: "/staff/applications/documents",
            },
          ],
        },
        {
          section: "Services Control Panel",
          icon: <HandymanIcon />,
          items: [
            {
              icon: <SchoolIcon />,
              label: "Study Abroad",
              to: "/staff/services/study",
            },
            {
              icon: <TranslateIcon />,
              label: "Visa Services",
              to: "/staff/services/visa",
            },
            {
              icon: <MenuBookIcon />,
              label: "Exam Registration",
              to: "/staff/services/exams",
            },
            {
              icon: <MenuBookIcon />,
              label: "Asset Sales",
              to: "/staff/services/assets",
            },
            {
              icon: <MenuBookIcon />,
              label: "Property & Real Estate",
              to: "/staff/services/property",
            },
            {
              icon: <LanguageIcon />,
              label: "Business & Branding",
              to: "/staff/services/business",
            },
            {
              icon: <MenuBookIcon />,
              label: "Legal Documents",
              to: "/staff/services/legal",
            },
            {
              icon: <CalculateIcon />,
              label: "Loan & Investment",
              to: "/staff/services/loans",
            },
          ],
        },

        {
          section: "Transactions & Commission",
          icon: <CalculateIcon />,
          items: [
            {
              icon: <CalculateIcon />,
              label: "Payments",
              to: "/staff/transactions/payments",
            },
            {
              icon: <CalculateIcon />,
              label: "Commissions",
              to: "/staff/transactions/commissions",
            },
            {
              icon: <CalculateIcon />,
              label: "Withdrawals",
              to: "/staff/transactions/withdrawals",
            },
            {
              icon: <MenuBookIcon />,
              label: "Invoices & Receipts",
              to: "/staff/transactions/invoices",
            },
            {
              icon: <FunctionsIcon />,
              label: "Rewards & Tiers",
              to: "/staff/transactions/rewards",
            },
          ],
        },
        {
          section: "Graz Marketplace",
          icon: <MenuBookIcon />,
          items: [
            {
              icon: <MenuBookIcon />,
              label: "Listings",
              to: "/staff/marketplace/listings",
            },
            {
              icon: <MenuBookIcon />,
              label: "Add New Listing",
              to: "/staff/marketplace/new",
            },
            {
              icon: <MenuBookIcon />,
              label: "Stock & Availability",
              to: "/staff/marketplace/stock",
            },
            {
              icon: <LanguageIcon />,
              label: "Client-Product Chat",
              to: "/staff/marketplace/chat",
            },
            {
              icon: <TravelExplore />,
              label: "Travel & Tour Solutions",
              to: "/staff/transactions/rewards",
            },
            {
              icon: <AttachMoney />,
              label: " Citizenship by Investment (CBI)",
              to: "/staff/marketplace/cbi",
            },
            {
              icon: <MoneyRounded />,
              label: " EduFinance / Civil Servant Loan",
              to: "/staff/marketplace/edufinaceandloan",
            },
            {
              icon: <Work />,
              label: " Work Abroad Program",
              to: "/staff/transactions/rewards",
            },
            {
              icon: <CastForEducation />,
              label: " Study Abroad Application",
              to: "/staff/transactions/rewards",
            },
            {
              icon: <ModeOfTravel />,
              label: " Excursion & Vacation Packages",
              to: "/staff/transactions/rewards",
            },
            {
              icon: <PaymentSharp />,
              label: " Airtime & Bill Payment",
              to: "/staff/transactions/rewards",
            },
            {
              icon: <LinkRounded />,
              label: " Connect Services (Artisan / Business Linkage)",
              to: "/staff/transactions/rewards",
            },
          ],
        },

        // 🔹 Onboarding & Orientation Videos
        // 🔹 Product Training Materials
        // 🔹 Marketing Resources & Flyers
        // 🔹 Webinar / Live Session Access
        // 🔹 Certificate of Completion

        {
          section: "Training & Resource Center",
          icon: <SchoolIcon />,
          items: [
            {
              icon: <SchoolIcon />,
              label: "Video Tutorials",
              to: "/staff/training/videos",
            },
            {
              icon: <MenuBookIcon />,
              label: "Templates",
              to: "/staff/training/templates",
            },
            {
              icon: <MenuBookIcon />,
              label: "Digital Catalogs",
              to: "/staff/training/catalogs",
            },
            {
              icon: <SellSharp />,
              label: "Sales Scripts",
              to: "/staff/training/scripts",
            },
            {
              icon: <BookSharp />,
              label: "Agent Playbook",
              to: "/staff/training/playbook",
            },
            {
              icon: <ProductionQuantityLimitsSharp />,
              label: "Product Training Materials",
              to: "/staff/training/playbook",
            },
            {
              icon: <MenuBookIcon />,
              label: "Marketing Resources & Flyers",
              to: "/staff/training/playbook",
            },
            {
              icon: <LiveTv />,
              label: "Webinar / Live Session Access",
              to: "/staff/training/playbook",
            },
            {
              icon: <Label />,
              label: "Certificate of Completion",
              to: "/staff/training/playbook",
            },
          ],
        },

        //         🔹 General Announcements
        // 🔹 New Service Alerts
        // 🔹 Promo & Bonus Notifications
        // 🔹 System Maintenance Notices
        // 🔹 Past Broadcast Archive
        {
          section: "Notifications & Broadcasts",
          icon: <NotificationsIcon />,
          items: [
            {
              icon: <NotificationsIcon />,
              label: "General Announcements",
              to: "/staff/notifications/alerts",
            },
            {
              icon: <NotificationsIcon />,
              label: "New Service Alerts",
              to: "/staff/notifications/alerts",
            },
            {
              icon: <NotificationsIcon />,
              label: "Visa Alerts & Deadlines",
              to: "/staff/notifications/alerts",
            },
            {
              icon: <NotificationsIcon />,
              label: "Broadcasts",
              to: "/staff/notifications/broadcasts",
            },
            {
              icon: <NotificationsIcon />,
              label: "Promo & Bonus Notifications",
              to: "/staff/notifications/broadcasts",
            },
            {
              icon: <NotificationsIcon />,
              label: "System Maintenance Notices",
              to: "/staff/notifications/broadcasts",
            },

            {
              icon: <NotificationsIcon />,
              label: "Campaigns",
              to: "/staff/notifications/campaigns",
            },
            {
              icon: <NotificationsIcon />,
              label: "Badges",
              to: "/staff/notifications/badges",
            },
            {
              icon: <NotificationsIcon />,
              label: "Past Broadcast Archive",
              to: "/staff/notifications/broadcasts",
            },
          ],
        },

        //         🔹 Submit Support Ticket
        // 🔹 Live Chat / WhatsApp Support
        // 🔹 Frequently Asked Questions (FAQs)
        // 🔹 Feedback & Complaint Form
        // 🔹 Help Articles & Guides
        {
          section: "Support / Helpdesk",
          icon: <HelpIcon />,
          items: [
            {
              icon: <HelpIcon />,
              label: "Support Tickets",
              to: "/staff/support/tickets",
            },
            {
              icon: <HelpIcon />,
              label: "Live Chat & WhatsApp Support",
              to: "/staff/support/chat",
            },
            {
              icon: <MenuBookIcon />,
              label: "Knowledge Base",
              to: "/staff/support/kb",
            },
            {
              icon: <MenuBookIcon />,
              label: "Feedback & Complaint Form",
              to: "/staff/support/kb",
            },
            {
              icon: <MenuBookIcon />,
              label: "Help Articles & Guides",
              to: "/staff/support/kb",
            },
            {
              icon: <MenuBookIcon />,
              label: "Frequently Asked Questions (FAQs)",
              to: "/staff/support/FAQ",
            },
          ],
        },
        //         🔹 Edit Personal Information
        // 🔹 Upload CAC / ID Documents
        // 🔹 Bank Details Setup
        // 🔹 Change Password / PIN
        // 🔹 2FA & OTP Security
        {
          section: "Profile & Settings",
          icon: <SettingsIcon />,
          items: [
            {
              icon: <SettingsIcon />,
              label: "Profile & Company",
              to: "/staff/settings/profile",
            },
            {
              icon: <SettingsIcon />,
              label: "Edit Personal Information",
              to: "/staff/settings/kyc",
            },
            { icon: <SettingsIcon />, label: "KYC", to: "/staff/settings/kyc" },
            {
              icon: <GroupIcon />,
              label: "Upload CAC / ID Documents",
              to: "/staff/settings/staff",
            },
            {
              icon: <GroupIcon />,
              label: "Bank Details Setup",
              to: "/staff/settings/staff",
            },
            {
              icon: <GroupIcon />,
              label: "Change Password / PIN",
              to: "/staff/settings/staff",
            },
            {
              icon: <GroupIcon />,
              label: "Staff",
              to: "/staff/settings/staff",
            },

            {
              icon: <NotificationsIcon />,
              label: "Notification Preferences",
              to: "/staff/settings/notifications",
            },
            {
              icon: <CalculateIcon />,
              label: "Bank Details",
              to: "/staff/settings/bank",
            },
            {
              icon: <FunctionsIcon />,
              label: "Upgrade Tier",
              to: "/staff/settings/upgrade",
            },
            {
              icon: <GroupIcon />,
              label: "2FA & OTP Security",
              to: "/staff/settings/staff",
            },
          ],
        },
        //  Monthly Sales Graph
        //  Top-Selling Services Chart
        //  Partner Ranking Board
        //  Goal Setting & Progress Tracker
        //  Performance Badge Display

        {
          section: "Performance & Analytics",
          icon: <SettingsIcon />,
          items: [
            {
              icon: <SettingsIcon />,
              label: "Monthly Sales Graph",
              to: "/staff/settings/profile",
            },
            {
              icon: <SettingsIcon />,
              label: "Top-Selling Services Chart",
              to: "/staff/settings/kyc",
            },
            {
              icon: <SettingsIcon />,
              label: "Partner Ranking Board",
              to: "/staff/settings/kyc",
            },
            {
              icon: <GroupIcon />,
              label: "Goal Setting & Progress Tracker",
              to: "/staff/settings/staff",
            },
            {
              icon: <GroupIcon />,
              label: "Performance Badge Display",
              to: "/staff/settings/staff",
            },
          ],
        },
        {
          section: "Advanced Features",
          icon: <FunctionsIcon />,
          items: [
            {
              icon: <FunctionsIcon />,
              label: "AI Assistant",
              to: "/staff/advanced/ai",
            },
            {
              icon: <TransformIcon />,
              label: "Smart Matching",
              to: "/staff/advanced/matching",
            },
            {
              icon: <LanguageIcon />,
              label: "White-Label",
              to: "/staff/advanced/white-label",
            },
            {
              icon: <MenuBookIcon />,
              label: "Bulk Data Export",
              to: "/staff/advanced/export",
            },
            {
              icon: <SchoolIcon />,
              label: "Training Tracker",
              to: "/staff/advanced/training-tracker",
            },
            {
              icon: <FunctionsIcon />,
              label: "Sales Leaderboard",
              to: "/staff/advanced/leaderboard",
            },
          ],
        },
      ],

      admin: [
        {
          section: "Menu",
          icon: <AppsOutlinedIcon />,
          items: [
            {
              icon: <SettingsIcon />,
              label: "Settings",
              to: "/admin/settings",
            },
          ],
        },
      ],
    }),
    []
  );

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
    return "Dashboard";
  }, [location.pathname, role, sidebarStructureByRole]);

  // Always pass a fresh array to SidebarContent to avoid stale props
  const drawer = (
    <SidebarContent
      isOpen={open}
      sidebarSections={sidebarStructureByRole[role] || []}
      toggleSidebar={handleDrawerToggle}
    />
  );

  // Notification icon with menu
  function NotifTypeIcon({ type }: { type: string }) {
    switch (type) {
      case "error":
        return <ErrorIcon color="error" fontSize="small" />;
      case "info":
        return <InfoIcon color="info" fontSize="small" />;
      case "success":
        return <DoneIcon color="success" fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: {
            sm: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)`,
          },
          ml: { sm: `${open ? drawerWidth : collapsedDrawerWidth}px` },
          boxShadow: "none",
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
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: theme.palette.text.primary }}
          >
            {currentTitle}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{ bgcolor: theme.palette.background.paper }}
                aria-label="show notifications"
                onClick={handleNotifOpen}
                color={unreadCount > 0 ? "primary" : "default"}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              PaperProps={{
                sx: {
                  minWidth: 320,
                  maxWidth: 350,
                  boxShadow: theme.shadows[4],
                  mt: 1.5,
                },
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Typography variant="subtitle1" sx={{ px: 2, pt: 1, fontWeight: 'bold' }}>
                Notifications
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {notifications.length === 0 ? (
                <MenuItem disabled>
                  <ListItemText primary="No notifications" />
                </MenuItem>
              ) : (
                notifications.map((notif) => (
                  <MenuItem
                    key={notif.id}
                    dense
                    sx={{
                      alignItems: 'flex-start',
                      background: !notif.read
                        ? theme.palette.action.selected
                        : "inherit",
                    }}
                    onClick={handleNotifClose}
                  >
                    <ListItemIcon sx={{ mt: 0.2 }}>
                      <NotifTypeIcon type={notif.type} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notif.message}
                      secondary={formatNotificationTime(notif.time)}
                      secondaryTypographyProps={{
                        sx: { fontSize: 12, color: "text.secondary", mt: 0.3 },
                      }}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: !notif.read ? 600 : 400,
                          fontSize: 14,
                        },
                      }}
                    />
                  </MenuItem>
                ))
              )}
            </Menu>

            <IconButton sx={{ bgcolor: theme.palette.background.paper }}>
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: open ? drawerWidth : collapsedDrawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : collapsedDrawerWidth,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: "border-box",
              border: "none",
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
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: {
            xs: "100vw",
            sm: open
              ? `calc(97vw - ${drawerWidth}px)`
              : `calc(97vw - ${collapsedDrawerWidth}px)`,
          },
          ml: {
            sm: open ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
            xs: 0,
          },
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
