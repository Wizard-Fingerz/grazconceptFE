import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import HotelCard from "../../../components/HotelCard";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { actionForms } from "../../../components/modals/ActionForms";
import { getHotelSuggestions, getMyHotelReservations } from "../../../services/hotelServices";



// Example filter config (customize as needed)
const filterConfig = [
  {
    type: "slider",
    name: "price",
    title: "Price Range",
    min: 500,
    max: 3000,
    step: 100,
  },
  {
    type: "checkbox",
    name: "location",
    title: "Location",
    options: [
      { label: "Downtown", value: "downtown" },
      { label: "Beachfront", value: "beachfront" },
    ],
  },
  {
    type: "radio",
    name: "rating",
    title: "Minimum Rating",
    options: [
      { label: "4 stars", value: 4 },
      { label: "4.5 stars", value: 4.5 },
      { label: "5 stars", value: 5 },
    ],
  },
];

const TABS = [
  { label: "Suggested For You", value: 0 },
  { label: "My Reservations", value: 1 },
];

const HotelReservation: React.FC = () => {
  const [filters, setFilters] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  // Hotel data from API
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  // Reservations data from API
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  // Fetch hotel suggestions when tab is 0 or filters change
  useEffect(() => {
    if (tab === 0) {
      setHotelLoading(true);
      setHotelError(null);
      (async () => {
        try {
          const data = await getHotelSuggestions();
          setHotelData(data?.hotels || []);
        } catch (err: any) {
          setHotelError(
            err?.response?.data?.detail || err.message || "Failed to fetch hotels."
          );
        } finally {
          setHotelLoading(false);
        }
      })();
    }
  }, [tab]);

  // Fetch my reservations when tab is 1
  useEffect(() => {
    if (tab === 1) {
      setReservationsLoading(true);
      setReservationsError(null);
      (async () => {
        try {
          const data = await getMyHotelReservations();
          setMyReservations(data?.reservations || []);
        } catch (err: any) {
          setReservationsError(
            err?.response?.data?.detail || err.message || "Failed to fetch reservations."
          );
        } finally {
          setReservationsLoading(false);
        }
      })();
    }
  }, [tab]);

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  // Open dialog for hotel reservation for a specific hotel
  const handleReserve = (hotel: any) => {
    setSelectedHotel(hotel);
    setFormState({});
    setApiError(null);
    setDialogOpen(true);
  };

  // Open dialog for generic hotel reservation (from header button)
  const openHotelReserve = () => {
    setSelectedHotel(null);
    setFormState({});
    setApiError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedHotel(null);
    setFormState({});
    setApiError(null);
    setLoading(false);
  };

  // Simulate reservation submit
  const handleReserveSubmit = async () => {
    setLoading(true);
    setApiError(null);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setDialogOpen(false);
      // You can show a toast or success message here
    }, 1200);
  };

  // Renderers for each tab
  const renderSuggestedTab = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "flex-start" },
        justifyContent: "space-between",
        mb: 8,
        gap: { xs: 0, md: 4 },
      }}
    >
      {/* Hotel Cards */}
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {hotelLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : hotelError ? (
            <Alert severity="error">{hotelError}</Alert>
          ) : hotelData.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No hotels found.
            </Typography>
          ) : (
            hotelData.map((hotel) => (
              <HotelCard
                key={hotel.id || hotel.name}
                image={hotel.image}
                name={hotel.name}
                rating={hotel.rating}
                reviews={hotel.reviews}
                price={hotel.price}
                description={hotel.description}
                onReserve={() => handleReserve(hotel)}
              />
            ))
          )}
        </Box>
      </Box>

      {/* Filter Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: 320 },
          flexShrink: 0,
          mb: { xs: 3, md: 0 },
          alignSelf: { xs: "auto", md: "flex-start" },
        }}
      >
        <FilterPanel
          filters={filterConfig as any}
          values={filters}
          onChange={handleChange}
          onClear={handleClear}
        />
      </Box>
    </Box>
  );

  const renderReservationsTab = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 8,
      }}
    >
      {reservationsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : reservationsError ? (
        <Alert severity="error">{reservationsError}</Alert>
      ) : myReservations.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          You have no hotel reservations yet.
        </Typography>
      ) : (
        myReservations.map((_reservation) => (
   <></>
        ))
      )}
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" className="font-bold mb-2">
            Hotel Reservation
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={openHotelReserve}
            sx={{ minWidth: 160 }}
          >
            Reserve Hotel
          </Button>
        </Box>
      </CustomerPageHeader>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHotel ? `Reserve ${selectedHotel.name}` : "Reserve Hotel"}
        </DialogTitle>
        <DialogContent>
          {actionForms(formState, setFormState)["Reserve Hotel"] ||
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please fill in your reservation details.
            </Typography>
          }
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleReserveSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Reserve"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((t) => (
            <Tab key={t.value} label={t.label} />
          ))}
        </Tabs>
      </Box>

      <Box>
        {tab === 0 && renderSuggestedTab()}
        {tab === 1 && renderReservationsTab()}
      </Box>
    </Box>
  );
};

export default HotelReservation;
