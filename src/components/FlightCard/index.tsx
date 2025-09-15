import React from "react";
import { Box, Typography, Card, CardContent, Chip, Stack, Divider } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";

interface FlightCardProps {
  // This interface is now tailored to the provided flight details
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    delay?: number | null;
    scheduled: string;
    estimated?: string | null;
    actual?: string | null;
    estimated_runway?: string | null;
    actual_runway?: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string | null;
    baggage?: string | null;
    scheduled: string;
    delay?: number | null;
    estimated?: string | null;
    actual?: string | null;
    estimated_runway?: string | null;
    actual_runway?: string | null;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared?: any;
  };
  // Optionally, you could add price, stops, duration, logo, etc.
}

const formatTime = (iso: string, tz?: string) => {
  try {
    const date = new Date(iso);
    // If timezone is provided, use it; otherwise, local time
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz || undefined,
    });
  } catch {
    return "-";
  }
};

const formatDate = (iso: string, tz?: string) => {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: tz || undefined,
    });
  } catch {
    return "-";
  }
};

const getDuration = (start: string, end: string) => {
  try {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffMs = d2.getTime() - d1.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  } catch {
    return "-";
  }
};

export const FlightCard: React.FC<FlightCardProps> = ({
  flight_date,
  flight_status,
  departure,
  arrival,
  airline,
  flight,
}) => {
  const duration = getDuration(departure.scheduled, arrival.scheduled);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        px: 2,
        py: 2,
        boxShadow: 1,
        borderRadius: 1,
        minHeight: 140,
        width: "100%",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <AirlineSeatReclineNormalIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {airline.name} <span style={{ fontWeight: 400, fontSize: 16 }}>({airline.iata})</span>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={flight_status.charAt(0).toUpperCase() + flight_status.slice(1)}
            color={flight_status === "scheduled" ? "info" : "warning"}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" alignItems="center" spacing={3}>
          {/* Departure */}
          <Box sx={{ minWidth: 120 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FlightTakeoffIcon color="action" fontSize="small" />
              <Typography variant="subtitle2" color="text.secondary">
                {departure.airport}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {departure.iata} &middot; Terminal {departure.terminal || "-"}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatTime(departure.scheduled, departure.timezone)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(departure.scheduled, departure.timezone)}
            </Typography>
          </Box>
          {/* Arrow and duration */}
          <Box sx={{ textAlign: "center", minWidth: 80 }}>
            <Typography variant="body2" color="text.secondary">
              {duration}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              &rarr;
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Flight {flight.iata}
            </Typography>
          </Box>
          {/* Arrival */}
          <Box sx={{ minWidth: 120 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <FlightLandIcon color="action" fontSize="small" />
              <Typography variant="subtitle2" color="text.secondary">
                {arrival.airport}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {arrival.iata} &middot; Terminal {arrival.terminal || "-"}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatTime(arrival.scheduled, arrival.timezone)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(arrival.scheduled, arrival.timezone)}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" spacing={2} alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            Flight Date: <b>{flight_date}</b>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Flight No: <b>{flight.number}</b>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FlightCard;
