import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    Paper,
    Stack,
  } from "@mui/material";

// Helper to render location info (unchanged)
export const LocationList = ({
    title,
    locations,
    loading,
    error,
  }: {
    title: string;
    locations: any[];
    loading?: boolean;
    error?: string | null;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : locations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No results.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {locations.map((loc, idx) => (
            <Paper
              key={loc.id || idx}
              variant="outlined"
              sx={{ p: 2, background: "#fafbfc" }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={loc.subType} size="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {loc.name}
                </Typography>
                {loc.iataCode && (
                  <Chip label={`IATA: ${loc.iataCode}`} size="small" color="primary" />
                )}
                {loc.address?.cityName && (
                  <Chip label={loc.address.cityName} size="small" />
                )}
                {loc.address?.countryName && (
                  <Chip label={loc.address.countryName} size="small" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {loc.detailedName}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                {loc.geoCode && (
                  <Typography variant="caption" color="text.secondary">
                    Lat: {loc.geoCode.latitude}, Lng: {loc.geoCode.longitude}
                  </Typography>
                )}
                {loc.timeZoneOffset && (
                  <Typography variant="caption" color="text.secondary">
                    Timezone: {loc.timeZoneOffset}
                  </Typography>
                )}
                {loc.analytics?.travelers?.score !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    Popularity: {loc.analytics.travelers.score}
                  </Typography>
                )}
              </Stack>
              {loc.self?.href && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  <a href={loc.self.href} target="_blank" rel="noopener noreferrer">
                    API Link
                  </a>
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );