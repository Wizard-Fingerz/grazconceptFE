import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  Card,
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
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
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
import { getMyRecentWalletTransactions, getMyWalletbalance } from '../../../services/walletService';

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const FundWalletModalContent = ({ user }: { user: any }) => {
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  const ACCOUNT_NUMBER = "4000331192";

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCOUNT_NUMBER);
    setCopySnackbarOpen(true);
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setCopySnackbarOpen(false);
  };

  return (
    <Box>
      {/* <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Fund Your Wallet
      </Typography> */}
      <Typography variant="body2" sx={{ mb: 1 }}>
        {user?.first_name} {user?.last_name}, please use the account details below to fund your wallet.
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Account Name
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {/* {user?.first_name} {user?.last_name} */}
          GRAZLINKS ENTERPRISE - GRAZ TRAVEL& TOUR SERVICES
        </Typography>
      </Box>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Account Number
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {ACCOUNT_NUMBER}
          </Typography>
        </Box>
        <Tooltip title="Copy Account Number">
          <IconButton
            aria-label="copy account number"
            sx={{ ml: 1 }}
            size="small"
            onClick={handleCopy}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Bank Name
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Moniepoint MFB
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        After transferring to this account, please email your payment receipt to <b>peter.oluwole@grazconcept.com.ng</b> so your wallet balance can be updated.
      </Typography>

      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Account number copied to clipboard!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

// Map action label to result page route
const actionResultRoutes: Record<string, string> = {
  "Book Flight": "/dashboard/flight-result",
  "Reserve Hotel": "/travel/hotel-reservation",
  "Apply for Visa": "/travel/study-visa",
  "Chat with Agent": "/support/chat",
  "Create Savings Plan": "/dashboard/savings-plan",
  "Apply for Study Loan": "/customer/dashboard/study-loan-result",
  "Study Abroad Loan": "/customer/dashboard/study-abroad-loan-result",
  "Pilgrimage Package": "/customer/dashboard/pilgrimage-result",
  "Business Loan for Travel Project": "/customer/dashboard/business-loan-result",
  "Car Rentals": "/customer/dashboard/car-rentals-result",
  "Attractions": "/customer/dashboard/attractions-result",
  "Airport Taxis": "/customer/dashboard/airport-taxis-result",
  "Airtime and Data": "/services/airtime-and-bills",
  // Add more as needed
  "Study Visa Offers": "/travel/study-visa/offers",
};

// Util to compose a default description for a transaction if none is present
function getTransactionDescription(tx: any) {
  // If there is a description, use it
  if (tx.description && tx.description.trim().length > 0) return tx.description;

  // Compose sensible default
  // fallback for transaction_type display
  let txType = tx.transaction_type || tx.type;
  let readableType = "transaction";
  if (txType) {
    if (txType === "deposit" || txType === "credit") readableType = "Deposit";
    else if (txType === "withdrawal" || txType === "debit") readableType = "Withdrawal";
    else readableType = txType.charAt(0).toUpperCase() + txType.slice(1);
  }

  // Compose amount with sign
  // Removed unused 'sign' variable as it was declared but never used.

  // Currency
  const currency = tx.currency || "NGN";
  // Wallet or user email reference
  let userBrief = tx.wallet || tx.user || ""; // fallback: show whatever wallet string or user identifier
  if (typeof userBrief === "string" && userBrief.length > 0) {
    userBrief = userBrief.replace(/['"]/g, "").replace(/'s Wallet:? ?/, "");
    // takes email or name part
  } else {
    userBrief = "";
  }

  // Only show user if it exists
  let userClause = userBrief.length > 0 ? ` for ${userBrief}` : "";
  // Status
  let status = tx.status && tx.status !== "successful" ? ` (${tx.status})` : "";

  // Date: optional
  // Format: e.g. "Deposit of NGN 100.00 for adewale.oladiti@tech-u.edu.ng"
  return `${readableType} of ${currency} ${Math.abs(Number(tx.amount))}${userClause}${status}`;
}

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

  // Transactions modal state (for viewing all)
  const [openTransactionsModal, setOpenTransactionsModal] = useState(false);

  // Form state for modal forms
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Banner state
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Recent transactions state & loading state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState<{
    currency?: string,
    balance?: number
  }>({
    currency: user?.wallet?.currency,
    balance: user?.wallet?.balance
  });
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(true);
  const [walletBalanceError, setWalletBalanceError] = useState<string | null>(null);

  // Fetch wallet balance
  useEffect(() => {
    let mounted = true;
    setWalletBalanceLoading(true);
    setWalletBalanceError(null);
    getMyWalletbalance()
      .then((data: any) => {
        if (mounted) {
          if (data && typeof data === "object") {
            setWalletBalance({
              currency: data.currency,
              balance: data.balance
            });
          } else {
            setWalletBalance({
              currency: undefined,
              balance: undefined
            });
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setWalletBalanceError("Couldn't fetch wallet balance.");
          setWalletBalance({
            currency: undefined,
            balance: undefined
          });
        }
      })
      .finally(() => {
        if (mounted) setWalletBalanceLoading(false);
      });
    return () => { mounted = false; };
    // we only fetch on mount
    // eslint-disable-next-line
  }, []);

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

  // Fetch recent wallet transactions using useEffect so we can handle loading and error feedback
  useEffect(() => {
    let mounted = true;
    setTransactionsLoading(true);
    setTransactionsError(null);
    // getMyRecentWalletTransactions now must return a Promise
    Promise.resolve()
      .then(() => getMyRecentWalletTransactions())
      .then((data: any) => {
        if (mounted) {
          if (Array.isArray(data)) {
            setTransactions(data);
          } else if (data && Array.isArray(data.results)) {
            setTransactions(data.results); // in case API returns with {results: []}
          } else {
            setTransactions([]);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setTransactions([]);
          setTransactionsError("Failed to load recent transactions.");
        }
      })
      .finally(() => {
        if (mounted) setTransactionsLoading(false);
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
        route = "/travel/book-flight";
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
        route = "/dashboard/savings-plan";
        break;
      case "Study Visa Offers":
        route = "/travel/study-visa/offers";
        break;
      case "Raise Ticket":
        route = "/support/tickets";
        break;
      case "Chat":
        route = "/support/chat";
        break;
      case "Study Abroad Loan":
        route = "/edufinance/study-abroad-loan";
        break;
      case "Civil Servant Loan":
        route = "/edufinance/civil-servant-loan";
        break;
      case "Business loan for travel project":
        route = "/edufinance/business-loan";
        break;
      case "Investment Plan":
        route = "/citizenship/investment-plan";
        break;
      case "Edufinance":
        route = "/edufinance/study-abroad-loan";
        break;
      case "Airtime and Data":
        route = "/services/airtime-and-bills";
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

  // Modal for all transactions
  const handleOpenTransactionsModal = () => {
    setOpenTransactionsModal(true);
  };
  const handleCloseTransactionsModal = () => {
    setOpenTransactionsModal(false);
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
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 0, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Welcome Header */}
      {/* On md+ screens, show CustomerPageHeader. On mobile, show just the text. */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <CustomerPageHeader>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Welcome, {user?.first_name}!
          </Typography>
        </CustomerPageHeader>
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.2 }}>
          Welcome, {user?.first_name}!
        </Typography>
      </Box>

      {/* Top Section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        {/* Wallet Section */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 41.6667%', md: '0 0 33.3333%' }, // increased from 25% to 33.3333% on desktop
            width: { xs: '100%', sm: '41.6667%', md: '33.3333%' }, // increased from 25% to 33.3333% on desktop
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 6,
              bgcolor: 'linear-gradient(135deg, #132743 60%, #0072ff 100%)',
              background: 'linear-gradient(135deg,#132743 60%, #0072ff 100%)',
              color: 'white',
              width: '100%',
              minHeight: { xs: 140, sm: 180, md: 220 }, // Reduce height on mobile
              position: 'relative',
              overflow: 'hidden',
              pt: { xs: 1.5, sm: 3 },
              pb: { xs: 1.5, sm: 2.5 },
              px: { xs: 1.2, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Simulated "chip" and logo */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ xs: 1, sm: 2 }}>
              <Box
                sx={{
                  width: { xs: 26, sm: 40 },
                  height: { xs: 17, sm: 28 },
                  bgcolor: '#ffd700',
                  borderRadius: '8px',
                  boxShadow: 2,
                  ml: 0.5
                }}
              />
              <Avatar sx={{ bgcolor: "#f43f5e", width: { xs: 22, sm: 30 }, height: { xs: 22, sm: 30 }, fontWeight: 700, fontSize: { xs: 15, sm: 18 } }}>
                {(user?.first_name?.[0] || 'A').toUpperCase()}
              </Avatar>
            </Box>

            {/* Card "background" pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: -16, sm: -30 },
                right: { xs: -20, sm: -40 },
                width: { xs: 62, sm: 130 },
                height: { xs: 78, sm: 180 },
                bgcolor: 'rgba(255,255,255,0.07)',
                opacity: 0.38,
                borderRadius: '60%',
                zIndex: 0,
              }}
            />

            {/* Card Content: Wallet */}
            <Box sx={{ zIndex: 2, position: 'relative' }}>
              <Typography variant="overline" sx={{
                fontSize: { xs: '0.65rem', sm: '0.82rem', md: '0.88rem' }, // smaller on desktop
                textTransform: 'uppercase',
                letterSpacing: 1.2
              }}>
                Grazconcept Wallet
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0.2, sm: 1 }, mb: { xs: 0.2, sm: 0.5 } }}>
                {walletBalanceLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                    <Typography sx={{ ml: 1, color: "#fff" }} fontSize={{ xs: "0.86rem", sm: "0.97rem", md: "1.02rem" }}>
                      Fetching balance...
                    </Typography>
                  </>
                ) : walletBalanceError ? (
                  <Typography color="error" variant="body2" sx={{ color: "#ffd700", fontSize: { xs: "0.83rem", sm: "0.91rem", md: "0.95rem" } }}>{walletBalanceError}</Typography>
                ) : (
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: '#fff',
                      lineHeight: 1.23,
                      fontSize: { xs: '1.18rem', sm: '1.68rem', md: '1.93rem' } // reduced for desktop
                    }}
                  >
                    {walletBalance.currency} {Number(walletBalance.balance ?? 0).toLocaleString()}
                  </Typography>
                )}
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mt={{ xs: 1, sm: 2 }} mb={{ xs: 0.5, sm: 1 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.82, fontSize: { xs: '0.72rem', sm: '0.82rem', md: '0.88rem' } }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffd700',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    ml: { xs: 1, sm: 2 },
                    fontWeight: 500,
                    fontSize: { xs: '0.80rem', sm: '0.88rem', md: '0.88rem' }
                  }}
                  onClick={handleOpenFundWallet}
                  tabIndex={0}
                  role="button"
                  aria-label="Fund wallet"
                >
                  Fund Wallet
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: '#a9c8f4', fontSize: { xs: '0.68rem', sm: '0.77rem', md: '0.82rem' }, letterSpacing: 1.5 }}>
                  Virtual Card · {user?.wallet?.currency ?? walletBalance.currency ?? 'NGN'}
                </Typography>

                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    minWidth: 0,
                    py: { xs: 0.6, sm: 0.65 },
                    px: { xs: 1.1, sm: 2.0 },
                    fontSize: { xs: '0.75rem', sm: '0.88rem', md: '0.88rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    background: 'rgba(255,255,255,0.10)',
                    boxShadow: 'none',
                    color: '#fff',
                  }}
                  onClick={handleOpenTransactionsModal}
                  disabled={transactionsLoading || !!transactionsError}
                >
                  Transactions History
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 58.3333%', md: '0 0 65%' },
            width: { xs: '100%', sm: '58.3333%', md: '65%' },
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
            <ActionCard icon={<AirplaneTicket sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Book Flight" onClick={() => handleActionClick("Book Flight")} />
            <ActionCard icon={<Hotel sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Reserve Hotel" onClick={() => handleActionClick("Reserve Hotel")} />
            <ActionCard icon={<School sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Apply Study Program" onClick={() => handleActionClick("Study Visa")} />
            <ActionCard icon={<School sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Airtime and Data" onClick={() => handleActionClick("Airtime and Data")} />
            <ActionCard icon={<School sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Work Visa" onClick={() => handleActionClick("Work Visa")} />
            <ActionCard icon={<School sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Vacation" onClick={() => handleActionClick("Vacation")} />
            <ActionCard icon={<Savings sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Create Savings Plan" onClick={() => handleActionClick("Create Savings Plan")} />
            <ActionCard icon={<Savings sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Investment Plan" onClick={() => handleActionClick("Investment Plan")} />
            <ActionCard icon={<School sx={{ fontSize: { xs: 18, sm: 20 } }} />} label="Edufinance" onClick={() => handleActionClick("Edufinance")} />
            {/* <ActionCard icon={<Chat sx={{ fontSize: { xs: 18, sm: 28 } }} />} label="Chat with Agent" onClick={() => handleActionClick("Chat with Agent")} />
            <ActionCard icon={<School />} label="Apply for Study Loan" onClick={() => handleActionClick("Apply for Study Loan")} />
            <ActionCard icon={<DirectionsCar />} label="Car Rentals" onClick={() => handleActionClick("Car Rentals")} />
            <ActionCard icon={<Attractions />} label="Attractions" onClick={() => handleActionClick("Attractions")} />
            <ActionCard icon={<LocalTaxi />} label="Airport Taxis" onClick={() => handleActionClick("Airport Taxis")} /> */}
          </Box>
        </Box>
      </Stack>

      {/* Modal for All Transactions */}
      <Dialog
        open={openTransactionsModal}
        onClose={handleCloseTransactionsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>All Transactions</DialogTitle>
        <DialogContent dividers sx={{ px: 0, pb: 0 }}>
          {transactionsLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={22} />
              <Typography sx={{ ml: 1.5 }} color="text.secondary" fontSize="0.95rem">
                Loading...
              </Typography>
            </Box>
          ) : transactionsError ? (
            <Box py={2}>
              <Typography color="error" variant="body2">
                {transactionsError}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {transactions.map((tx: any) => (
                <ListItem
                  key={tx.id}
                  disableGutters
                  sx={{
                    px: 2, py: 0.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <ListItemText
                    primary={getTransactionDescription(tx)}
                    secondary={tx.date}
                    sx={{
                      span: { fontSize: '1rem', fontWeight: 500 },
                      '.MuiListItemText-secondary': { fontSize: '0.85rem', color: 'text.secondary' }
                    }}
                  />
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Typography
                      variant="body2"
                      sx={{
                        color: tx.amount < 0 ? "error.main" : "success.main",
                        fontWeight: 600,
                      }}
                    >
                      {tx.amount < 0 ? "-" : "+"}{tx.currency || (walletBalance.currency ?? 'NGN')} {Math.abs(tx.amount)}
                    </Typography>
                    {tx.type === "debit" || tx.transaction_type === "withdrawal" ? (
                      <Chip label="Debit" size="small" color="error" sx={{ mt: 0.2 }} />
                    ) : (
                      <Chip label="Credit" size="small" color="success" sx={{ mt: 0.2 }} />
                    )}
                  </Box>
                </ListItem>
              ))}
              {transactions.length === 0 && (
                <ListItem disableGutters>
                  <ListItemText primary="No transactions found." />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionsModal} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applications (Start a New Application) */}
      {!loadingBanners && banners && banners.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>
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
          mt: 1,
        }}
      >
        {/* Left: More Actions and Suggestions */}
        <Box sx={{ flex: { xs: 'unset', md: 3 }, width: { xs: '100%', md: '75%' }, minWidth: 0 }}>

          <Box>
            {/* Suggestions */}
            <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>
              You may be interested in?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard
                  title="Study Abroad Loan"
                  onClick={() => handleActionClick("Study Abroad Loan")}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard
                  title="Civil Servant Loan"
                  onClick={() => handleActionClick("Civil Servant Loan")}
                />
              </Box>
              {/* <Box sx={{ flex: 1 }}>
                <SuggestionCard 
                  title="Car Rentals" 
                  onClick={() => handleActionClick("Car Rentals")}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard 
                  title="Attractions" 
                  onClick={() => handleActionClick("Attractions")}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard 
                  title="Airport Taxis" 
                  onClick={() => handleActionClick("Airport Taxis")}
                />
              </Box> */}
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
              <HelpButton text="Chat" onClick={() => handleActionClick("Chat")} />
              {/* <HelpButton
                text="Call"
                onClick={() => {
                  const phoneNumber = "+234 700 800 8080";
                  // Copy to clipboard
                  navigator.clipboard.writeText(phoneNumber);
                  // You can show a toast/snackbar or an alert
                  alert(`Phone number ${phoneNumber} copied to clipboard!`);
                }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                +234 700 800 8080
              </Typography> */}
              <HelpButton text="Raise Ticket" onClick={() => handleActionClick("Raise Ticket")} />
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

const SuggestionCard = ({
  title,
  onClick,
}: {
  title: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) => (
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
    onClick={onClick}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgb(219 39 119)' }}>
      {title}
    </Typography>
  </Card>
);

const HelpButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => (
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
    onClick={onClick}
  >
    {text} <span style={{ marginLeft: 'auto' }}> &gt; </span>
  </Button>
);