import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { FlightCard } from "../../../components/FlightCard";

const sampleFlights = [
  {
    flight_date: "2025-09-16",
    flight_status: "scheduled",
    departure: {
      airport: "Tianhe International",
      timezone: "Asia/Shanghai",
      iata: "WUH",
      icao: "ZHHH",
      terminal: "3",
      gate: "334",
      delay: null,
      scheduled: "2025-09-16T01:20:00+00:00",
      estimated: "2025-09-16T01:20:00+00:00",
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    arrival: {
      airport: "Singapore Changi",
      timezone: "Asia/Singapore",
      iata: "SIN",
      icao: "WSSS",
      terminal: "1",
      gate: null,
      baggage: null,
      scheduled: "2025-09-16T06:00:00+00:00",
      delay: null,
      estimated: null,
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    airline: {
      name: "Scoot",
      iata: "TR",
      icao: "TGW",
    },
    flight: {
      number: "121",
      iata: "TR121",
      icao: "TGW121",
      codeshared: null,
    },
    aircraft: null,
    live: null,
    // For filtering demo
    price: 400,
    stops: 0,
  },
  // Add a couple more flights for demo filtering
  {
    flight_date: "2025-09-17",
    flight_status: "scheduled",
    departure: {
      airport: "Heathrow",
      timezone: "Europe/London",
      iata: "LHR",
      icao: "EGLL",
      terminal: "5",
      gate: "A10",
      delay: null,
      scheduled: "2025-09-17T10:00:00+00:00",
      estimated: "2025-09-17T10:00:00+00:00",
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    arrival: {
      airport: "John F. Kennedy International",
      timezone: "America/New_York",
      iata: "JFK",
      icao: "KJFK",
      terminal: "4",
      gate: null,
      baggage: null,
      scheduled: "2025-09-17T14:00:00+00:00",
      delay: null,
      estimated: null,
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    airline: {
      name: "British Airways",
      iata: "BA",
      icao: "BAW",
    },
    flight: {
      number: "117",
      iata: "BA117",
      icao: "BAW117",
      codeshared: null,
    },
    aircraft: null,
    live: null,
    price: 1200,
    stops: 1,
  },
  {
    flight_date: "2025-09-18",
    flight_status: "scheduled",
    departure: {
      airport: "Schiphol",
      timezone: "Europe/Amsterdam",
      iata: "AMS",
      icao: "EHAM",
      terminal: "2",
      gate: "D7",
      delay: null,
      scheduled: "2025-09-18T08:30:00+00:00",
      estimated: "2025-09-18T08:30:00+00:00",
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    arrival: {
      airport: "Dubai International",
      timezone: "Asia/Dubai",
      iata: "DXB",
      icao: "OMDB",
      terminal: "3",
      gate: null,
      baggage: null,
      scheduled: "2025-09-18T17:00:00+00:00",
      delay: null,
      estimated: null,
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    airline: {
      name: "KLM",
      iata: "KL",
      icao: "KLM",
    },
    flight: {
      number: "427",
      iata: "KL427",
      icao: "KLM427",
      codeshared: null,
    },
    aircraft: null,
    live: null,
    price: 950,
    stops: 2,
  },
];

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

const FlightListPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  // Filtering logic adapted for new data structure
  const filteredFlights = sampleFlights.filter((flight) => {
    // Price filter
    if (
      filters.price &&
      (flight.price < filters.price[0] || flight.price > filters.price[1])
    )
      return false;
    // Stops filter
    if (
      filters.stops &&
      Array.isArray(filters.stops) &&
      filters.stops.length > 0 &&
      !filters.stops.includes(
        flight.stops >= 2 ? 2 : flight.stops // 2+ stops grouped
      )
    )
      return false;
    // Airline filter
    if (
      filters.airline &&
      Array.isArray(filters.airline) &&
      filters.airline.length > 0 &&
      !filters.airline.includes(flight.airline.name)
    )
      return false;
    return true;
  });

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
        <Typography variant="h4" className="font-bold mb-2">
          Flights
        </Typography>
      </CustomerPageHeader>

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
        {/* Flight Cards */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {filteredFlights.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 4 }}>
                No flights found for selected filters.
              </Typography>
            ) : (
              filteredFlights.map((flight, idx) => (
                <FlightCard key={idx} {...flight} />
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
    </Box>
  );
};

export default FlightListPage;
