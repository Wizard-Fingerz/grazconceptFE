import type { RouteObject } from 'react-router-dom';
import { CustomerProfileSetup } from '../pages/auth/ProfileSetup';
import { ProtectedRoute } from '../pages/auth/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/customer/dashboard/Dashboard';
import { AgentDashboard } from '../pages/staff/AgentDashboard';
import StaffPlaceholderPage from '../pages/staff/PlaceholderPage';
import CustomerPlaceholderPage from '../pages/customer/PlaceholderPage';
import StudyServicePage from '../pages/staff/services/StudyServicePage';
import VisaServicePage from '../pages/staff/services/VisaServicePage';
import ExamServicePage from '../pages/staff/services/ExamServicePage';
import AssetsServicePage from '../pages/staff/services/AssetsServicePage';
import PropertyServicePage from '../pages/staff/services/PropertyServicePage';
import BusinessBrandingServicePage from '../pages/staff/services/BusinessBrandingServicePage';
import LegalDocumentsServicePage from '../pages/staff/services/LegalDocumentsServicePage';
import LoansServicePage from '../pages/staff/services/LoansServicePage';
import PaymentsPage from '../pages/staff/transactions/PaymentsPage';
import CommissionsPage from '../pages/staff/transactions/CommissionsPage';
import WithdrawalsPage from '../pages/staff/transactions/WithdrawalsPage';
import InvoicesReceiptsPage from '../pages/staff/transactions/InvoicesReceiptsPage';
import RewardsTiersPage from '../pages/staff/transactions/RewardsTiersPage';
import StudyAbroadPage from '../pages/staff/applications/StudyAbroadPage';
import VisaApplicationsPage from '../pages/staff/applications/VisaApplicationsPage';
import ExamRegistrationsPage from '../pages/staff/applications/ExamRegistrationsPage';
import OrdersPage from '../pages/staff/applications/OrdersPage';
import PropertyInterestsPage from '../pages/staff/applications/PropertyInterestsPage';
import DocumentsLegalPage from '../pages/staff/applications/DocumentsLegalPage';
import ClientsPage from '../pages/staff/clients/ClientsPage';
import LeadsPage from '../pages/staff/clients/LeadsPage';
import NewClient from '../pages/staff/clients/NewClient';
import DocumentsPage from '../pages/staff/clients/DocumentsPage';
import AssignTeamsPage from '../pages/staff/clients/AssignTeamsPage';
import NotesRemindersPage from '../pages/staff/clients/NotesRemindersPage';
import ContactClientPage from '../pages/staff/clients/ContactClientPage';
import { AuthLayout } from '../pages/auth/AuthLayout';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import PerformanceAnalytics from '../pages/staff/PerformanceAnalytics';
import ServiceUsageSummary from '../pages/staff/ServiceUsageSummary';
import { ApplyStudyVisa } from '../pages/customer/travel/StudyVisa';
import { ApplyWorkVisa } from '../pages/customer/travel/WorkVisa';
import { ApplyPilgrimageVisa } from '../pages/customer/travel/Prigrimage';
import VacationPage from '../pages/customer/travel/Vacation';
import HotelReservation from '../pages/customer/travel/HotelReservation';


// Public routes (unauthenticated)
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: '/',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
];

// Protected routes (authenticated users)
export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Customer routes
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Register customer placeholder routes
      {
        path: 'travel/study-visa',
        element: <ApplyStudyVisa />,
      },
      {
        path: 'travel/work-visa',
        element: <ApplyWorkVisa/>,
      },
      {
        path: 'travel/pilgrimage',
        element: <ApplyPilgrimageVisa />,
      },
      {
        path: 'travel/vacation',
        element: <VacationPage />,
      },
      {
        path: 'travel/hotel-reservation',
        element: <HotelReservation />,
      },
      {
        path: 'edufinance/study-abroad-loan',
        element: <CustomerPlaceholderPage title="Study Abroad Loan" />,
      },
      {
        path: 'edufinance/parent-loan',
        element: <CustomerPlaceholderPage title="Parent/Guardian Loan" />,
      },
      {
        path: 'edufinance/personal-loan',
        element: <CustomerPlaceholderPage title="Personal Loan" />,
      },
      {
        path: 'edufinance/business-loan',
        element: <CustomerPlaceholderPage title="Business Loan" />,
      },
      {
        path: 'citizenship/europe',
        element: <CustomerPlaceholderPage title="Europe Second Citizenship" />,
      },
      {
        path: 'citizenship/investment-plan',
        element: <CustomerPlaceholderPage title="Investment Plan" />,
      },
      {
        path: 'value-added/gift-cards',
        element: <CustomerPlaceholderPage title="Gift Cards" />,
      },
      {
        path: 'value-added/loyalty',
        element: <CustomerPlaceholderPage title="Loyalty Program" />,
      },
      {
        path: 'referrals',
        element: <CustomerPlaceholderPage title="My Referrals" />,
      },
      {
        path: 'support/tickets',
        element: <CustomerPlaceholderPage title="Support Tickets" />,
      },
      {
        path: 'support/chat',
        element: <CustomerPlaceholderPage title="Live Chat & Email" />,
      },
      {
        path: 'support/kb',
        element: <CustomerPlaceholderPage title="Knowledge Base" />,
      },
      {
        path: 'settings/notifications',
        element: <CustomerPlaceholderPage title="Notifications" />,
      },
      {
        path: 'settings/support',
        element: <CustomerPlaceholderPage title="Help & Support" />,
      },
      {
        path: 'settings/advanced',
        element: <CustomerPlaceholderPage title="Advanced Settings" />,
      },
      {
        path: 'settings/profile',
        element: <CustomerPlaceholderPage title="Profile" />,
      },

      // Staff routes
      { path: 'staff/dashboard', element: <AgentDashboard /> },
      { path: 'staff/analytics', element: <PerformanceAnalytics/> },
      { path: 'staff/usage-summary', element: <ServiceUsageSummary/> },

      { path: 'staff/clients', element: <ClientsPage /> },
      { path: 'staff/leads', element: <LeadsPage /> },
      { path: 'staff/clients/new', element: <NewClient /> },
      { path: 'staff/clients/documents', element: <DocumentsPage /> },
      { path: 'staff/clients/assign', element: <AssignTeamsPage /> },
      { path: 'staff/clients/notes', element: <NotesRemindersPage /> },
      { path: 'staff/clients/contact', element: <ContactClientPage /> },

      { path: 'staff/applications/study', element: <StudyAbroadPage /> },
      { path: 'staff/applications/visa', element: <VisaApplicationsPage /> },
      { path: 'staff/applications/exams', element: <ExamRegistrationsPage /> },
      { path: 'staff/applications/orders', element: <OrdersPage /> },
      { path: 'staff/applications/property', element: <PropertyInterestsPage /> },
      { path: 'staff/applications/documents', element: <DocumentsLegalPage /> },

      { path: 'staff/services/study', element: <StudyServicePage /> },
      { path: 'staff/services/visa', element: <VisaServicePage /> },
      { path: 'staff/services/exams', element: <ExamServicePage /> },
      { path: 'staff/services/assets', element: <AssetsServicePage /> },
      { path: 'staff/services/property', element: <PropertyServicePage /> },
      { path: 'staff/services/business', element: <BusinessBrandingServicePage /> },
      { path: 'staff/services/legal', element: <LegalDocumentsServicePage /> },
      { path: 'staff/services/loans', element: <LoansServicePage /> },

      { path: 'staff/transactions/payments', element: <PaymentsPage /> },
      { path: 'staff/transactions/commissions', element: <CommissionsPage /> },
      { path: 'staff/transactions/withdrawals', element: <WithdrawalsPage /> },
      { path: 'staff/transactions/invoices', element: <InvoicesReceiptsPage /> },
      { path: 'staff/transactions/rewards', element: <RewardsTiersPage /> },

      { path: 'staff/marketplace/listings', element: <StaffPlaceholderPage title="Marketplace Listings" /> },
      { path: 'staff/marketplace/new', element: <StaffPlaceholderPage title="Add New Listing" /> },
      { path: 'staff/marketplace/stock', element: <StaffPlaceholderPage title="Stock & Availability" /> },
      { path: 'staff/marketplace/chat', element: <StaffPlaceholderPage title="Client-Product Chat" /> },

      { path: 'staff/training/videos', element: <StaffPlaceholderPage title="Video Tutorials" /> },
      { path: 'staff/training/templates', element: <StaffPlaceholderPage title="Templates" /> },
      { path: 'staff/training/catalogs', element: <StaffPlaceholderPage title="Digital Catalogs" /> },
      { path: 'staff/training/scripts', element: <StaffPlaceholderPage title="Sales Scripts" /> },
      { path: 'staff/training/playbook', element: <StaffPlaceholderPage title="Agent Playbook" /> },

      { path: 'staff/notifications/alerts', element: <StaffPlaceholderPage title="Visa Alerts & Deadlines" /> },
      { path: 'staff/notifications/broadcasts', element: <StaffPlaceholderPage title="Broadcasts" /> },
      { path: 'staff/notifications/campaigns', element: <StaffPlaceholderPage title="Campaigns" /> },
      { path: 'staff/notifications/badges', element: <StaffPlaceholderPage title="Badges" /> },

      { path: 'staff/support/tickets', element: <StaffPlaceholderPage title="Support Tickets" /> },
      { path: 'staff/support/chat', element: <StaffPlaceholderPage title="Live Chat & Email" /> },
      { path: 'staff/support/kb', element: <StaffPlaceholderPage title="Knowledge Base" /> },

      { path: 'staff/settings/profile', element: <StaffPlaceholderPage title="Profile & Company" /> },
      { path: 'staff/settings/kyc', element: <StaffPlaceholderPage title="KYC" /> },
      { path: 'staff/settings/staff', element: <StaffPlaceholderPage title="Staff" /> },
      { path: 'staff/settings/notifications', element: <StaffPlaceholderPage title="Notification Preferences" /> },
      { path: 'staff/settings/bank', element: <StaffPlaceholderPage title="Bank Details" /> },
      { path: 'staff/settings/upgrade', element: <StaffPlaceholderPage title="Upgrade Tier" /> },

      { path: 'staff/advanced/ai', element: <StaffPlaceholderPage title="AI Assistant" /> },
      { path: 'staff/advanced/matching', element: <StaffPlaceholderPage title="Smart Matching" /> },
      { path: 'staff/advanced/white-label', element: <StaffPlaceholderPage title="White-Label" /> },
      { path: 'staff/advanced/export', element: <StaffPlaceholderPage title="Bulk Data Export" /> },
      { path: 'staff/advanced/training-tracker', element: <StaffPlaceholderPage title="Training Tracker" /> },
      { path: 'staff/advanced/leaderboard', element: <StaffPlaceholderPage title="Sales Leaderboard" /> },
      {
        path: 'profile-setup',
        element: <CustomerProfileSetup />,  // <-- moved here
      },
    ],
  },
];
