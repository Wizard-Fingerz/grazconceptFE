import type { RouteObject } from "react-router-dom";
import { CustomerProfileSetup } from "../pages/auth/ProfileSetup";
import { ProtectedRoute } from "../pages/auth/ProtectedRoute";
import { MainLayout } from "../components/layout/MainLayout";
import { Dashboard } from "../pages/customer/dashboard/Dashboard";
import { AgentDashboard } from "../pages/staff/AgentDashboard";
import StaffPlaceholderPage from "../pages/staff/PlaceholderPage";
import VideoTutorialsPage from "../pages/staff/training/VideoTutorialsPage";
import TemplatesPage from "../pages/staff/training/TemplatesPage";
import DigitalCatalogsPage from "../pages/staff/training/DigitalCatalogsPage";
import SalesScriptsPage from "../pages/staff/training/SalesScriptsPage";
import AgentPlaybookPage from "../pages/staff/training/AgentPlaybookPage";
import CustomerPlaceholderPage from "../pages/customer/PlaceholderPage";
import MarketplaceListingsPage from "../pages/staff/marketplace/MarketplaceListingsPage";
import AddListingPage from "../pages/staff/marketplace/AddListingPage";
import StockManagementPage from "../pages/staff/marketplace/StockManagementPage";
import ChatManagementPage from "../pages/staff/marketplace/ChatManagementPage";
import StudyServicePage from "../pages/staff/services/StudyServicePage";
import VisaServicePage from "../pages/staff/services/VisaServicePage";
import ExamServicePage from "../pages/staff/services/ExamServicePage";
import AssetsServicePage from "../pages/staff/services/AssetsServicePage";
import PropertyServicePage from "../pages/staff/services/PropertyServicePage";
import BusinessBrandingServicePage from "../pages/staff/services/BusinessBrandingServicePage";
import LegalDocumentsServicePage from "../pages/staff/services/LegalDocumentsServicePage";
import LoansServicePage from "../pages/staff/services/LoansServicePage";
import PaymentsPage from "../pages/staff/transactions/PaymentsPage";
import CommissionsPage from "../pages/staff/transactions/CommissionsPage";
import WithdrawalsPage from "../pages/staff/transactions/WithdrawalsPage";
import InvoicesReceiptsPage from "../pages/staff/transactions/InvoicesReceiptsPage";
import RewardsTiersPage from "../pages/staff/transactions/RewardsTiersPage";
import StudyAbroadPage from "../pages/staff/applications/StudyAbroadPage";
import VisaApplicationsPage from "../pages/staff/applications/VisaApplicationsPage";
import ExamRegistrationsPage from "../pages/staff/applications/ExamRegistrationsPage";
import OrdersPage from "../pages/staff/applications/OrdersPage";
import PropertyInterestsPage from "../pages/staff/applications/PropertyInterestsPage";
import DocumentsLegalPage from "../pages/staff/applications/DocumentsLegalPage";
import ClientsPage from "../pages/staff/clients/ClientsPage";
import LeadsPage from "../pages/staff/clients/LeadsPage";
import NewClient from "../pages/staff/clients/NewClient";
import DocumentsPage from "../pages/staff/clients/DocumentsPage";
import AssignTeamsPage from "../pages/staff/clients/AssignTeamsPage";
import NotesRemindersPage from "../pages/staff/clients/NotesRemindersPage";
import ContactClientPage from "../pages/staff/clients/ContactClientPage";
import { AuthLayout } from "../pages/auth/AuthLayout";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import PerformanceAnalytics from "../pages/staff/PerformanceAnalytics";
import ServiceUsageSummary from "../pages/staff/ServiceUsageSummary";
import { ApplyStudyVisa } from "../pages/customer/travel/StudyVisa";
import { ApplyWorkVisa } from "../pages/customer/travel/WorkVisa";
import { ApplyPilgrimageVisa } from "../pages/customer/travel/Pilgrimage/Prigrimage";
import VacationPage from "../pages/customer/travel/Vacation/Vacation";
import HotelReservation from "../pages/customer/travel/HotelReservation";
import FlightListPage from "../pages/customer/flight";
import StudyVisaApplicationForm from "../pages/customer/travel/StudyVisa/ApplicationForm";
import { Navigate } from "react-router-dom";
import CountriesJob from "../pages/customer/travel/WorkVisa/CountriesJob";
import AllStudyOffers from "../pages/customer/travel/StudyVisa/AllstudyOffers";
import StudyVisaDetails from "../pages/customer/travel/StudyVisa/StudyVisaDetails";
import AllStudyVisaApplication from "../pages/customer/travel/StudyVisa/AllStudyVisaApplication";
import ProfilePage from "../pages/auth/ProfilePage";
import ScheduleInterview from "../pages/customer/travel/WorkVisa/ScheduleInterview";
import SubmitCV from "../pages/customer/travel/WorkVisa/SubmitCV";
import TrackProgress from "../pages/customer/travel/WorkVisa/TrackProgress";
import CVBuilder from "../pages/customer/valueServices/CVBuilder";
import JobDetails from "../pages/customer/travel/WorkVisa/JobDetails";
import AllPilgrimageOffers from "../pages/customer/travel/Pilgrimage/AllPilgrimageOffers";
import PilgrimageDetails from "../pages/customer/travel/Pilgrimage/PilgrimageDetails";
import VacationDetails from "../pages/customer/travel/Vacation/VacationDetails";
import StudyAbroadLoanPage from "../pages/customer/edufinance/Study";
import CivilServantLoanPage from "../pages/customer/edufinance/CivilServant";
import EuropianCitizenshipListPage from "../pages/customer/citizenship/European";
import BuyAirtime from "../pages/customer/valueServices/AirtimeAndBills/Airtime";
import PayUtilityBill from "../pages/customer/valueServices/AirtimeAndBills/UtilityBill";
import CableAndInternetRenewal from "../pages/customer/valueServices/AirtimeAndBills/CableAndInternet";
import DataBundleSubscription from "../pages/customer/valueServices/AirtimeAndBills/DataBundle";
import EducationFeePayment from "../pages/customer/valueServices/AirtimeAndBills/EducationFees";
import AirtimeAndBillsHome from "../pages/customer/valueServices/AirtimeAndBills";
import VisaAndTravelHome from "../pages/customer/valueServices/VisaAndTravel";
import EducationServicesHome from "../pages/customer/valueServices/EducationServices";
import ReferralPage from "../pages/customer/referral";
import CbiDashboard from "../pages/staff/marketplace/CbiPage";
import EduFinanceDashboard from "../pages/staff/marketplace/EduFinanceCivilServantLoanPage";
import EuropeanCitizenshipForm from "../pages/customer/citizenship/European/EuropeanCitizenshipDetails";
import AllWorkVisaApplication from "../pages/customer/travel/WorkVisa/AllWorkVisaApplication";
import SupportTicket from "../pages/customer/helpcenter/SupportTicket";
import KnowledgeBasePage from "../pages/customer/helpcenter/KnowledgeBased";
import NotificationSettingsPage from "../pages/customer/accountsettings/Notifications";
import SettingsPage from "../pages/customer/accountsettings/SettingsPage";
import LiveChatWithAgent from "../pages/customer/helpcenter/LiveChatWithAgent";

// Public routes (unauthenticated)
export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: "/",
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
];

// Protected routes (authenticated users)
export const protectedRoutes: RouteObject[] = [
  // Staff routes at top-level to prevent auto-redirect to dashboard
  {
    path: "staff",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Only redirect /staff to /staff/dashboard if at index (first load)
      { index: true, element: <Navigate to="dashboard" replace /> },

      { path: "dashboard", element: <AgentDashboard /> },
      { path: "analytics", element: <PerformanceAnalytics /> },
      { path: "usage-summary", element: <ServiceUsageSummary /> },

      { path: "clients", element: <ClientsPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "clients/new", element: <NewClient /> },
      { path: "clients/documents", element: <DocumentsPage /> },
      { path: "clients/assign", element: <AssignTeamsPage /> },
      { path: "clients/notes", element: <NotesRemindersPage /> },
      { path: "clients/contact", element: <ContactClientPage /> },

      { path: "applications/study", element: <StudyAbroadPage /> },
      { path: "applications/visa", element: <VisaApplicationsPage /> },
      { path: "applications/exams", element: <ExamRegistrationsPage /> },
      { path: "applications/orders", element: <OrdersPage /> },
      { path: "applications/property", element: <PropertyInterestsPage /> },
      { path: "applications/documents", element: <DocumentsLegalPage /> },

      { path: "services/study", element: <StudyServicePage /> },
      { path: "services/visa", element: <VisaServicePage /> },
      { path: "services/exams", element: <ExamServicePage /> },
      { path: "services/assets", element: <AssetsServicePage /> },
      { path: "services/property", element: <PropertyServicePage /> },
      { path: "services/business", element: <BusinessBrandingServicePage /> },
      { path: "services/legal", element: <LegalDocumentsServicePage /> },
      { path: "services/loans", element: <LoansServicePage /> },

      { path: "transactions/payments", element: <PaymentsPage /> },
      { path: "transactions/commissions", element: <CommissionsPage /> },
      { path: "transactions/withdrawals", element: <WithdrawalsPage /> },
      { path: "transactions/invoices", element: <InvoicesReceiptsPage /> },
      { path: "transactions/rewards", element: <RewardsTiersPage /> },

      { path: "marketplace/listings", element: <MarketplaceListingsPage /> },
      { path: "marketplace/new", element: <AddListingPage /> },
      { path: "marketplace/stock", element: <StockManagementPage /> },
      { path: "marketplace/chat", element: <ChatManagementPage /> },
      { path: "marketplace/cbi", element: <CbiDashboard /> },
      {
        path: "marketplace/edufinaceandloan",
        element: <EduFinanceDashboard />,
      },

      { path: "training/videos", element: <VideoTutorialsPage /> },
      { path: "training/templates", element: <TemplatesPage /> },
      { path: "training/catalogs", element: <DigitalCatalogsPage /> },
      { path: "training/scripts", element: <SalesScriptsPage /> },
      { path: "training/playbook", element: <AgentPlaybookPage /> },

      {
        path: "notifications/alerts",
        element: <StaffPlaceholderPage title="Visa Alerts & Deadlines" />,
      },
      {
        path: "notifications/broadcasts",
        element: <StaffPlaceholderPage title="Broadcasts" />,
      },
      {
        path: "notifications/campaigns",
        element: <StaffPlaceholderPage title="Campaigns" />,
      },
      {
        path: "notifications/badges",
        element: <StaffPlaceholderPage title="Badges" />,
      },

      {
        path: "support/tickets",
        element: <StaffPlaceholderPage title="Support Tickets" />,
      },
      {
        path: "support/chat",
        element: <StaffPlaceholderPage title="Live Chat & Email" />,
      },
      {
        path: "support/kb",
        element: <StaffPlaceholderPage title="Knowledge Base" />,
      },

      {
        path: "settings/profile",
        element: <StaffPlaceholderPage title="Profile & Company" />,
      },
      { path: "settings/kyc", element: <StaffPlaceholderPage title="KYC" /> },
      {
        path: "settings/staff",
        element: <StaffPlaceholderPage title="Staff" />,
      },
      {
        path: "settings/notifications",
        element: <StaffPlaceholderPage title="Notification Preferences" />,
      },
      {
        path: "settings/bank",
        element: <StaffPlaceholderPage title="Bank Details" />,
      },
      {
        path: "settings/upgrade",
        element: <StaffPlaceholderPage title="Upgrade Tier" />,
      },

      {
        path: "advanced/ai",
        element: <StaffPlaceholderPage title="AI Assistant" />,
      },
      {
        path: "advanced/matching",
        element: <StaffPlaceholderPage title="Smart Matching" />,
      },
      {
        path: "advanced/white-label",
        element: <StaffPlaceholderPage title="White-Label" />,
      },
      {
        path: "advanced/export",
        element: <StaffPlaceholderPage title="Bulk Data Export" />,
      },
      {
        path: "advanced/training-tracker",
        element: <StaffPlaceholderPage title="Training Tracker" />,
      },
      {
        path: "advanced/leaderboard",
        element: <StaffPlaceholderPage title="Sales Leaderboard" />,
      },
    ],
  },
  // Customer routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Only redirect / to /dashboard for authenticated customers if at index (first load)
      { index: true, element: <Navigate to="dashboard" replace /> },

      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/edit",
        element: <CustomerProfileSetup />,
      },
      {
        path: "travel/book-flight",
        element: <FlightListPage />,
      },
      // Register customer placeholder routes
      {
        path: "travel/study-visa",
        element: <ApplyStudyVisa />,
      },
      {
        path: "travel/study-visa/offers",
        element: <AllStudyOffers />,
      },
      {
        path: "travel/study-visa/applications",
        element: <AllStudyVisaApplication />,
      },

      {
        path: "travel/study-visa/offer/:id",
        element: <StudyVisaDetails />,
      },
      {
        path: "travel/study-visa/continue/:id",
        element: <StudyVisaApplicationForm />,
      },
      {
        path: "travel/work-visa",
        element: <ApplyWorkVisa />,
      },
      {
        path: "travel/work-visa/countries-jobs",
        element: <CountriesJob />,
      },
      {
        path: "travel/work-visa/countries-jobs/:id",
        element: <JobDetails />,
      },
      {
        path: "travel/work-visa/offer/:id",
        element: <JobDetails />,
      },
      
      {
        path: "travel/work-visa/applications",
        element: <AllWorkVisaApplication />,

      },
      {
        path: "travel/work-visa/schedule-interview",
        element: <ScheduleInterview />,
      },
      {
        path: "travel/work-visa/submit-cv",
        element: <SubmitCV />,
      },
      {
        path: "travel/work-visa/track-progress",
        element: <TrackProgress />,
      },
      {
        path: "track-progress",
        element: <TrackProgress />,
      },
      {
        path: "travel/pilgrimage",
        element: <ApplyPilgrimageVisa />,
      },
      {
        path: "travel/pilgrimage/offers",
        element: <AllPilgrimageOffers />,
      },
      {
        path: "travel/pilgrimage/offers/:id",
        element: <PilgrimageDetails />,
      },
      {
        path: "travel/vacation",
        element: <VacationPage />,
      },
      {
        path: "travel/vacation/:id",
        element: <VacationDetails />,
      },
      {
        path: "travel/hotel-reservation",
        element: <HotelReservation />,
      },
      {
        path: "edufinance/study-abroad-loan",
        element: <StudyAbroadLoanPage />,
      },
      {
        path: "edufinance/civil-servant-loan",
        element: <CivilServantLoanPage />,
      },
      {
        path: "edufinance/parent-loan",
        element: <CustomerPlaceholderPage title="Parent/Guardian Loan" />,
      },
      {
        path: "edufinance/personal-loan",
        element: <CustomerPlaceholderPage title="Personal Loan" />,
      },
      {
        path: "edufinance/business-loan",
        element: <CustomerPlaceholderPage title="Business Loan" />,
      },
      {
        path: "citizenship/europe",
        element: <EuropianCitizenshipListPage />,
      },
      {
        path: "citizenship/europe/apply/:id",
        element: <EuropeanCitizenshipForm />,
      },
      {
        path: "citizenship/investment-plan",
        element: <CustomerPlaceholderPage title="Investment Plan" />,
      },
      {
        path: "value-added/gift-cards",
        element: <CustomerPlaceholderPage title="Gift Cards" />,
      },
      {
        path: "services/airtime",
        element: <BuyAirtime />,
      },
      {
        path: "services/airtime-and-bills",
        element: <AirtimeAndBillsHome />,
      },
      {
        path: "services/visa-and-travel",
        element: <VisaAndTravelHome />,
      },
      {
        path: "services/education-services",
        element: <EducationServicesHome />,
      },
      {
        path: "services/bills",
        element: <PayUtilityBill />,
      },
      {
        path: "services/cable-internet",
        element: <CableAndInternetRenewal />,
      },
      {
        path: "services/data-bundle",
        element: <DataBundleSubscription />,
      },
      {
        path: "services/education-fees",
        element: <EducationFeePayment />,
      },
      {
        path: "value-added/cv-builder",
        element: <CVBuilder />,
      },
      {
        path: "referrals",
        element: <ReferralPage />,
      },
      {
        path: "support/tickets",
        element: <SupportTicket />,
      },
      {
        path: "support/chat",
        element: <LiveChatWithAgent />,
      },
      {
        path: "support/kb",
        element: <KnowledgeBasePage/>,
      },
      {
        path: "settings/notifications",
        element: <NotificationSettingsPage />,
      },
      {
        path: "settings/support",
        element: <CustomerPlaceholderPage title="Help & Support" />,
      },
      {
        path: "settings/advanced",
        element: <SettingsPage  />,
      },
      {
        path: "settings/profile",
        element: <ProfilePage />,
      },
      {
        path: "profile-setup",
        element: <CustomerProfileSetup />,
      },
    ],
  },
];
