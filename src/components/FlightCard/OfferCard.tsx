import React, {  } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Tooltip,
} from "@mui/material";


// Helper to render a detailed card for a flight offer (Amadeus/flight-offer style)
// Rewritten to use MUI Stack and Box instead of deprecated Grid
export const FlightOfferCard = ({ offer }: { offer: any }) => {
    // Helper to get airline name from code (for demo, just show code)
    const getAirlineName = (code: string) => code;
  
    // Get main info
    const firstItinerary = offer.itineraries?.[0];
    const lastItinerary = offer.itineraries?.[offer.itineraries.length - 1];
    const firstSegment = firstItinerary?.segments?.[0];
    const lastSegment =
      lastItinerary?.segments?.[lastItinerary.segments.length - 1];
  
    // Price
    const price = offer.price?.grandTotal || offer.price?.total || "N/A";
    const currency = offer.price?.currency || "USD";
  
    // Stops
    const stops =
      firstItinerary && firstItinerary.segments
        ? firstItinerary.segments.length - 1
        : 0;
  
    // Airlines
    const airlineCodes = offer.validatingAirlineCodes || [];
    const airlineChips = airlineCodes.map((code: string) => (
      <Chip
        key={code}
        label={getAirlineName(code)}
        size="small"
        color="primary"
        sx={{ mr: 0.5 }}
      />
    ));
  
    // Duration
    // const duration = firstItinerary?.duration
    //   ? firstItinerary.duration.replace("PT", "").toLowerCase()
    //   : "";
  
    // Departure/Arrival
    const dep = firstSegment?.departure;
    const arr = lastSegment?.arrival;
  
    // Amenities (from first traveler, first segment)
    const amenities =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.amenities || [];
  
    // Cabin class (from first traveler, first segment)
    const cabin =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "";
  
    // Fare label
    const brandedFareLabel =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFareLabel ||
      "";
  
    // Checked bags (from first traveler, first segment)
    const checkedBags =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags;
  
    // Cabin bags (from first traveler, first segment)
    const cabinBags =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCabinBags;
  
    // Segment details
    const allSegments = offer.itineraries?.flatMap((iti: any) => iti.segments) || [];
  
    // Helper for formatting price
    const formatPrice = (amount: string | number, currency: string) => {
      if (isNaN(Number(amount))) return "N/A";
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(amount));
    };
  
    // Helper for time formatting
    const formatTime = (iso: string) =>
      iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
    const formatDate = (iso: string) =>
      iso ? new Date(iso).toLocaleDateString() : "-";
  
    // Helper for duration formatting (e.g. "2h 30m")
    const formatDuration = (dur: string) => {
      if (!dur) return "";
      // e.g. "PT2H30M"
      const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
      if (!match) return dur;
      const [, h, m] = match;
      return `${h ? `${h}h` : ""}${h && m ? " " : ""}${m ? `${m}m` : ""}`;
    };
  
    // --- Redesigned layout for more compact, creative info display ---
    // Use a horizontal timeline for segments, and a meta row below
  
    return (
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.5 },
          background: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          mb: 3,
          borderLeft: "6px solid #1976d2",
          transition: "box-shadow 0.2s",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(25, 118, 210, 0.10)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          {/* Left: Airline, Route, Price */}
          <Box
            sx={{
              flex: { md: "0 0 26%", xs: "1 1 100%" }, // Increased width from 22% to 26%
              minWidth: { md: 0, xs: 0 },
              maxWidth: { md: 340, xs: "100%" }, // Add a maxWidth for md and up
              textAlign: { xs: "left", md: "center" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 1,
              borderRight: { md: "1px solid #e3e3e3" },
              pr: { md: 2.5 }, // Slightly more padding
              mb: { xs: 2, md: 0 },
              overflow: "hidden", // Prevent overflow
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ md: "center" }} sx={{ flexWrap: "wrap" }}>
              {airlineChips}
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, fontSize: { xs: 16, md: 18 }, wordBreak: "break-word" }}>
              {dep?.iataCode} <span style={{ color: "#1976d2" }}>→</span> {arr?.iataCode}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                fontSize: { xs: 12, md: 13 },
                wordBreak: "break-word",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              {formatDate(dep?.at)} {formatTime(dep?.at)}{" "}
              <span style={{ color: "#888" }}>to</span>{" "}
              {formatDate(arr?.at)} {formatTime(arr?.at)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }} justifyContent={{ md: "center" }}>
              <Chip
                label={stops === 0 ? "Non-stop" : `${stops} Stop${stops > 1 ? "s" : ""}`}
                size="small"
                color={stops === 0 ? "success" : "warning"}
                sx={{ fontSize: 11, maxWidth: 120 }}
              />
              {brandedFareLabel && (
                <Chip
                  label={brandedFareLabel}
                  size="small"
                  color="secondary"
                  sx={{ fontSize: 11, maxWidth: 120 }}
                />
              )}
            </Stack>
            <Box
              sx={{
                background: "linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)",
                color: "#fff",
                borderRadius: 2,
                px: 2,
                py: 1.2,
                mt: 1.5,
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.10)",
                minWidth: 120, // Increased from 100
                maxWidth: 200,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1,
                  fontSize: { xs: 16, md: 18 },
                  mb: 0.2,
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                }}
              >
                {formatPrice(price, currency)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#e3f2fd",
                  fontWeight: 500,
                  letterSpacing: 1,
                  fontSize: 11,
                  wordBreak: "break-word",
                }}
              >
                {currency}
              </Typography>
            </Box>
          </Box>
  
          {/* Center: Timeline and meta */}
          <Box
            sx={{
              flex: "1 1 0%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              pl: { md: 2 },
              pr: { md: 2 },
            }}
          >
            {/* Horizontal timeline for segments */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                overflowX: "auto",
                py: 1,
                mb: 1,
                minHeight: 44,
              }}
            >
              {allSegments.map((seg: any, idx: number) => (
                <React.Fragment key={seg.id || idx}>
                  <Stack
                    direction="column"
                    alignItems="center"
                    sx={{
                      minWidth: 80,
                      background: "#f5f7fa",
                      borderRadius: 2,
                      px: 1,
                      py: 0.3,
                    }}
                  >
                    <Chip
                      label={getAirlineName(seg.carrierCode)}
                      size="small"
                      color="primary"
                      sx={{ mb: 0.5, fontSize: 11 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                      {seg.departure.iataCode} <span style={{ color: "#1976d2" }}>→</span> {seg.arrival.iataCode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                      {formatTime(seg.departure.at)} - {formatTime(seg.arrival.at)}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Chip
                        label={`Flt ${seg.carrierCode}${seg.number}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                      <Chip
                        label={formatDuration(seg.duration)}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </Stack>
                    {seg.terminal && (
                      <Chip
                        label={`T: ${seg.terminal}`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: 11 }}
                      />
                    )}
                  </Stack>
                  {idx < allSegments.length - 1 && (
                    <Box
                      sx={{
                        width: 20,
                        height: 2,
                        background: "#1976d2",
                        mx: 0.5,
                        borderRadius: 1,
                        alignSelf: "center",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Stack>
            {/* Meta info row */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexWrap: "wrap",
                mt: 0.5,
                mb: 0.5,
              }}
            >
              <Chip
                label={`Duration: ${formatDuration(firstItinerary?.duration)}`}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
              {cabin && (
                <Chip
                  label={`Cabin: ${cabin.charAt(0).toUpperCase() + cabin.slice(1).toLowerCase()}`}
                  size="small"
                  color="default"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              )}
              {checkedBags &&
                (checkedBags.weight || checkedBags.quantity) && (
                  <Chip
                    label={
                      checkedBags.weight
                        ? `Checked Bags: ${checkedBags.weight}${checkedBags.weightUnit || ""}`
                        : `Checked Bags: ${checkedBags.quantity}`
                    }
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                  />
                )}
              {cabinBags &&
                (cabinBags.weight || cabinBags.quantity) && (
                  <Chip
                    label={
                      cabinBags.weight
                        ? `Cabin Bags: ${cabinBags.weight}${cabinBags.weightUnit || ""}`
                        : `Cabin Bags: ${cabinBags.quantity}`
                    }
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                  />
                )}
              {offer.numberOfBookableSeats && (
                <Chip
                  label={`${offer.numberOfBookableSeats} seats left`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              )}
            </Stack>
            {/* Amenities, if any */}
            {amenities && amenities.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                {amenities.map((am: any, idx: number) => (
                  <Tooltip
                    key={idx}
                    title={am.isChargeable ? "Chargeable" : "Included"}
                  >
                    <Chip
                      label={am.description}
                      size="small"
                      color={am.isChargeable ? "warning" : "success"}
                      variant="outlined"
                      sx={{ mb: 0.5, fontSize: 11 }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Box>
  
        </Stack>
      </Paper>
    );
  };