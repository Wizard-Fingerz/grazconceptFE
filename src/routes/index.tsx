import type { RouteObject } from 'react-router-dom';
import { CustomerProfileSetup } from '../pages/auth/ProfileSetup';
import { ProtectedRoute } from '../pages/auth/ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { AgentDashboard } from '../pages/staff/AgentDashboard';
import PlaceholderPage from '../pages/staff/PlaceholderPage';
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
      {
        path: 'dashboard',
        element: <Dashboard />,
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

      { path: 'staff/marketplace/listings', element: <PlaceholderPage title="Marketplace Listings" /> },
      { path: 'staff/marketplace/new', element: <PlaceholderPage title="Add New Listing" /> },
      { path: 'staff/marketplace/stock', element: <PlaceholderPage title="Stock & Availability" /> },
      { path: 'staff/marketplace/chat', element: <PlaceholderPage title="Client-Product Chat" /> },

      { path: 'staff/training/videos', element: <PlaceholderPage title="Video Tutorials" /> },
      { path: 'staff/training/templates', element: <PlaceholderPage title="Templates" /> },
      { path: 'staff/training/catalogs', element: <PlaceholderPage title="Digital Catalogs" /> },
      { path: 'staff/training/scripts', element: <PlaceholderPage title="Sales Scripts" /> },
      { path: 'staff/training/playbook', element: <PlaceholderPage title="Agent Playbook" /> },

      { path: 'staff/notifications/alerts', element: <PlaceholderPage title="Visa Alerts & Deadlines" /> },
      { path: 'staff/notifications/broadcasts', element: <PlaceholderPage title="Broadcasts" /> },
      { path: 'staff/notifications/campaigns', element: <PlaceholderPage title="Campaigns" /> },
      { path: 'staff/notifications/badges', element: <PlaceholderPage title="Badges" /> },

      { path: 'staff/support/tickets', element: <PlaceholderPage title="Support Tickets" /> },
      { path: 'staff/support/chat', element: <PlaceholderPage title="Live Chat & Email" /> },
      { path: 'staff/support/kb', element: <PlaceholderPage title="Knowledge Base" /> },

      { path: 'staff/settings/profile', element: <PlaceholderPage title="Profile & Company" /> },
      { path: 'staff/settings/kyc', element: <PlaceholderPage title="KYC" /> },
      { path: 'staff/settings/staff', element: <PlaceholderPage title="Staff" /> },
      { path: 'staff/settings/notifications', element: <PlaceholderPage title="Notification Preferences" /> },
      { path: 'staff/settings/bank', element: <PlaceholderPage title="Bank Details" /> },
      { path: 'staff/settings/upgrade', element: <PlaceholderPage title="Upgrade Tier" /> },

      { path: 'staff/advanced/ai', element: <PlaceholderPage title="AI Assistant" /> },
      { path: 'staff/advanced/matching', element: <PlaceholderPage title="Smart Matching" /> },
      { path: 'staff/advanced/white-label', element: <PlaceholderPage title="White-Label" /> },
      { path: 'staff/advanced/export', element: <PlaceholderPage title="Bulk Data Export" /> },
      { path: 'staff/advanced/training-tracker', element: <PlaceholderPage title="Training Tracker" /> },
      { path: 'staff/advanced/leaderboard', element: <PlaceholderPage title="Sales Leaderboard" /> },
      {
        path: 'profile-setup',
        element: <CustomerProfileSetup />,  // <-- moved here
      },
    ],
  },
];
