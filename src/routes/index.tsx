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
import { ResetPassword } from "../pages/auth/ResetPassword";
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
import InvestmentPlanPage from "../pages/customer/citizenship/InvestmentPlan";
import StudyLoanDetails from "../pages/customer/edufinance/Study/StudyLoanDetails";
import SavingPlan from "../pages/customer/dashboard/SavingPlan";
import EditProfilePage from "../pages/customer/accountsettings/EditProfile";
import GenericApplicationForm from "../pages/customer/travel/GenericApplication";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import UserManagement from "../pages/admin/users/UserManagement";
import RolesPermissions from "../pages/admin/users/RolesPermissions";
import SystemSettings from "../pages/admin/system/SystemSettings";
import AdminAnalytics from "../pages/admin/dashboard/Analytics";
import ContentManagement from "../pages/admin/content/ContentManagement";
import FinancialManagement from "../pages/admin/finance/FinancialManagement";
import SecurityLogs from "../pages/admin/system/SecurityLogs";
import AllApplications from "../pages/admin/applications/AllApplications";
import StudyApplications from "../pages/admin/applications/StudyApplications";
import VisaApplications from "../pages/admin/applications/VisaApplications";
import WorkVisaApplications from "../pages/admin/applications/WorkVisaApplications";
import AllServices from "../pages/admin/services/AllServices";
import StudyServices from "../pages/admin/services/StudyServices";
import VisaServices from "../pages/admin/services/VisaServices";
import LoanServices from "../pages/admin/services/LoanServices";
import AirtimeDataManagement from "../pages/admin/services/AirtimeDataManagement";
import LandingPageCustomizer from "../pages/admin/landing/LandingPageCustomizer";
import HotelsManagement from "../pages/admin/travel/HotelsManagement";
import HotelBookingsManagement from "../pages/admin/travel/HotelBookingsManagement";
import FlightBookingsManagement from "../pages/admin/travel/FlightBookingsManagement";
import SupportTicketsManagement from "../pages/admin/support/SupportTicketsManagement";
import FAQManagement from "../pages/admin/support/FAQManagement";
import { WalletsManagement } from "../pages/admin/finance/Wallets";
import PaymentsManagement from "../pages/admin/finance/Payments";
import RevenueReport from "../pages/admin/finance/RevenueReport";

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
    // Backend sends links: /reset-password/:uid/:token/
    path: "/reset-password/:uid/:token",
    element: (
      <AuthLayout>
        <ResetPassword />
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
        element: <StaffPlaceholderPage title="Visa Alerts & Deadlines" icon="🔔"
          comingFeatures={["Automated deadline reminders for visa applications","Priority alerts for expiring documents","Customisable alert thresholds per client"]} />,
      },
      {
        path: "notifications/broadcasts",
        element: <StaffPlaceholderPage title="Broadcasts" icon="📢"
          comingFeatures={["Send announcements to all clients or segments","Schedule broadcast campaigns","Track open and engagement rates"]} />,
      },
      {
        path: "notifications/campaigns",
        element: <StaffPlaceholderPage title="Campaigns" icon="📣"
          comingFeatures={["Build email & SMS marketing campaigns","Target clients by visa type, region, or status","Campaign performance analytics"]} />,
      },
      {
        path: "notifications/badges",
        element: <StaffPlaceholderPage title="Badges & Rewards" icon="🏅"
          comingFeatures={["Award milestone badges to high-performing agents","Gamified achievement system","Leaderboard integration"]} />,
      },

      {
        path: "support/tickets",
        element: <StaffPlaceholderPage title="Support Tickets" icon="🎫"
          comingFeatures={["View and respond to client support tickets","Priority routing and SLA tracking","Ticket history and resolution notes"]} />,
      },
      {
        path: "support/chat",
        element: <StaffPlaceholderPage title="Live Chat & Email" icon="💬"
          comingFeatures={["Real-time chat with clients from the portal","Shared inbox for team email management","Chat transcripts and handoff between agents"]} />,
      },
      {
        path: "support/kb",
        element: <StaffPlaceholderPage title="Knowledge Base" icon="📚"
          comingFeatures={["Publish help articles and FAQs for clients","Internal staff documentation hub","Search-optimised knowledge base editor"]} />,
      },

      {
        path: "settings/profile",
        element: <StaffPlaceholderPage title="Profile & Company" icon="🏢"
          comingFeatures={["Update your agency profile and branding","Upload company logo and contact details","Manage public-facing agency page"]} />,
      },
      { path: "settings/kyc", element: <StaffPlaceholderPage title="KYC Verification" icon="🪪"
          comingFeatures={["Submit identity documents for KYC","Track verification status in real time","Receive instant approval notifications"]} /> },
      {
        path: "settings/staff",
        element: <StaffPlaceholderPage title="Staff Management" icon="👥"
          comingFeatures={["Add and manage sub-agents and staff","Set roles and access permissions","Monitor staff activity and performance"]} />,
      },
      {
        path: "settings/notifications",
        element: <StaffPlaceholderPage title="Notification Preferences" icon="🔕"
          comingFeatures={["Choose which events trigger notifications","Set email, SMS, or in-app preferences","Manage quiet hours and digest mode"]} />,
      },
      {
        path: "settings/bank",
        element: <StaffPlaceholderPage title="Bank Details" icon="🏦"
          comingFeatures={["Add and verify your bank account for payouts","Support for multiple bank accounts","Instant payout configuration"]} />,
      },
      {
        path: "settings/upgrade",
        element: <StaffPlaceholderPage title="Upgrade Your Tier" icon="⬆️"
          comingFeatures={["View available agent tier plans","Unlock premium features and higher commissions","One-click tier upgrade with payment"]} />,
      },

      {
        path: "advanced/ai",
        element: <StaffPlaceholderPage title="AI Assistant" icon="🤖"
          comingFeatures={["AI-powered client matching and visa recommendations","Smart document review and error detection","Automated follow-up message generation"]} />,
      },
      {
        path: "advanced/matching",
        element: <StaffPlaceholderPage title="Smart Matching" icon="🎯"
          comingFeatures={["Auto-match clients to the best visa or study programmes","Scoring based on profile completeness and eligibility","Bulk matching for your entire client base"]} />,
      },
      {
        path: "advanced/white-label",
        element: <StaffPlaceholderPage title="White-Label Portal" icon="🏷️"
          comingFeatures={["Custom branded portal for your agency","Your domain, logo, and colour scheme","Separate client login experience"]} />,
      },
      {
        path: "advanced/export",
        element: <StaffPlaceholderPage title="Bulk Data Export" icon="📤"
          comingFeatures={["Export all client and application data to CSV/Excel","Scheduled auto-exports to email","Filtered exports by date, status, or type"]} />,
      },
      {
        path: "advanced/training-tracker",
        element: <StaffPlaceholderPage title="Training Tracker" icon="🎓"
          comingFeatures={["Track completion of required training modules","Certificates and badges for completed courses","Manager view of team training progress"]} />,
      },
      {
        path: "advanced/leaderboard",
        element: <StaffPlaceholderPage title="Sales Leaderboard" icon="🏆"
          comingFeatures={["Real-time agent performance rankings","Monthly and all-time commission leaderboards","Milestone rewards and recognition"]} />,
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
        path: "dashboard/savings-plan",
        element: <SavingPlan />,
      },
      
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/edit",
        element: <EditProfilePage />,
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
        path: "edufinance/study-abroad-loan/offers/:id",
        element: <StudyLoanDetails />,
      },
      {
        path: "edufinance/civil-servant-loan",
        element: <CivilServantLoanPage />,
      },
      {
        path: "edufinance/parent-loan",
        element: <CustomerPlaceholderPage title="Parent/Guardian Loan" icon="👨‍👩‍👧"
          description="Flexible loan options for parents and guardians financing their child's education abroad."
          comingFeatures={["Tailored repayment plans for parents and guardians","Fast approval linked to student's admission letter","Low interest rates with flexible tenors"]} />,
      },
      {
        path: "edufinance/personal-loan",
        element: <CustomerPlaceholderPage title="Personal Loan" icon="💼"
          description="Quick personal loans to support your travel, study, or business goals."
          comingFeatures={["No collateral required for qualifying applicants","Instant approval decisions","Disbursement directly to your wallet or bank"]} />,
      },
      {
        path: "edufinance/business-loan",
        element: <CustomerPlaceholderPage title="Business Loan" icon="🏗️"
          description="Grow your business with affordable, flexible business financing."
          comingFeatures={["Loans from ₦500k to ₦50M for SMEs","Business credit scoring and fast underwriting","Dedicated relationship manager"]} />,
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
        element: <InvestmentPlanPage />,
      },
      {
        path: "value-added/gift-cards",
        element: <CustomerPlaceholderPage title="Gift Cards" icon="🎁"
          description="Send and receive gift cards for travel, education, and premium services."
          comingFeatures={["Buy and send gift cards instantly","Redeem gift cards on any GrazConcept service","Track gift card balance and history"]} />,
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
        element: <CustomerPlaceholderPage title="Help & Support" icon="🆘"
          description="Get help with your account, applications, and payments — all in one place."
          comingFeatures={["Integrated ticketing with real-time status updates","Live chat with a GrazConcept agent","AI-powered FAQ and self-service tools"]} />,
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
        path: "settings/profile/edit",
        element: <EditProfilePage />,
      },
      {
        path: "apply",
        element: <GenericApplicationForm />,
      },
      {
        path: "profile-setup",
        element: <CustomerProfileSetup />,
      },

      // ── Financial Hub ────────────────────────────────────────────────────────
      {
        path: "finance/travel-now-pay-later",
        element: <CustomerPlaceholderPage title="Travel Now, Pay Later" icon="🛫"
          description="Book your trip today and spread the cost over time with flexible installment plans."
          comingFeatures={["0% interest installment plans for eligible travellers","Instant approval with no collateral","Covers flights, hotels, visas, and travel packages"]} />,
      },
      {
        path: "finance/investment-circle",
        element: <CustomerPlaceholderPage title="Investment Circle" icon="🤝"
          description="Join a trusted community savings and investment circle to fund your travel goals together."
          comingFeatures={["Create or join investment circles with friends and family","Automated contributions and payouts","Real-time circle balance and member tracking"]} />,
      },
      {
        path: "finance/cross-border-payments",
        element: <CustomerPlaceholderPage title="Cross-Border Payments" icon="💸"
          description="Send and receive money internationally at competitive exchange rates — fast and secure."
          comingFeatures={["Send money to 50+ countries in minutes","Live exchange rate tracking","Bank transfers, mobile wallets, and cash pickup"]} />,
      },

      // ── Learning Hub ─────────────────────────────────────────────────────────
      {
        path: "learn/tech",
        element: <CustomerPlaceholderPage title="Learn Tech, Work Globally" icon="💻"
          description="Upskill in technology and land remote or international jobs with globally recognised certifications."
          comingFeatures={["Courses in software, data, cloud, and AI","Globally recognised certificates and badges","Job placement support and career coaching"]} />,
      },
      {
        path: "learn/language",
        element: <CustomerPlaceholderPage title="Language for Abroad Jobs" icon="🗣️"
          description="Master the language you need for your destination country — from beginner to job-ready."
          comingFeatures={["English, French, German, Arabic, and more","Live tutoring sessions with native speakers","IELTS, DELF, and Goethe exam preparation"]} />,
      },
      {
        path: "learn/vocational",
        element: <CustomerPlaceholderPage title="Vocational Skills" icon="🔧"
          description="Learn practical, in-demand trades that open doors to international work visas and employment."
          comingFeatures={["Carpentry, plumbing, welding, healthcare, and more","Hands-on certifications recognised abroad","Partner institutions in the UK, Canada, and Germany"]} />,
      },
      {
        path: "learn/certifications",
        element: <CustomerPlaceholderPage title="Certifications & Qualifications" icon="🏅"
          description="Earn professional certifications that boost your eligibility for work and study visas."
          comingFeatures={["PMP, CISSP, AWS, and 100+ professional certs","Self-paced and instructor-led study tracks","Digital credential wallet linked to your profile"]} />,
      },
      {
        path: "learn/webinars",
        element: <CustomerPlaceholderPage title="Career Webinars" icon="📅"
          description="Join live and recorded webinars hosted by immigration lawyers, employers, and global career coaches."
          comingFeatures={["Weekly live sessions on visa tips and job markets","Q&A with real immigration and career experts","Replay library of past sessions"]} />,
      },

      // ── Other Hubs ───────────────────────────────────────────────────────────
      {
        path: "hubs/events",
        element: <CustomerPlaceholderPage title="Global Event Services" icon="🎉"
          description="Plan and attend global events — from international conferences to destination weddings and cultural festivals."
          comingFeatures={["Event visa assistance and travel coordination","Corporate event planning for international summits","Personalised destination event packages"]} />,
      },
      {
        path: "hubs/branding",
        element: <CustomerPlaceholderPage title="Business Branding" icon="📢"
          description="Build a powerful brand identity for your business or agency with professional creative services."
          comingFeatures={["Logo, identity design, and brand guidelines","Social media content and digital marketing","Branded pitch decks and marketing materials"]} />,
      },
      {
        path: "hubs/franchise-media",
        element: <CustomerPlaceholderPage title="Franchise & Media" icon="📺"
          description="Explore franchise opportunities and media production services for African businesses going global."
          comingFeatures={["GrazConcept franchise licensing for travel agencies","Podcast, video, and content production","PR and media placement for global visibility"]} />,
      },
    ],
  },
  // Admin routes
  {
    path: "admin",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "users", element: <UserManagement /> },
      { path: "users/customers", element: <UserManagement /> },
      { path: "users/staff", element: <UserManagement /> },
      { path: "users/admins", element: <UserManagement /> },
      { path: "users/permissions", element: <RolesPermissions /> },
      { path: "financial", element: <FinancialManagement /> },
      { path: "financial/wallets", element: <WalletsManagement /> },
      { path: "financial/payments", element: <PaymentsManagement /> },
      { path: "financial/reports", element: <RevenueReport /> },
      { path: "landing", element: <LandingPageCustomizer /> },
      { path: "content", element: <ContentManagement /> },
      { path: "content/articles", element: <CustomerPlaceholderPage title="Articles & Blog" icon="📝"
          description="Publish and manage blog articles, travel guides, and visa tips for your users."
          comingFeatures={["Rich text editor with media uploads","SEO metadata and tagging","Schedule and publish articles"]} /> },
      { path: "content/campaigns", element: <CustomerPlaceholderPage title="Campaigns" icon="📣"
          description="Create and manage marketing campaigns across email, SMS, and push."
          comingFeatures={["Drag-and-drop campaign builder","Audience segmentation and targeting","Performance reports and A/B testing"]} /> },
      { path: "applications", element: <AllApplications /> },
      { path: "applications/study", element: <StudyApplications /> },
      { path: "applications/visa", element: <VisaApplications /> },
      { path: "applications/work-visa", element: <WorkVisaApplications /> },
      { path: "services", element: <AllServices /> },
      { path: "services/study", element: <StudyServices /> },
      { path: "services/visa", element: <VisaServices /> },
      { path: "services/loans", element: <LoanServices /> },
      { path: "services/airtime-data", element: <AirtimeDataManagement /> },
      { path: "travel/hotels", element: <HotelsManagement /> },
      { path: "travel/hotel-bookings", element: <HotelBookingsManagement /> },
      { path: "travel/flight-bookings", element: <FlightBookingsManagement /> },
      { path: "support/tickets", element: <SupportTicketsManagement /> },
      { path: "support/faq", element: <FAQManagement /> },
      { path: "settings", element: <SystemSettings /> },
      { path: "security", element: <SecurityLogs /> },
      { path: "system/health", element: <CustomerPlaceholderPage title="System Health" icon="🩺"
          description="Monitor platform uptime, API response times, and service availability."
          comingFeatures={["Real-time service status dashboard","Incident history and resolution logs","Automated alerting for outages"]} /> },
      { path: "system/notifications", element: <CustomerPlaceholderPage title="System Notifications" icon="📬"
          description="Manage and review all platform-wide system notifications and alerts."
          comingFeatures={["Broadcast system alerts to all users","Configure maintenance windows","Notification delivery audit log"]} /> },
    ],
  },
];
