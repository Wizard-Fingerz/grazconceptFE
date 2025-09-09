import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
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
  TextField,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Chat, AirplaneTicket, Hotel, School, Savings } from "@mui/icons-material";
import { CustomerPageHeader } from '../../../components/CustomerPageHeader';
import { CountrySelect } from '../../../components/CountrySelect';
import { ActionCard } from '../../../components/ActionCard/DasboardActionButton';
import { ImageCard } from '../../../components/ImageCard';


// --- Modal form content for each action, using CountrySelect where appropriate ---
const actionForms = (
  formState: Record<string, any>,
  setFormState: React.Dispatch<React.SetStateAction<Record<string, any>>>
): Record<string, React.ReactNode> => ({
  "Book Flight": (
    <>
      {/* Flight Type Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {["Round Trip", "One Way", "Multi-city"].map((type) => (
          <Button
            key={type}
            variant={formState.flightType === type ? "contained" : "outlined"}
            color={formState.flightType === type ? "primary" : "inherit"}
            onClick={() => {
              // If switching to Multi-city and it's not already set, initialize segments
              if (type === "Multi-city" && !Array.isArray(formState.multiCitySegments)) {
                setFormState((s) => ({
                  ...s,
                  flightType: type,
                  multiCitySegments: [
                    { from: "", to: "", departureDate: "" },
                    { from: "", to: "", departureDate: "" },
                  ],
                }));
              } else if (type !== "Multi-city") {
                setFormState((s) => {
                  // Remove multiCitySegments when switching away from Multi-city
                  const { multiCitySegments, ...rest } = s;
                  return { ...rest, flightType: type };
                });
              } else {
                setFormState((s) => ({ ...s, flightType: type }));
              }
            }}
            sx={{ flex: 1, textTransform: "none" }}
          >
            {type}
          </Button>
        ))}
      </Box>

      {/* Round Trip & One Way */}
      {(formState.flightType === "Round Trip" || !formState.flightType || formState.flightType === undefined) && (
        <>
          <CountrySelect
            label="From"
            value={formState.from || null}
            onChange={(val) => setFormState((s) => ({ ...s, from: val }))}
          />
          <CountrySelect
            label="To"
            value={formState.to || null}
            onChange={(val) => setFormState((s) => ({ ...s, to: val }))}
          />
          <TextField
            label="Departure Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.departureDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, departureDate: e.target.value }))}
          />
          <TextField
            label="Return Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.returnDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, returnDate: e.target.value }))}
            disabled={formState.flightType === "One Way"}
          />
        </>
      )}

      {/* One Way */}
      {formState.flightType === "One Way" && (
        <>
          <CountrySelect
            label="From"
            value={formState.from || null}
            onChange={(val) => setFormState((s) => ({ ...s, from: val }))}
          />
          <CountrySelect
            label="To"
            value={formState.to || null}
            onChange={(val) => setFormState((s) => ({ ...s, to: val }))}
          />
          <TextField
            label="Departure Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.departureDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, departureDate: e.target.value }))}
          />
          <TextField
            label="Return Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formState.returnDate || ''}
            onChange={(e) => setFormState((s) => ({ ...s, returnDate: e.target.value }))}
            disabled
          />
        </>
      )}

      {/* Multi-city */}
      {formState.flightType === "Multi-city" && (
        <>
          {(Array.isArray(formState.multiCitySegments) ? formState.multiCitySegments : []).map((segment: any, idx: number) => (
            <Box key={idx} sx={{ mb: 2, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Segment {idx + 1}
              </Typography>
              <CountrySelect
                label="From"
                value={segment.from || null}
                onChange={(val) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], from: val };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              <CountrySelect
                label="To"
                value={segment.to || null}
                onChange={(val) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], to: val };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              <TextField
                label="Departure Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={segment.departureDate || ''}
                onChange={(e) =>
                  setFormState((s) => {
                    const segments = Array.isArray(s.multiCitySegments) ? [...s.multiCitySegments] : [];
                    segments[idx] = { ...segments[idx], departureDate: e.target.value };
                    return { ...s, multiCitySegments: segments };
                  })
                }
              />
              {Array.isArray(formState.multiCitySegments) && formState.multiCitySegments.length > 2 && (
                <Button
                  size="small"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() =>
                    setFormState((s) => ({
                      ...s,
                      multiCitySegments: (Array.isArray(s.multiCitySegments) ? s.multiCitySegments : []).filter((_: any, i: number) => i !== idx),
                    }))
                  }
                >
                  Remove Segment
                </Button>
              )}
            </Box>
          ))}
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() =>
              setFormState((s) => ({
                ...s,
                multiCitySegments: [
                  ...(Array.isArray(s.multiCitySegments)
                    ? s.multiCitySegments
                    : [
                        { from: "", to: "", departureDate: "" },
                        { from: "", to: "", departureDate: "" },
                      ]),
                  { from: "", to: "", departureDate: "" },
                ],
              }))
            }
          >
            Add Another Segment
          </Button>
        </>
      )}

      {/* Travelers Section */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Travelers
        </Typography>
        {[
          { key: "adults", label: "Adults", sub: "18-64", min: 1 },
          { key: "students", label: "Students", sub: "over 18", min: 0 },
          { key: "seniors", label: "Seniors", sub: "over 65", min: 0 },
          { key: "youths", label: "Youths", sub: "12-17", min: 0 },
          { key: "children", label: "Children", sub: "2-11", min: 0 },
          { key: "toddlers", label: "Toddlers in own seat", sub: "under 2", min: 0 },
          { key: "infants", label: "Infants on lap", sub: "under 2", min: 0 },
        ].map(({ key, label, sub, min }) => (
          <Box
            key={key}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              pl: 1,
              pr: 1,
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 32, px: 0 }}
                onClick={() =>
                  setFormState((s) => ({
                    ...s,
                    [key]: Math.max((s[key] || 0) - 1, min),
                  }))
                }
                disabled={(formState[key] || 0) <= min}
                aria-label={`Decrease ${label}`}
              >
                -
              </Button>
              <Typography variant="body1" sx={{ width: 24, textAlign: "center" }}>
                {formState[key] !== undefined ? formState[key] : min}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 32, px: 0 }}
                onClick={() =>
                  setFormState((s) => ({
                    ...s,
                    [key]: (s[key] || min) + 1,
                  }))
                }
                aria-label={`Increase ${label}`}
              >
                +
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
        {["Economy", "Business", "First", "Premium"].map((option) => (
          <Button
            key={option}
            variant={formState.cabinClass === option ? "contained" : "outlined"}
            color={formState.cabinClass === option ? "primary" : "inherit"}
            onClick={() =>
              setFormState((s) => ({ ...s, cabinClass: option }))
            }
            sx={{ flex: 1, textTransform: "none" }}
          >
            {option}
          </Button>
        ))}
      </Box>
    </>
  ),
  "Reserve Hotel": (
    <>
      <CountrySelect
        label="Destination"
        value={formState.destination || null}
        onChange={(val) => setFormState((s) => ({ ...s, destination: val }))}
      />
      <TextField
        label="Check-in Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.checkIn || ''}
        onChange={(e) => setFormState((s) => ({ ...s, checkIn: e.target.value }))}
      />
      <TextField
        label="Check-out Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formState.checkOut || ''}
        onChange={(e) => setFormState((s) => ({ ...s, checkOut: e.target.value }))}
      />

      {/* Guests and Rooms */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
        {/* Adults */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Adults</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  adults: Math.max((s.adults || 2) - 1, 1),
                }))
              }
              disabled={(formState.adults || 2) <= 1}
              aria-label="Decrease Adults"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 24, textAlign: "center" }}>
              {formState.adults !== undefined ? formState.adults : 2}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  adults: (s.adults || 2) + 1,
                }))
              }
              aria-label="Increase Adults"
            >
              +
            </Button>
          </Box>
        </Box>
        {/* Children */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Children</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  children: Math.max((s.children || 0) - 1, 0),
                }))
              }
              disabled={(formState.children || 0) <= 0}
              aria-label="Decrease Children"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 24, textAlign: "center" }}>
              {formState.children !== undefined ? formState.children : 0}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  children: (s.children || 0) + 1,
                }))
              }
              aria-label="Increase Children"
            >
              +
            </Button>
          </Box>
        </Box>
        {/* Rooms */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle2">Rooms</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  rooms: Math.max((s.rooms || 1) - 1, 1),
                }))
              }
              disabled={(formState.rooms || 1) <= 1}
              aria-label="Decrease Rooms"
            >
              -
            </Button>
            <Typography variant="body1" sx={{ width: 24, textAlign: "center" }}>
              {formState.rooms !== undefined ? formState.rooms : 1}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ minWidth: 32, px: 0 }}
              onClick={() =>
                setFormState((s) => ({
                  ...s,
                  rooms: (s.rooms || 1) + 1,
                }))
              }
              aria-label="Increase Rooms"
            >
              +
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Pets/Assistance Animals Info */}
      <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!formState.travelingWithPets}
              onChange={(e) =>
                setFormState((s) => ({
                  ...s,
                  travelingWithPets: e.target.checked,
                }))
              }
              name="travelingWithPets"
              color="primary"
            />
          }
          label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Traveling with pets?</Typography>}
        />
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Assistance animals aren’t considered pets.&nbsp;
          <a
            href="https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            Read more about traveling with assistance animals
          </a>
        </Typography>
      </Box>
    </>
  ),
  "Apply for Visa": (
    <>
      <CountrySelect
        label="Country"
        value={formState.country || null}
        onChange={(val) => setFormState((s) => ({ ...s, country: val }))}
      />
      <TextField
        label="Purpose"
        fullWidth
        margin="normal"
        value={formState.purpose || ''}
        onChange={(e) => setFormState((s) => ({ ...s, purpose: e.target.value }))}
      />
    </>
  ),
  "Chat with Agent": (
    <>
      <TextField
        label="Your Message"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={formState.message || ''}
        onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
      />
    </>
  ),
  "Create Savings Plan": (
    <>
      <TextField
        label="Plan Name"
        fullWidth
        margin="normal"
        value={formState.planName || ''}
        onChange={(e) => setFormState((s) => ({ ...s, planName: e.target.value }))}
      />
      <TextField
        label="Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.amount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, amount: e.target.value }))}
      />
    </>
  ),
  "Apply for Study Loan": (
    <>
      <TextField
        label="Institution"
        fullWidth
        margin="normal"
        value={formState.institution || ''}
        onChange={(e) => setFormState((s) => ({ ...s, institution: e.target.value }))}
      />
      <TextField
        label="Amount Needed"
        type="number"
        fullWidth
        margin="normal"
        value={formState.amountNeeded || ''}
        onChange={(e) => setFormState((s) => ({ ...s, amountNeeded: e.target.value }))}
      />
    </>
  ),
  "Study Abroad Loan": (
    <>
      <CountrySelect
        label="Country"
        value={formState.country || null}
        onChange={(val) => setFormState((s) => ({ ...s, country: val }))}
      />
      <TextField
        label="Loan Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.loanAmount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, loanAmount: e.target.value }))}
      />
    </>
  ),
  "Pilgrimage Package": (
    <>
      <CountrySelect
        label="Destination"
        value={formState.destination || null}
        onChange={(val) => setFormState((s) => ({ ...s, destination: val }))}
      />
      <TextField
        label="Number of People"
        type="number"
        fullWidth
        margin="normal"
        value={formState.numPeople || ''}
        onChange={(e) => setFormState((s) => ({ ...s, numPeople: e.target.value }))}
      />
    </>
  ),
  "Business Loan for Travel Project": (
    <>
      <TextField
        label="Business Name"
        fullWidth
        margin="normal"
        value={formState.businessName || ''}
        onChange={(e) => setFormState((s) => ({ ...s, businessName: e.target.value }))}
      />
      <TextField
        label="Loan Amount"
        type="number"
        fullWidth
        margin="normal"
        value={formState.loanAmount || ''}
        onChange={(e) => setFormState((s) => ({ ...s, loanAmount: e.target.value }))}
      />
    </>
  ),
});

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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
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

  const handleActionClick = (label: string) => {
    setModalLabel(label);
    setFormState({}); // Reset form state on open
    setOpenModal(true);
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

  // Optionally, handle form submit here
  const handleModalSubmit = () => {
    // You can process formState here
    setOpenModal(false);
    setModalLabel(null);
    setFormState({});
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
                xs: 'repeat(3, 1fr)', // 4 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on small screens
                md: 'repeat(6, 1fr)', // 6 columns on medium and up
              },
              gap: 1.5,
            }}
          >
            <ActionCard icon={<AirplaneTicket />} label="Book Flight" onClick={() => handleActionClick("Book Flight")} />
            <ActionCard icon={<Hotel />} label="Reserve Hotel" onClick={() => handleActionClick("Reserve Hotel")} />
            <ActionCard icon={<School />} label="Apply for Visa" onClick={() => handleActionClick("Apply for Visa")} />
            <ActionCard icon={<Chat />} label="Chat with Agent" onClick={() => handleActionClick("Chat with Agent")} />
            <ActionCard icon={<Savings />} label="Create Savings Plan" onClick={() => handleActionClick("Create Savings Plan")} />
            <ActionCard icon={<School />} label="Apply for Study Loan" onClick={() => handleActionClick("Apply for Study Loan")} />
          </Box>
        </Box>
      </Stack>

      {/* Applications */}
      <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
        Start a New Application
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Summer in London 20% Off" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Study Visa" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Vacation Visa" />
        </Box>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          mt: 2,
        }}
      >
        {/* Left: More Actions and Suggestions */}
        <Box sx={{ flex: { xs: 'unset', md: 3 }, width: { xs: '100%', md: '75%' }, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<Chat />} label="Study Abroad Loan" onClick={() => handleActionClick("Study Abroad Loan")} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<Savings />} label="Pilgrimage Package" onClick={() => handleActionClick("Pilgrimage Package")} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<School />} label="Business Loan for Travel Project" onClick={() => handleActionClick("Business Loan for Travel Project")} />
            </Box>
          </Stack>

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
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleModalSubmit} variant="contained" color="primary">
            Submit
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