import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  // Chat,
  AirplaneTicket,
  Hotel,
  School,
  Savings,
  // DirectionsCar,
  // Attractions,
  // LocalTaxi,
} from "@mui/icons-material";
import { CustomerPageHeader } from '../../../components/CustomerPageHeader';
import { ActionCard } from '../../../components/ActionCard/DasboardActionButton';
import { ImageCard } from '../../../components/ImageCard';
import { actionForms } from '../../../components/modals/ActionForms';
import { submitActionForm } from '../../../services/actionFormService';
import { toast } from 'react-toastify';
import { getAddBanners } from '../../../services/studyVisa';

const FundWalletModalContent = ({ user }: { user: any }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
      Fund Your Wallet
    </Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Please use the account details below to fund your wallet.
    </Typography>
    <Divider sx={{ my: 2 }} />
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Account Name
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {user?.first_name} {user?.last_name}
      </Typography>
    </Box>
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Account Number
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        1234567890
      </Typography>
    </Box>
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Bank Name
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Example Bank
      </Typography>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Typography variant="caption" color="text.secondary">
      Transfers to this account will be credited to your wallet automatically.
    </Typography>
  </Box>
);

// Map action label to result page route
const actionResultRoutes: Record<string, string> = {
  "Book Flight": "/dashboard/flight-result",
  "Reserve Hotel": "/travel/hotel-reservation",
  "Apply for Visa": "/travel/study-visa",
  "Chat with Agent": "/customer/dashboard/chat-result",
  "Create Savings Plan": "/customer/dashboard/savings-result",
  "Apply for Study Loan": "/customer/dashboard/study-loan-result",
  "Study Abroad Loan": "/customer/dashboard/study-abroad-loan-result",
  "Pilgrimage Package": "/customer/dashboard/pilgrimage-result",
  "Business Loan for Travel Project": "/customer/dashboard/business-loan-result",
  "Car Rentals": "/customer/dashboard/car-rentals-result",
  "Attractions": "/customer/dashboard/attractions-result",
  "Airport Taxis": "/customer/dashboard/airport-taxis-result",
  // Add more as needed
  "Study Visa Offers": "/travel/study-visa/offers",
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  console.log(isXs, isSm);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalLabel, setModalLabel] = useState<string | null>(null);

  // Fund Wallet modal state
  const [openFundWallet, setOpenFundWallet] = useState(false);

  // Form state for modal forms
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Banner state
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingBanners(true);
    getAddBanners()
      .then((data: any) => {
        // The API returns an object with a "results" array
        if (mounted) {
          if (data && Array.isArray(data.results)) {
            setBanners(data.results);
          } else {
            setBanners([]);
          }
        }
      })
      .catch(() => {
        if (mounted) setBanners([]);
      })
      .finally(() => {
        if (mounted) setLoadingBanners(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // New: All uncommented action cards navigate directly to their respective pages
  const handleActionClick = (label: string) => {
    // Map the label to the correct route
    let route: string | undefined;
    switch (label) {
      case "Book Flight":
        route = "/dashboard/flight-result";
        break;
      case "Reserve Hotel":
        route = "/travel/hotel-reservation";
        break;
      case "Study Visa":
        route = "/travel/study-visa";
        break;
      case "Work Visa":
        route = "/travel/work-visa";
        break;
      case "Vacation":
        route = "/travel/vacation";
        break;
      case "Create Savings Plan":
        route = "/customer/dashboard/savings-result";
        break;
      case "Study Visa Offers":
        route = "/travel/study-visa/offers";
        break;
      default:
        // fallback to modal for unknown actions (for banners, etc)
        setModalLabel(label);
        setFormState({});
        setOpenModal(true);
        return;
    }
    navigate(route);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalLabel(null);
    setFormState({});
  };

  const handleOpenFundWallet = () => {
    setOpenFundWallet(true);
  };

  const handleCloseFundWallet = () => {
    setOpenFundWallet(false);
  };

  // Handle form submit: call API, then navigate to result page with response
  const handleModalSubmit = async () => {
    if (!modalLabel) return;
    setSubmitting(true);
    try {
      // Call the API service with the form data and action label
      const response = await submitActionForm(modalLabel, formState);

      // Determine the result page route
      const resultRoute = actionResultRoutes[modalLabel];
      if (resultRoute) {
        // Pass the response data to the result page via state
        navigate(resultRoute, { state: { result: response, action: modalLabel } });
      } else {
        // Fallback: just close modal if no route is defined
        setOpenModal(false);
      }
      toast.success("Submission successful!");
    } catch (error: any) {
      // Use react-toastify for error display
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      setOpenModal(false);
      setModalLabel(null);
      setFormState({});
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Welcome Header */}
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Welcome, {user?.first_name}!
        </Typography>
      </CustomerPageHeader>

      {/* Top Section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        {/* Wallet Section */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 41.6667%', md: '0 0 25%' },
            width: { xs: '100%', sm: '41.6667%', md: '25%' },
            minWidth: 0,
          }}
        >
          <Card sx={{ borderRadius: 1, boxShadow: 2, bgcolor: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Avatar sx={{ bgcolor: "#f43f5e" }}>A</Avatar>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={handleOpenFundWallet}
                  tabIndex={0}
                  role="button"
                  aria-label="Fund wallet"
                >
                  Fund wallet
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>
                Travel Wallet
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                ₦125,000.00
              </Typography>
              <Box mt={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recent Transactions
                </Typography>
                <Box display="flex" justifyContent="space-between" fontSize="0.95rem" mt={1}>
                  <span>Flight to Accra</span>
                  <span>#25.00</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontSize="0.95rem">
                  <span>Saving deposit</span>
                  <span>#25.00</span>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 58.3333%', md: '0 0 75%' },
            width: { xs: '100%', sm: '58.3333%', md: '75%' },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)', // 3 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on small screens
                md: 'repeat(5, 1fr)', // 9 columns on medium and up
              },
              gap: 1.5,
            }}
          >
            <ActionCard icon={<AirplaneTicket />} label="Book Flight" onClick={() => handleActionClick("Book Flight")} />
            <ActionCard icon={<Hotel />} label="Reserve Hotel" onClick={() => handleActionClick("Reserve Hotel")} />
            <ActionCard icon={<School />} label="Apply Study Program" onClick={() => handleActionClick("Study Visa")} />
            <ActionCard icon={<School />} label="Search Study Program" onClick={() => handleActionClick("Study Visa Offers")} />
            <ActionCard icon={<School />} label="Work Visa" onClick={() => handleActionClick("Work Visa")} />
            <ActionCard icon={<School />} label="Vacation" onClick={() => handleActionClick("Vacation")} />
            <ActionCard icon={<Savings />} label="Create Savings Plan" onClick={() => handleActionClick("Create Savings Plan")} />
            {/* <ActionCard icon={<Chat />} label="Chat with Agent" onClick={() => handleActionClick("Chat with Agent")} />
            <ActionCard icon={<School />} label="Apply for Study Loan" onClick={() => handleActionClick("Apply for Study Loan")} />
            <ActionCard icon={<DirectionsCar />} label="Car Rentals" onClick={() => handleActionClick("Car Rentals")} />
            <ActionCard icon={<Attractions />} label="Attractions" onClick={() => handleActionClick("Attractions")} />
            <ActionCard icon={<LocalTaxi />} label="Airport Taxis" onClick={() => handleActionClick("Airport Taxis")} /> */}
          </Box>
        </Box>
      </Stack>

      {/* Applications (Start a New Application) */}
      {!loadingBanners && banners && banners.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
            Start a New Application
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ mb: 2 }}
          >
            {banners.slice(0, 3).map((banner, idx) => (
              <Box sx={{ flex: 1 }} key={banner.id || idx}>
                <ImageCard
                  title={banner.title || banner.name || `Banner ${idx + 1}`}
                  onClick={() => {
                    if (banner.link_url) {
                      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
                    } else if (banner.onClick) {
                      banner.onClick();
                    } else if (banner.actionLabel) {
                      handleActionClick(banner.actionLabel);
                    } else {
                      toast.info("No action defined for this banner.");
                    }
                  }}
                  image={banner.image}
                />
              </Box>
            ))}
          </Stack>
        </>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          mt: 2,
        }}
      >
        {/* Left: More Actions and Suggestions */}
        <Box sx={{ flex: { xs: 'unset', md: 3 }, width: { xs: '100%', md: '75%' }, minWidth: 0 }}>
          
          <Box>
            {/* Suggestions */}
            <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
              You may be interested in?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Study Abroad Loan" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Business loan for travel project" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Car Rentals" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Attractions" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Airport Taxis" />
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Right: Help Section */}
        <Box
          sx={{
            flex: { xs: 'unset', md: 1 },
            width: { xs: '100%', md: 240 },
            minWidth: 0,
            mt: { xs: 3, md: 0 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 1,
              width: { xs: '100%', md: 240 },
              minWidth: 0,
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Need Help?
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <HelpButton text="Chat" />
              <HelpButton text="Call" />
              <HelpButton text="Raise Ticket" />
            </Box>
          </Paper>
        </Box>
      </Stack>

      {/* Modal for Fund Wallet */}
      <Dialog open={openFundWallet} onClose={handleCloseFundWallet} maxWidth="xs" fullWidth>
        <DialogTitle>Fund Wallet</DialogTitle>
        <DialogContent>
          <FundWalletModalContent user={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFundWallet} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for ActionCard */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modalLabel}
        </DialogTitle>
        <DialogContent>
          {modalLabel && actionForms(formState, setFormState)[modalLabel]
            ? actionForms(formState, setFormState)[modalLabel]
            : <Typography>No form available.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleModalSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SuggestionCard = ({ title }: { title: string }) => (
  <Card
    sx={{
      borderRadius: 1,
      boxShadow: 1,
      px: 3,
      py: 2,
      cursor: 'pointer',
      bgcolor: '#fdf2f8',
      '&:hover': { bgcolor: '#fce7f3' },
      transition: 'background 0.2s',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgb(219 39 119)' }}>
      {title}
    </Typography>
  </Card>
);

const HelpButton = ({ text }: { text: string }) => (
  <Button
    variant="outlined"
    sx={{
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'space-between',
      px: 2,
      py: 1,
      textTransform: 'none',
      borderColor: 'grey.300',
      fontWeight: 500,
      fontSize: { xs: '0.95rem', sm: '1rem' },
    }}
    fullWidth
  >
    {text} <span style={{ marginLeft: 'auto' }}> &gt; </span>
  </Button>
);