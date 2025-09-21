import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { FlightOfferCard } from "../../../components/FlightCard/OfferCard";


// Helper to render a list of flight offers (Amadeus/flight-offer style)
export const FlightOfferList = ({
    offers,
    loading,
    error,
    title,
  }: {
    offers: any[];
    loading: boolean;
    error?: string | null;
    title?: string;
  }) => (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !offers || offers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No flights found.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {offers.map((offer) => (
            <FlightOfferCard key={offer.id} offer={offer} />
          ))}
        </Stack>
      )}
    </Box>
  );
  