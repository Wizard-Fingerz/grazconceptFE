import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { ImageCard } from "../../../components/ImageCard";
import api from "../../../services/api";
import { getAllPilgrimages } from "../../../services/pilgrimageServices";

/**
 * ApplicationCard - Reusable card for displaying application info.
 */
export const ApplicationCard: React.FC<{
  title: string;
  destination: string;
  city: string;
  status: string;
  price: string;
  currency: string;
}> = ({ title, destination, city, status, price, currency }) => (
  <Card
    className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
    sx={{
      borderLeft: `6px solid ${
        status === "Completed"
          ? "#4caf50"
          : status === "Under Review"
          ? "#ff9800"
          : status === "Rejected"
          ? "#f44336"
          : "#bdbdbd"
      }`,
      margin: "auto",
      background: "#fffdfa",
    }}
  >
    <CardContent className="flex flex-col gap-2">
      <Box className="flex items-center justify-between gap-4 mb-1">
        <Typography
          variant="subtitle1"
          className="font-bold"
          sx={{ fontSize: "1.1rem" }}
        >
          {title}
        </Typography>
        <Button
          size="small"
          className="bg-[#f5ebe1] rounded-xl normal-case w-fit"
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color:
              status === "Completed"
                ? "#388e3c"
                : status === "Under Review"
                ? "#ff9800"
                : status === "Rejected"
                ? "#d32f2f"
                : "#616161",
            background:
              status === "Completed"
                ? "#e8f5e9"
                : status === "Under Review"
                ? "#fff3e0"
                : status === "Rejected"
                ? "#ffebee"
                : "#f5ebe1",
            px: 2,
            py: 0.5,
            boxShadow: "none",
            pointerEvents: "none",
          }}
          disableElevation
        >
          {status}
        </Button>
      </Box>
      <Box className="flex flex-col gap-1">
        <Box className="flex items-center gap-2">
          <Typography
            variant="body2"
            className="text-gray-600"
            sx={{ fontWeight: 500, minWidth: 88 }}
          >
            Destination:
          </Typography>
          <Typography variant="body2" className="text-gray-800">
            {destination}
          </Typography>
        </Box>
        <Box className="flex items-center gap-2">
          <Typography
            variant="body2"
            className="text-gray-600"
            sx={{ fontWeight: 500, minWidth: 70 }}
          >
            City:
          </Typography>
          <Typography variant="body2" className="text-gray-800">
            {city}
          </Typography>
        </Box>
        <Box className="flex items-center gap-2">
          <Typography
            variant="body2"
            className="text-gray-600"
            sx={{ fontWeight: 500, minWidth: 70 }}
          >
            Price:
          </Typography>
          <Typography variant="body2" className="text-gray-800">
            {price} {currency}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * GuideCard - Reusable card for displaying a guide/resource.
 */
export const GuideCard: React.FC<{ title: string }> = ({ title }) => (
  <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
    {title}
  </Button>
);

export const ApplyPilgrimageVisa: React.FC = () => {
  // Fetch pilgrimage programs list
  const [pilgrimages, setPilgrimages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selection state
  const [selectedPilgrimageId, setSelectedPilgrimageId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Recent applications
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Tabs: 0 = Recent Applications
  const [tabValue, setTabValue] = useState(0);

  // Fetch pilgrimages on mount
  useEffect(() => {
    async function fetchPilgrimages() {
      setLoading(true);
      try {
        const res = await getAllPilgrimages();
        setPilgrimages(res?.results || []);
      } catch {
        setPilgrimages([]);
      }
      setLoading(false);
    }
    fetchPilgrimages();
  }, []);

  // Fetch recent applications (replace with API call when available)
  useEffect(() => {
    async function fetchApplications() {
      setLoadingApplications(true);
      try {
        // Fake delay for UX
        await new Promise(r => setTimeout(r, 400));
        // TODO: Replace with actual "getMyRecentPilgrimageApplications" API call when backend is ready
        setRecentApplications([
          {
            id: "app1",
            pilgrimage_id: 3,
            status: "Under Review",
            created_at: "2024-06-01T12:00:00.000Z",
          },
          {
            id: "app2",
            pilgrimage_id: 2,
            status: "Completed",
            created_at: "2024-04-22T09:00:00.000Z",
          },
        ]);
      } catch {
        setRecentApplications([]);
      }
      setLoadingApplications(false);
    }
    fetchApplications();
  }, []);

  // Pilgrimage selection
  const handlePilgrimageChange = (e: any) => {
    setSelectedPilgrimageId(e.target.value);
  };
  const handleTabChange = (_: any, newVal: number) => setTabValue(newVal);

  // Get pilgrimage by selected id

  // Start Application handler
  const handleStartApplication = async () => {
    if (!selectedPilgrimageId) return;
    setSubmitting(true);
    try {
      const payload = { pilgrimage: selectedPilgrimageId };
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // This endpoint is a placeholder. Replace with actual URL if different.
      await api.post(`/app/pilgrimage-visa-application/`, payload, { headers });
      // Simulate refresh
      setRecentApplications(prev => [
        {
          id: "app" + (prev.length + 1),
          pilgrimage_id: selectedPilgrimageId,
          status: "Under Review",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      alert("Application submitted. Follow-up coming soon.");
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Utility to get a pilgrimage object by id from the list
  const getPilgrimageById = (id: number | string) =>
    pilgrimages.find((p) => String(p.id) === String(id));

  // Utility: map country code to readable name if needed (or just show code)
  const countryDisplay = (country: string) => {
    // You could extend with a map of country codes to names if needed.
    if (country === "SA") return "Saudi Arabia";
    if (country === "IL") return "Israel";
    return country;
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Apply for
        </Typography>
        <Typography variant="h4" className="font-bold mb-6">
          Pilgrimage visa
        </Typography>
      </CustomerPageHeader>

      {/* Sub Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Get assistance with your pilgrimage visa application from our experienced
          travel advisors
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
        >
          Chat with Agent
        </Button>
      </div>

      {/* Application Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Country Selection */}
        <Card className="rounded-2xl shadow-md col-span-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">Select Destination Country</Typography>
            <TextField
              select
              fullWidth
              label="Country"
              value={selectedCountry || ""}
              onChange={(e) => {
                setSelectedCountry(e.target.value as string);
                setSelectedCity("");
                setSelectedType("");
                setSelectedPilgrimageId("");
              }}
              variant="outlined"
              InputProps={{ sx: { fontWeight: 500 } }}
              InputLabelProps={{ sx: { fontWeight: 500 } }}
              SelectProps={{
                MenuProps: {
                  PaperProps: { sx: { borderRadius: 1 } },
                },
              }}
            >
              {[...new Set(pilgrimages.map((p: any) => p.destination))].map((country) => (
                <MenuItem key={country} value={country}>
                  {countryDisplay(country)}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {/* City Selection */}
        <Card className="rounded-2xl shadow-md col-span-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">Select City</Typography>
            <TextField
              select
              fullWidth
              label="City"
              value={selectedCity || ""}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedType("");
                setSelectedPilgrimageId("");
              }}
              variant="outlined"
              disabled={!selectedCountry}
              InputProps={{ sx: { fontWeight: 500 } }}
              InputLabelProps={{ sx: { fontWeight: 500 } }}
              SelectProps={{
                MenuProps: {
                  PaperProps: { sx: { borderRadius: 1 } },
                },
              }}
            >
              {[...new Set(
                pilgrimages
                  .filter((p: any) => p.destination === selectedCountry)
                  .map((p: any) => p.city)
                  .filter(Boolean)
              )].map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {/* Pilgrimage Type Selection */}
        <Card className="rounded-2xl shadow-md col-span-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">Select Pilgrimage Type</Typography>
            <TextField
              select
              fullWidth
              label="Pilgrimage Type"
              value={selectedType || ""}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedPilgrimageId("");
              }}
              variant="outlined"
              disabled={!selectedCity}
              InputProps={{ sx: { fontWeight: 500 } }}
              InputLabelProps={{ sx: { fontWeight: 500 } }}
              SelectProps={{
                MenuProps: {
                  PaperProps: { sx: { borderRadius: 1 } },
                },
              }}
            >
              {[...new Set(
                pilgrimages
                  .filter(
                    (p: any) =>
                      p.destination === selectedCountry && p.city === selectedCity
                  )
                  .map((p: any) => p.type)
                  .filter(Boolean)
              )].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {/* Pilgrimage Offer/Program Selection */}
        <Card className="rounded-2xl shadow-md col-span-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">Select Pilgrimage Offer</Typography>
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <TextField
                select
                fullWidth
                label="Pilgrimage Program"
                value={selectedPilgrimageId}
                onChange={handlePilgrimageChange}
                variant="outlined"
                disabled={!selectedType}
                InputProps={{ sx: { fontWeight: 500 } }}
                InputLabelProps={{ sx: { fontWeight: 500 } }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: { sx: { borderRadius: 1 } },
                  },
                }}
              >
                {pilgrimages.filter(
                  (p: any) =>
                    p.destination === selectedCountry &&
                    p.city === selectedCity &&
                    p.type === selectedType
                ).length === 0 ? (
                  <MenuItem value="" disabled>
                    No pilgrimage offers available
                  </MenuItem>
                ) : (
                  pilgrimages
                    .filter(
                      (p: any) =>
                        p.destination === selectedCountry &&
                        p.city === selectedCity &&
                        p.type === selectedType
                    )
                    .map((pilgrimage) => (
                      <MenuItem key={pilgrimage.id} value={pilgrimage.id}>
                        {pilgrimage.title}
                        {" - "}
                        {countryDisplay(pilgrimage.destination)}
                        {pilgrimage.city ? ", " + pilgrimage.city : ""}
                        {pilgrimage.price
                          ? ` - ${pilgrimage.price} ${pilgrimage.currency || ""}`
                          : ""}
                      </MenuItem>
                    ))
                )}
              </TextField>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Start Application Button */}
      <Button
        variant="contained"
        fullWidth
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
        disabled={
          !selectedPilgrimageId || submitting
        }
        onClick={handleStartApplication}
      >
        {submitting ? <CircularProgress size={24} color="inherit" /> : "Start Application"}
      </Button>
      {/* "Ad" Images area */}
      <Box
        sx={{ display: "flex", gap: 3, mt: 4, flexDirection: { xs: "column", sm: "row" } }}
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
      </Box>

      {/* Tabs for Recent Applications (for consistency, though only one tab for now) */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Recent Applications"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Applications" />
        </Tabs>
      </Box>
      <Box
        sx={{
          overflowX: "auto",
          width: "100%",
          pb: 1,
        }}
      >
        {tabValue === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loadingApplications ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : recentApplications.length === 0 ? (
              <Typography variant="body2" className="text-gray-500 flex items-center">
                No recent applications found.
              </Typography>
            ) : (
              recentApplications.map((app: any) => {
                const pil = getPilgrimageById(app.pilgrimage_id);
                if (!pil) return null;
                return (
                  <Box key={app.id} sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}>
                    <ApplicationCard
                      title={pil.title}
                      destination={countryDisplay(pil.destination)}
                      city={pil.city}
                      status={app.status}
                      price={pil.price}
                      currency={pil.currency}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        )}
      </Box>
      {/* Guides & Resources */}
      <Typography
        variant="h6"
        className="font-bold mb-4"
        sx={{ mt: 4 }}
      >
        Guide and Resources
      </Typography>
      <div className="flex flex-col md:flex-row gap-4">
        <GuideCard title="Pilgrimage visa Requirements" />
        <GuideCard title="Ultimate guide to Pilgrimage abroad" />
      </div>
    </Box>
  );
};
