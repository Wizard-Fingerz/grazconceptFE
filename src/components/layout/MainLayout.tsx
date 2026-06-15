import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
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
  MenuBook as MenuBookIcon,
  Transform as TransformIcon,
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
  SchoolOutlined as SchoolOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
  Groups as GroupsIcon,
  BeachAccess as BeachAccessIcon,
  Hotel as HotelIcon,
  PhoneIphone as PhoneIphoneIcon,
  MoneyRounded,
  ModeOfTravel,
  PaymentSharp,
  Error as ErrorIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminIcon,
  SupportAgent as SupportIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import SidebarContent from "../SideBar/SidebarContent";
import {
  subscribeToNotifications,
  requestUserNotifications,
} from "../../services/notificationServices";

/* ─── Brand tokens ─────────────────────────────────────────────── */
const C = {
  brand: "#8b2b8c", brandHov: "#ac60e3",
  accent: "#cfa5f2", accentLt: "#f0d9fb", accentXL: "#f9f0fe",
  red: "#DC2626", redBg: "#FEF2F2",
  green: "#059669",
  g50: "#FAFAFA", g100: "#F4F4F5", g200: "#E4E4E7",
  g300: "#D1D5DB", g400: "#A1A1AA", g500: "#71717A",
  g700: "#3F3F46", g900: "#18181B",
} as const;

/* ─── Search suggestions ───────────────────────────────────────── */
const SEARCH_SUGGESTIONS = [
  {
    group: "🏠 Home", items: [
      { icon: "🏠", text: "Dashboard", hint: "Overview", to: "/dashboard" },
      { icon: "📋", text: "Track Applications", hint: "Check your status", to: "/track-progress" },
      { icon: "💳", text: "Payments & Bills", hint: "Airtime, data, utilities", to: "/services/airtime-and-bills" },
    ]
  },
  {
    group: "✈️ Mobility Hub", items: [
      { icon: "✈️", text: "Flight & Hotel", hint: "Book flights & hotels", to: "/travel/book-flight" },
      { icon: "📄", text: "Study Abroad", hint: "Study visa — UK, Canada…", to: "/travel/study-visa" },
      { icon: "💼", text: "Work Abroad", hint: "Work visa applications", to: "/travel/work-visa" },
      { icon: "🕌", text: "Pilgrimage", hint: "Hajj & Umrah packages", to: "/travel/pilgrimage" },
      { icon: "🏖️", text: "Travel & Vacation", hint: "Holiday packages", to: "/travel/vacation" },
      { icon: "🌍", text: "Citizenship Pathways", hint: "Investment & CBI", to: "/citizenship/investment-plan" },
    ]
  },
  {
    group: "💰 Financial Hub", items: [
      { icon: "🎓", text: "Study Loan", hint: "Abroad tuition financing", to: "/edufinance/study-abroad-loan" },
      { icon: "🛫", text: "Travel Now Pay Later", hint: "Book now, pay in parts", to: "/finance/travel-now-pay-later" },
      { icon: "💰", text: "Travel Savings Plan", hint: "Save for your trip", to: "/dashboard/savings-plan" },
      { icon: "🤝", text: "Investment Circle", hint: "Group investments", to: "/finance/investment-circle" },
      { icon: "💸", text: "Cross-Border Payments", hint: "Send money abroad", to: "/finance/cross-border-payments" },
    ]
  },
  {
    group: "📚 Learning Hub", items: [
      { icon: "💻", text: "Learn Tech, Work Globally", hint: "Tech skills for abroad", to: "/learn/tech" },
      { icon: "🗣️", text: "Language for Abroad Jobs", hint: "French, German, Arabic…", to: "/learn/language" },
      { icon: "🔧", text: "Vocational Skills", hint: "Trade & craft skills", to: "/learn/vocational" },
      { icon: "🏅", text: "Certifications & Qualifications", hint: "Recognised globally", to: "/learn/certifications" },
      { icon: "📅", text: "Career Webinars", hint: "Live & on-demand", to: "/learn/webinars" },
    ]
  },
];

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

type RoleKey = "customer" | "agent" | "admin";
type SidebarItem = { icon: React.ReactNode; label: string; to: string };
type SidebarSection = { section: string; icon: React.ReactNode; items: SidebarItem[] };
type Notification = { id: string | number; type: string; message: string; read: boolean; time?: string; title?: string; link?: string;[k: string]: any };

function getRoleFromUser(user: any): RoleKey {
  const r = typeof user?.user_type_name === "string" ? user.user_type_name.trim().toLowerCase() : "";
  if (r === "agent") return "agent";
  if (r === "admin") return "admin";
  return "customer";
}
function formatNotificationTime(ts?: string | number | Date) {
  if (!ts) return "";
  const d = typeof ts === "object" ? ts : typeof ts === "number" ? new Date(ts) : new Date(ts as string);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

/* ─── Notification type dot colour ────────────────────────────── */
function notifDotColor(type: string) {
  if (type === "error") return C.red;
  if (type === "success") return C.green;
  if (type === "info") return C.accent;
  return C.brand;
}

/* ═══════════════════════════════════════════════════════════════ */
export const MainLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* search */
  const [searchVal, setSearchVal] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrap = useRef<HTMLDivElement>(null);

  /* notifications */
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<Notification[]>([]);
  useEffect(() => { notificationsRef.current = notifications; }, [notifications]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  /* Refresh profile from API on mount so profile_picture_url is always current */
  useEffect(() => { updateUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (isMobile && mobileOpen && prevPathname.current !== location.pathname) setMobileOpen(false);
    prevPathname.current = location.pathname;
  }, [location.pathname, isMobile, mobileOpen]);

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(p => !p); else setOpen(p => !p);
  };

  /* ⌘K keyboard shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* close dropdowns on outside click */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchWrap.current && !searchWrap.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)
        && notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* notifications service */
  useEffect(() => {
    let m = true;
    const MAX = 30;
    const trunc = (s?: string) => typeof s === "string" && s.length > MAX ? s.slice(0, MAX) + "..." : s;
    const onNotification = (data: any) => {
      if (!m) return;
      let arr: any[] | null = null;
      if (Array.isArray(data)) arr = data;
      else if (typeof data === "object" && Array.isArray(data?.notifications)) arr = data.notifications;
      if (arr) {
        const normalized = arr.map((n, idx) => ({
          ...n,
          message: trunc(n.message),
          id: n.id ?? n.pk ?? n._id ?? (n.message ? trunc(n.message) + (n.time ?? idx) : idx),
          type: n.notification_type || n.type || "info",
          read: "read" in n ? !!n.read : ("is_read" in n ? !!n.is_read : false),
          time: n.time || n.created_at || n.timestamp || n.updated_at,
          title: n.title,
        })).reverse();
        const inc = new Set(normalized.map(n => n.id));
        const ex = new Set(notificationsRef.current.map(n => n.id));
        if ([...inc].some(id => !ex.has(id)) || notificationsRef.current.length !== normalized.length) {
          setNotifications(normalized);
        }
      } else if (typeof data === "object" && data !== null) {
        setNotifications(prev => {
          const id = data.id ?? data.pk ?? data._id ?? (data.message ? trunc(data.message) + (data.time ?? Date.now()) : Date.now());
          if (prev.length > 0 && prev[0].id === id) return prev;
          return [{
            ...data, message: trunc(data.message), id,
            type: data.notification_type || data.type || "info",
            read: "read" in data ? !!data.read : ("is_read" in data ? !!data.is_read : false),
            time: data.time || data.created_at || data.timestamp || data.updated_at,
            title: data.title,
          }, ...prev];
        });
      }
    };
    const unsub = subscribeToNotifications(onNotification);
    requestUserNotifications();
    return () => { m = false; unsub?.(); };
  }, []);

  /* role-based sidebar structure */
  const sidebarStructureByRole: Record<RoleKey, SidebarSection[]> = useMemo(() => ({
    customer: [
      {
        section: "Home", icon: <HomeIcon />, items: [
          { icon: <HomeIcon />, label: "Dashboard", to: "/dashboard" },
          { icon: <NotificationsIcon />, label: "Track Application", to: "/track-progress" },
        ]
      },
      {
        section: "Travel Solution", icon: <FlightTakeoffIcon />, items: [
          { icon: <SchoolIcon />, label: "Search Study Program", to: "/travel/study-visa/offers" },
          { icon: <SchoolOutlinedIcon />, label: "Apply Study Program", to: "/travel/study-visa" },
          { icon: <WorkOutlineIcon />, label: "Work Visa", to: "/travel/work-visa" },
          { icon: <GroupsIcon />, label: "Pilgrimage", to: "/travel/pilgrimage" },
          { icon: <BeachAccessIcon />, label: "Vacation", to: "/travel/vacation" },
          { icon: <HotelIcon />, label: "Hotel Reservation", to: "/travel/hotel-reservation" },
          { icon: <FlightTakeoffIcon />, label: "Book Flight", to: "/travel/book-flight" },
        ]
      },
      {
        section: "Edufinance Solution", icon: <AccountBalanceIcon />, items: [
          { icon: <AttachMoneyIcon />, label: "Study Abroad Loan", to: "/edufinance/study-abroad-loan" },
          { icon: <BusinessCenterIcon />, label: "Civil Servant Loan", to: "/edufinance/civil-servant-loan" },
        ]
      },
      {
        section: "Citizenship by Investment", icon: <EmojiEventsIcon />, items: [
          { icon: <PublicIcon />, label: "Europe Second Citizenship", to: "/citizenship/europe" },
          { icon: <AssignmentIndIcon />, label: "Investment Plan", to: "/citizenship/investment-plan" },
        ]
      },
      {
        section: "Other Services", icon: <AppsOutlinedIcon />, items: [
          { icon: <PhoneIphoneIcon />, label: "Airtime & Bills", to: "/services/airtime-and-bills" },
          { icon: <FlightTakeoffIcon />, label: "Visa & Travel Services", to: "/services/visa-and-travel" },
          { icon: <SchoolIcon />, label: "Education Services", to: "/services/education-services" },
        ]
      },
      {
        section: "Referrals", icon: <PeopleIcon />, items: [
          { icon: <PeopleIcon />, label: "My Referrals", to: "/referrals" },
        ]
      },
      {
        section: "Help Center", icon: <SupportAgentIcon />, items: [
          { icon: <SupportAgentIcon />, label: "Support Tickets", to: "/support/tickets" },
          { icon: <MenuBookIcon />, label: "Knowledge Base", to: "/support/kb" },
        ]
      },
      {
        section: "Account Settings", icon: <SettingsIcon />, items: [
          { icon: <NotificationsIcon />, label: "Notifications", to: "/settings/notifications" },
          { icon: <SettingsIcon />, label: "Advanced Settings", to: "/settings/advanced" },
          { icon: <PersonIcon />, label: "Profile", to: "/settings/profile" },
        ]
      },
    ],
    agent: [
      {
        section: "Dashboard", icon: <AppsOutlinedIcon />, items: [
          { icon: <AppsOutlinedIcon />, label: "Overview", to: "/staff/dashboard" },
        ]
      },
      {
        section: "Clients / Leads Manager", icon: <GroupIcon />, items: [
          { icon: <GroupIcon />, label: "Add New Client", to: "/staff/clients/new" },
          { icon: <GroupIcon />, label: "View Referred Clients", to: "/staff/clients" },
          { icon: <GroupIcon />, label: "Leads", to: "/staff/leads" },
          { icon: <MenuBookIcon />, label: "Documents", to: "/staff/clients/documents" },
        ]
      },
      {
        section: "Earnings & Payouts", icon: <CalculateIcon />, items: [
          { icon: <CalculateIcon />, label: "Commission History", to: "/staff/transactions/commissions" },
          { icon: <CalculateIcon />, label: "Pending Payouts", to: "/staff/transactions/withdrawals" },
          { icon: <CalculateIcon />, label: "Request Withdrawal", to: "/staff/transactions/withdrawals" },
          { icon: <CalculateIcon />, label: "Set Payment Details", to: "/staff/settings/bank" },
        ]
      },
      {
        section: "Applications", icon: <BookIcon />, items: [
          { icon: <BookIcon />, label: "Submit a New Application", to: "/staff/applications/study" },
          { icon: <BookIcon />, label: "Track Application Status", to: "/staff/applications/visa" },
          { icon: <BookIcon />, label: "View Application History", to: "/staff/applications/exams" },
        ]
      },
      {
        section: "Notifications", icon: <NotificationsIcon />, items: [
          { icon: <NotificationsIcon />, label: "Visa Updates", to: "/staff/notifications/alerts" },
          { icon: <NotificationsIcon />, label: "Partner Alerts", to: "/staff/notifications/alerts" },
          { icon: <NotificationsIcon />, label: "Payment Notifications", to: "/staff/transactions/withdrawals" },
        ]
      },
      {
        section: "Profile Settings", icon: <SettingsIcon />, items: [
          { icon: <SettingsIcon />, label: "Update Profile", to: "/staff/settings/profile" },
          { icon: <SettingsIcon />, label: "Change Password", to: "/staff/settings/staff" },
        ]
      },
      {
        section: "Resources", icon: <MenuBookIcon />, items: [
          { icon: <MenuBookIcon />, label: "Partner Guide", to: "/staff/training/playbook" },
          { icon: <MenuBookIcon />, label: "Pricing List", to: "/staff/training/templates" },
          { icon: <MenuBookIcon />, label: "Marketing Materials", to: "/staff/training/catalogs" },
        ]
      },
      {
        section: "Support", icon: <HelpIcon />, items: [
          { icon: <HelpIcon />, label: "Contact Support", to: "/staff/support/tickets" },
          { icon: <HelpIcon />, label: "Ticket/Chat System", to: "/staff/support/chat" },
        ]
      },
    ],
    admin: [
      {
        section: "Dashboard", icon: <AppsOutlinedIcon />, items: [
          { icon: <AppsOutlinedIcon />, label: "Overview", to: "/admin/dashboard" },
          { icon: <FunctionsIcon />, label: "Analytics & Reports", to: "/admin/analytics" },
        ]
      },
      {
        section: "User Management", icon: <PeopleIcon />, items: [
          { icon: <PeopleIcon />, label: "All Users", to: "/admin/users" },
          { icon: <GroupIcon />, label: "Customers", to: "/admin/users/customers" },
          { icon: <SupportAgentIcon />, label: "Staff & Agents", to: "/admin/users/staff" },
          { icon: <AdminIcon />, label: "Admins", to: "/admin/users/admins" },
          { icon: <PersonIcon />, label: "Roles & Permissions", to: "/admin/users/permissions" },
        ]
      },
      {
        section: "Financial Management", icon: <AccountBalanceIcon />, items: [
          { icon: <AttachMoneyIcon />, label: "Transactions", to: "/admin/financial" },
          { icon: <AccountBalanceIcon />, label: "Wallets", to: "/admin/financial/wallets" },
          { icon: <PaymentSharp />, label: "Payments", to: "/admin/financial/payments" },
          { icon: <MoneyRounded />, label: "Revenue Reports", to: "/admin/financial/reports" },
        ]
      },
      {
        section: "Content Management", icon: <MenuBookIcon />, items: [
          { icon: <TransformIcon />, label: "Landing Page Customizer", to: "/admin/landing" },
          { icon: <MenuBookIcon />, label: "Banners & Media", to: "/admin/content" },
          { icon: <BookIcon />, label: "Articles & Blog", to: "/admin/content/articles" },
          { icon: <EmojiEventsIcon />, label: "Campaigns", to: "/admin/content/campaigns" },
        ]
      },
      {
        section: "Applications", icon: <AssignmentIndIcon />, items: [
          { icon: <SchoolIcon />, label: "Study Applications", to: "/admin/applications/study" },
          { icon: <FlightTakeoffIcon />, label: "Visa Applications", to: "/admin/applications/visa" },
          { icon: <WorkOutlineIcon />, label: "Work Visa", to: "/admin/applications/work-visa" },
          { icon: <BookIcon />, label: "All Applications", to: "/admin/applications" },
        ]
      },
      {
        section: "Offers", icon: <EmojiEventsIcon />, items: [
          { icon: <EmojiEventsIcon />, label: "All Offers", to: "/admin/offers" },
          { icon: <SchoolIcon />, label: "Study Offers", to: "/admin/offers/study" },
          { icon: <FlightTakeoffIcon />, label: "Visa Offers", to: "/admin/offers/visa" },
          { icon: <WorkOutlineIcon />, label: "Work Offers", to: "/admin/offers/work" },
        ]
      },
      {
        section: "Services", icon: <HandymanIcon />, items: [
          { icon: <SchoolIcon />, label: "Study Services", to: "/admin/services/study" },
          { icon: <FlightTakeoffIcon />, label: "Visa Services", to: "/admin/services/visa" },
          { icon: <AttachMoneyIcon />, label: "Loan Services", to: "/admin/services/loans" },
          { icon: <PhoneIphoneIcon />, label: "Airtime & Data", to: "/admin/services/airtime-data" },
          { icon: <BusinessCenterIcon />, label: "All Services", to: "/admin/services" },
        ]
      },
      {
        section: "Travel & Bookings", icon: <ModeOfTravel />, items: [
          { icon: <HotelIcon />, label: "Hotels", to: "/admin/travel/hotels" },
          { icon: <HotelIcon />, label: "Hotel Bookings", to: "/admin/travel/hotel-bookings" },
          { icon: <FlightTakeoffIcon />, label: "Flight Bookings", to: "/admin/travel/flight-bookings" },
        ]
      },
      {
        section: "Support & Help", icon: <HelpIcon />, items: [
          { icon: <SupportIcon />, label: "Support Tickets", to: "/admin/support/tickets" },
          { icon: <HelpIcon />, label: "FAQ Management", to: "/admin/support/faq" },
        ]
      },
      {
        section: "System", icon: <SettingsIcon />, items: [
          { icon: <SettingsIcon />, label: "System Settings", to: "/admin/settings" },
          { icon: <ErrorIcon />, label: "Security & Logs", to: "/admin/security" },
          { icon: <InfoIcon />, label: "System Health", to: "/admin/system/health" },
          { icon: <NotificationsIcon />, label: "Notifications", to: "/admin/system/notifications" },
        ]
      },
    ],
  }), []);

  const role = getRoleFromUser(user);

  const settingsPath = useMemo(() => {
    switch (role) {
      case "customer": return "/settings/advanced";
      case "agent": return "/staff/settings/profile";
      case "admin": return "/admin/settings";
      default: return "/";
    }
  }, [role]);

  const currentTitle = useMemo(() => {
    const secs = sidebarStructureByRole[role] || [];
    for (const sec of secs) for (const it of sec.items)
      if (it.to && location.pathname === it.to) return it.label;
    for (const sec of secs) for (const it of sec.items)
      if (it.to && location.pathname.startsWith(it.to)) return it.label;
    return secs[0]?.items[0]?.label ?? "Dashboard";
  }, [location.pathname, role, sidebarStructureByRole]);

  /* filtered search suggestions */
  const filteredSuggestions = useMemo(() => {
    if (!searchVal.trim()) return SEARCH_SUGGESTIONS;
    const q = searchVal.toLowerCase();
    return SEARCH_SUGGESTIONS.map(g => ({
      ...g,
      items: g.items.filter(i => i.text.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)),
    })).filter(g => g.items.length > 0);
  }, [searchVal]);

  const handleNotifClick = (notif: Notification) => {
    setNotifOpen(false);
    if (notif.link?.startsWith("/")) navigate(notif.link);
    else if (role === "agent") navigate("/staff/settings/notifications");
    else if (role === "admin") navigate("/admin/settings");
    else navigate("/settings/notifications");
  };

  const markAllRead = useCallback(() => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
  }, []);

  const drawer = (
    <SidebarContent
      isOpen={open}
      sidebarSections={sidebarStructureByRole[role] || []}
      toggleSidebar={handleDrawerToggle}
    />
  );

  const drawerW = open ? drawerWidth : collapsedDrawerWidth;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: C.g50 }}>
      <CssBaseline />

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <Box component="nav" sx={{
        width: { sm: drawerW }, flexShrink: { sm: 0 },
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerW,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: "border-box", border: "none",
              boxShadow: theme.shadows[3],
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* ── RIGHT COLUMN (header + content) ─────────────────────── */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, overflow: "hidden",
      }}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <Box sx={{
          height: 64, bgcolor: "#fff",
          borderBottom: `1px solid ${C.g200}`,
          display: "flex", alignItems: "center",
          px: { xs: 1.5, sm: 3 }, gap: { xs: 1, sm: 2 },
          position: "fixed", top: 0, left: { xs: 0, sm: drawerW }, right: 0, zIndex: 40,
        }}>
          {/* Mobile: hamburger */}
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              display: { sm: "none" },
              width: 36, height: 36, borderRadius: "8px",
              bgcolor: C.g100, color: C.g700,
              "&:hover": { bgcolor: C.g200 },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* Mobile: logo */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.8 }}>
            <img src={logo} alt="GrazConcept" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: C.g900, whiteSpace: "nowrap" }}>GrazConcept</Typography>
          </Box>

          {/* Desktop: page title */}
          <Typography sx={{
            display: { xs: "none", sm: "block" },
            fontSize: 15, fontWeight: 700, color: C.g900,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {currentTitle}
          </Typography>

          {/* Mobile: search icon only */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, ml: "auto" }}>
            <Box
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              sx={{
                width: 36, height: 36, borderRadius: "8px", bgcolor: C.g100,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", "&:hover": { bgcolor: C.g200 },
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: C.g500 }} />
            </Box>
          </Box>

          {/* ── SEARCH (desktop) ───────────────────────────────── */}
          <Box
            ref={searchWrap}
            sx={{ flex: 1, maxWidth: 420, position: "relative", mx: 2, display: { xs: "none", sm: "block" } }}
          >
            <Box
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                bgcolor: searchOpen ? "#fff" : C.g100,
                borderRadius: "10px", px: "14px", py: "9px",
                border: `2px solid ${searchOpen ? C.accent : "transparent"}`,
                boxShadow: searchOpen ? `0 0 0 3px ${C.accentXL}` : "none",
                cursor: "text", transition: "all .15s",
              }}
            >
              <SearchIcon sx={{ fontSize: 15, color: C.g400, flexShrink: 0 }} />
              <Box
                component="input"
                ref={searchRef}
                value={searchVal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchVal(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search flights, visas, services…"
                sx={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: C.g700, width: "100%", fontFamily: "inherit",
                  "&::placeholder": { color: C.g400 },
                }}
              />
              {/* ⌘K badge */}
              {!searchVal && (
                <Box sx={{
                  fontSize: 10, color: C.g400, bgcolor: C.g100,
                  border: `1px solid ${C.g200}`, borderRadius: "4px",
                  px: "5px", py: "1px", fontFamily: "monospace",
                  whiteSpace: "nowrap", flexShrink: 0,
                  display: { xs: "none", md: "inline" },
                }}>⌘K</Box>
              )}
              {searchVal && (
                <Box
                  onClick={(e) => { e.stopPropagation(); setSearchVal(""); searchRef.current?.focus(); }}
                  sx={{
                    cursor: "pointer", color: C.g400, fontSize: 16, lineHeight: 1,
                    "&:hover": { color: C.g700 }
                  }}
                >×</Box>
              )}
            </Box>

            {/* Search dropdown */}
            {searchOpen && (
              <Box sx={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                bgcolor: "#fff", border: `1px solid ${C.g200}`, borderRadius: "12px",
                boxShadow: "0 12px 32px rgba(0,0,0,.12)", zIndex: 200,
                overflow: "hidden",
              }}>
                {filteredSuggestions.length === 0 ? (
                  <Box sx={{ px: 2, py: 2, fontSize: 12, color: C.g400, textAlign: "center" }}>
                    No results for "{searchVal}"
                  </Box>
                ) : filteredSuggestions.map(group => (
                  <Box key={group.group}>
                    <Typography sx={{
                      px: "14px", pt: "10px", pb: "4px",
                      fontSize: 10, fontWeight: 700, color: C.g400,
                      letterSpacing: ".8px", textTransform: "uppercase",
                    }}>{group.group}</Typography>
                    {group.items.map(item => (
                      <Box
                        key={item.text}
                        onClick={() => { navigate(item.to); setSearchOpen(false); setSearchVal(""); }}
                        sx={{
                          display: "flex", alignItems: "center", gap: "10px",
                          px: "14px", py: "9px", cursor: "pointer", transition: "all .1s",
                          "&:hover": { bgcolor: C.g50 },
                        }}
                      >
                        <Box sx={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</Box>
                        <Typography sx={{ fontSize: 13, color: C.g700, fontWeight: 500, flex: 1 }}>
                          {item.text}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: C.g400 }}>{item.hint}</Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* ── RIGHT SIDE ─────────────────────────────────────── */}
          <Box sx={{ ml: { xs: 0, sm: "auto" }, display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>

            {/* Notification bell */}
            <Box ref={notifRef} sx={{ position: "relative" }}>
              <Tooltip title="Notifications">
                <Box
                  onClick={() => { setNotifOpen(p => !p); if (!notifOpen) requestUserNotifications(); }}
                  sx={{
                    width: 38, height: 38, borderRadius: "10px", bgcolor: C.g100,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", transition: "all .15s",
                    "&:hover": { bgcolor: C.g200 },
                  }}
                >
                  <Badge badgeContent={unreadCount || 0} color="error" max={9}
                    sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 16, height: 16, top: 2, right: 2 } }}>
                    <NotificationsIcon sx={{ fontSize: 18, color: unreadCount > 0 ? C.brand : C.g500 }} />
                  </Badge>
                  {unreadCount > 0 && (
                    <Box sx={{
                      position: "absolute", top: 6, right: 6,
                      width: 8, height: 8, borderRadius: "50%",
                      bgcolor: C.red, border: "2px solid #fff",
                    }} />
                  )}
                </Box>
              </Tooltip>
            </Box>

            {/* Help (desktop only) */}
            <Tooltip title="Help Centre">
              <Box
                onClick={() => navigate("/support/tickets")}
                sx={{
                  width: 38, height: 38, borderRadius: "10px", bgcolor: C.g100,
                  display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all .15s",
                  "&:hover": { bgcolor: C.g200 },
                }}
              >
                <HelpIcon sx={{ fontSize: 18, color: C.g500 }} />
              </Box>
            </Tooltip>

            {/* Settings (desktop) */}
            <Tooltip title="Settings">
              <Box
                onClick={() => navigate(settingsPath)}
                sx={{
                  width: 38, height: 38, borderRadius: "10px", bgcolor: C.g100,
                  display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all .15s",
                  "&:hover": { bgcolor: C.g200 },
                }}
              >
                <SettingsIcon sx={{ fontSize: 18, color: C.g500 }} />
              </Box>
            </Tooltip>

            {/* User avatar */}
            <Box
              onClick={() => navigate(role === "agent" ? "/staff/settings/profile" : role === "admin" ? "/admin/settings" : "/settings/profile")}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                bgcolor: (user?.profile_picture_url || user?.profile_picture) ? "transparent" : C.brand,
                borderRadius: "10px", cursor: "pointer", overflow: "hidden",
                boxShadow: (user?.profile_picture_url || user?.profile_picture) ? "none" : "0 2px 8px rgba(182,106,237,.3)",
                transition: "all .15s",
                "&:hover": { boxShadow: "0 4px 14px rgba(182,106,237,.4)", opacity: .9 },
                pl: (user?.profile_picture_url || user?.profile_picture) ? 0 : { xs: 0, sm: "10px" },
                pr: (user?.profile_picture_url || user?.profile_picture) ? 0 : { xs: 0, sm: "10px" },
                height: 38, flexShrink: 0,
              }}
            >
              {(user?.profile_picture_url || user?.profile_picture) ? (
                <Box component="img" src={user.profile_picture_url || user.profile_picture}
                  sx={{ width: 38, height: 38, borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <>
                  {/* Initial circle — mobile only */}
                  <Box sx={{
                    width: 28, height: 28, borderRadius: "7px", flexShrink: 0,
                    bgcolor: "rgba(255,255,255,.2)",
                    display: { xs: "flex", sm: "none" },
                    alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13, color: "#fff",
                  }}>
                    {(user?.first_name?.[0] || "U").toUpperCase()}
                  </Box>
                  {/* First name — desktop only */}
                  <Typography sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    whiteSpace: "nowrap", lineHeight: 1,
                  }}>
                    {user?.first_name || "User"}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── NOTIFICATION PANEL ─────────────────────────────────── */}
        {notifOpen && (
          <Box
            ref={notifPanelRef}
            sx={{
              position: "fixed",
              top: 64 + 8,
              right: 24,
              width: 360,
              bgcolor: "#fff",
              borderRadius: "14px",
              border: `1px solid ${C.g200}`,
              boxShadow: "0 12px 32px rgba(0,0,0,.12)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{
              px: 2, py: "14px", borderBottom: `1px solid ${C.g100}`,
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Box sx={{
                    bgcolor: C.red, color: "#fff", borderRadius: "10px",
                    px: "6px", py: "1px", fontSize: 10, fontWeight: 700
                  }}>{unreadCount}</Box>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: .5 }}>
                {unreadCount > 0 && (
                  <Tooltip title="Mark all read">
                    <IconButton size="small" onClick={markAllRead}
                      sx={{ color: C.brand, "&:hover": { bgcolor: C.accentXL } }}>
                      <DoneAllIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" onClick={() => setNotifOpen(false)}
                  sx={{ color: C.g400, "&:hover": { bgcolor: C.g100 } }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Items */}
            <Box sx={{
              maxHeight: 380, overflowY: "auto",
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": { bgcolor: C.g200, borderRadius: 4 }
            }}>
              {notifications.length === 0 ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Box sx={{ fontSize: 28, mb: 1 }}>🔔</Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.g900, mb: .5 }}>
                    You're all caught up
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: C.g400 }}>No notifications yet</Typography>
                </Box>
              ) : (
                notifications.map(notif => (
                  <Box
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    sx={{
                      display: "flex", gap: "12px", px: 2, py: "12px",
                      borderBottom: `1px solid ${C.g50}`, cursor: "pointer",
                      bgcolor: !notif.read ? C.accentXL : "#fff",
                      transition: "background .1s",
                      "&:hover": { bgcolor: !notif.read ? C.accentLt : C.g50 },
                    }}
                  >
                    <Box sx={{
                      width: 8, height: 8, borderRadius: "50%", mt: "5px", flexShrink: 0,
                      bgcolor: !notif.read ? notifDotColor(notif.type) : C.g300,
                    }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {notif.title && (
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.g900, mb: "2px" }}>
                          {notif.title}
                        </Typography>
                      )}
                      <Typography sx={{
                        fontSize: 11, color: C.g500, lineHeight: 1.4,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                      }}>
                        {notif.message}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: C.g400, mt: "3px" }}>
                        {formatNotificationTime(notif.time)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* Footer */}
            <Box
              onClick={() => { setNotifOpen(false); navigate(role === "agent" ? "/staff/notifications/alerts" : "/settings/notifications"); }}
              sx={{
                px: 2, py: "10px", textAlign: "center", borderTop: `1px solid ${C.g100}`,
                fontSize: 12, fontWeight: 600, color: C.brand, cursor: "pointer",
                "&:hover": { bgcolor: C.accentXL }
              }}
            >
              View all notifications →
            </Box>
          </Box>
        )}

        {/* ── PAGE CONTENT ────────────────────────────────────────── */}
        <Box sx={{
          flex: 1,
          mt: '64px',
          px: { xs: 1, sm: 2, md: 4 },
          py: { xs: 1, sm: 2 },
          overflowX: "hidden",
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
