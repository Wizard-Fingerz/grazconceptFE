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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { actionForms } from "../../../components/modals/ActionForms";
import { submitActionForm } from "../../../services/actionFormService";
import { getBookedFlights, getSuggestedFlights } from "../../../services/flightApiService";
import { FlightOfferList } from "./flightOfferList";

const filterConfig = [
  {
    type: "slider",
    name: "price",
    title: "Price Range",
    min: 300,
    max: 2000,
    step: 50,
  },
  {
    type: "checkbox",
    name: "stops",
    title: "Number of Stops",
    options: [
      { label: "Non-stop", value: 0 },
      { label: "1 Stop", value: 1 },
      { label: "2+ Stops", value: 2 },
    ],
  },
  {
    type: "checkbox",
    name: "airline",
    title: "Airlines",
    options: [
      { label: "Scoot", value: "Scoot" },
      { label: "British Airways", value: "British Airways" },
      { label: "KLM", value: "KLM" },
    ],
  },
];

const TABS = [
  { label: "Suggested For You", value: 0 },
  { label: "My Booked Flights", value: 1 },
];

const FlightListPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({});
  const [bookFlightOpen, setBookFlightOpen] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tab, setTab] = useState<number>(0);

  // Data for each tab
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [flightResultsLoading, setFlightResultsLoading] = useState(false);
  const [flightResultsError, setFlightResultsError] = useState<string | null>(null);

  const [suggestedFlights, setSuggestedFlights] = useState<any[]>([]);
  const [suggestedFlightsLoading, setSuggestedFlightsLoading] = useState(false);
  const [suggestedFlightsError, setSuggestedFlightsError] = useState<string | null>(null);

  // Fetch suggested flights when tab changes to "Suggested For You"
  useEffect(() => {
    if (tab === 0) {
      setSuggestedFlightsLoading(true);
      setSuggestedFlightsError(null);
      (async () => {
        try {
          const data = await getSuggestedFlights();
          setSuggestedFlights(data?.flights || []);
        } catch (err) {
          setSuggestedFlightsError("Failed to fetch suggested flights.");
        } finally {
          setSuggestedFlightsLoading(false);
        }
      })();
    }
  }, [tab]);

  // Fetch booked flights when tab changes to "My Booked Flights"
  useEffect(() => {
    if (tab === 1) {
      setFlightResultsLoading(true);
      setFlightResultsError(null);
      (async () => {
        try {
          // Only fetch flights the customer has booked
          const data = await getBookedFlights();
          // The API returns { available_flights: [...] }
          setFlightResults(data?.available_flights || []);
        } catch (err) {
          setFlightResultsError("Failed to fetch your booked flights.");
        } finally {
          setFlightResultsLoading(false);
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

  // Handle Book Flight dialog open/close
  const openBookFlight = () => {
    setFormState({});
    setApiError(null);
    setBookFlightOpen(true);
  };
  const closeBookFlight = () => {
    setBookFlightOpen(false);
    setApiError(null);
  };

  // Handle Book Flight form submit
  const handleBookFlightSubmit = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Call the real API
      await submitActionForm("Book Flight", formState);

      setBookFlightOpen(false);
      // Optionally, you could refresh booked flights here if needed
      setTab(1); // Switch to My Booked Flights tab after booking
    } catch (err: any) {
      setApiError(
        err?.response?.data?.detail || err.message || "Failed to book flight."
      );
    } finally {
      setLoading(false);
    }
  };

  // Tab content renderers
  const renderSuggestedTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FlightOfferList
            offers={suggestedFlights}
            loading={suggestedFlightsLoading}
            error={suggestedFlightsError}
            title="Suggested Flights For You"
          />
        </Box>
        <Box sx={{ flexBasis: { xs: "100%", md: 320, lg: 360 }, flexShrink: 0 }}>
          <FilterPanel
            filters={filterConfig as any}
            values={filters}
            onChange={handleChange}
            onClear={handleClear}
          />
        </Box>
      </Box>
    </Box>
  );

  // New: Render Booked Flights as a Table
  const renderBookedFlightsTab = () => (
    <Box sx={{ mt: 3 }}>
      {flightResultsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : flightResultsError ? (
        <Alert severity="error">{flightResultsError}</Alert>
      ) : flightResults.length === 0 ? (
        <Alert severity="info">No booked flights found.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Departure</TableCell>
                <TableCell>Return</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Cabin</TableCell>
                <TableCell>Travelers</TableCell>
                {/* <TableCell>Status</TableCell> */}
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flightResults.map((flight: any) => (
                <TableRow key={flight.id}>
                  <TableCell>{flight.from_airport}</TableCell>
                  <TableCell>{flight.to_airport}</TableCell>
                  <TableCell>
                    {flight.departure_date
                      ? new Date(flight.departure_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {flight.return_date
                      ? new Date(flight.return_date).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{flight.flight_type}</TableCell>
                  <TableCell>{flight.cabin_class}</TableCell>
                  <TableCell>
                    <Box>
                      {flight.adults > 0 && (
                        <Chip label={`Adults: ${flight.adults}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.children > 0 && (
                        <Chip label={`Children: ${flight.children}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.infants > 0 && (
                        <Chip label={`Infants: ${flight.infants}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.students > 0 && (
                        <Chip label={`Students: ${flight.students}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.seniors > 0 && (
                        <Chip label={`Seniors: ${flight.seniors}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.youths > 0 && (
                        <Chip label={`Youths: ${flight.youths}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {flight.toddlers > 0 && (
                        <Chip label={`Toddlers: ${flight.toddlers}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  {/* <TableCell>
                    {renderFlightFoundStatus(flight.flights_found)}
                  </TableCell> */}
                  <TableCell>
                    {flight.created_at
                      ? new Date(flight.created_at).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <CustomerPageHeader>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4" className="font-bold mb-2">
            Flights
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={openBookFlight}
            sx={{ minWidth: 160 }}
          >
            Book Flight
          </Button>
        </Box>
      </CustomerPageHeader>

      <Dialog open={bookFlightOpen} onClose={closeBookFlight} maxWidth="sm" fullWidth>
        <DialogTitle>Book Flight</DialogTitle>
        <DialogContent>
          {actionForms(formState, setFormState)["Book Flight"]}
          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookFlight} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleBookFlightSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Search Flights"}
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
          {TABS.map((t, _idx) => (
            <Tab key={t.value} label={t.label} />
          ))}
        </Tabs>
      </Box>

      <Box>
        {tab === 0 && renderSuggestedTab()}
        {tab === 1 && renderBookedFlightsTab()}
      </Box>
    </Box>
  );
};

export default FlightListPage;
