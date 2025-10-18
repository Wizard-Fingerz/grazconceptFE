import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  // MenuItem,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  Stack,
  Autocomplete,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import api from "../../../../services/api";
import { getAllPilgrimages } from "../../../../services/pilgrimageServices";
import { getAddBanners } from '../../../../services/studyVisa';
import { toast } from "react-toastify";
import { ImageCard } from "../../../../components/ImageCard";
import { useNavigate } from "react-router-dom";

/**
 * ApplicationCard - Reusable card for displaying application info.
 * NOTE: Now displays only the type (not sponsor) under 'Pilgrimage Type'.
 */
export const ApplicationCard: React.FC<{
  title: string;
  destination: string;
  city: string;
  status: string;
  price: string;
  currency: string;
  type?: string;
}> = ({
  title,
  destination,
  city,
  status,
  price,
  currency,
  type,
}) => (
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
            {city ? `, ${city}` : ""}
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
        {type && (
          <Box className="flex items-center gap-2">
            <Typography
              variant="body2"
              className="text-gray-600"
              sx={{ fontWeight: 500, minWidth: 70 }}
            >
              Pilgrimage Type:
            </Typography>
            <Typography variant="body2" className="text-gray-800">
              {type}
            </Typography>
          </Box>
        )}
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
  const navigate = useNavigate();

  // Fetch pilgrimage programs list
  const [pilgrimages, setPilgrimages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selection state
  const [selectedPilgrimageId, setSelectedPilgrimageId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  // New state: Only type, no sponsor
  const [selectedType, setSelectedType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Recent applications
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Tabs: 0 = Recent Applications
  const [tabValue, setTabValue] = useState(0);

  // Banner state
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

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
        await new Promise((r) => setTimeout(r, 400));
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

  // When you select a new (country, city), reset type+offer
  const handleCountryCityChange = (value: string) => {
    const [country, city] = value.split("|");
    setSelectedCountry(country);
    setSelectedCity(city);
    setSelectedType("");
    setSelectedPilgrimageId("");
  };

  // When you select a new type, update state
  const handleTypeChange = (e: any) => {
    const value = e.target.value || "";
    setSelectedType(value);
    setSelectedPilgrimageId("");
  };

  const handleTypeChangeAutocomplete = (_: any, newValue: any) => {
    if (newValue) {
      handleTypeChange({ target: { value: newValue.type } });
    } else {
      handleTypeChange({ target: { value: "" } });
    }
  };

  const handleTabChange = (_: any, newVal: number) => setTabValue(newVal);

  // Start Application handler
  const handleStartApplication = () => {
    if (!selectedPilgrimageId) return;
    navigate(`/travel/pilgrimage/offers/${selectedPilgrimageId}`);
  };

  // Utility to get a pilgrimage object by id from the list
  const getPilgrimageById = (id: number | string) =>
    pilgrimages.find((p) => String(p.id) === String(id));

  // Utility: map country code to readable name if needed (or just show code)
  const countryDisplay = (country: string) => {
    if (country === "SA") return "Saudi Arabia";
    if (country === "IL") return "Israel";
    return country;
  };

  // Compute all unique pilgrimage types (without sponsor) in this country+city as dropdown options
  // Each option is { type }
  const pilgrimageTypeOptions = React.useMemo(() => {
    let filtered = pilgrimages.filter(
      (p: any) => p.destination === selectedCountry && p.city === selectedCity
    );
    const typeSet = new Set<string>();
    filtered.forEach((p) => {
      const types = p.pilgrimage_type_display || [];
      if (Array.isArray(types)) {
        types.forEach((t: string) => t && typeSet.add(t));
      } else if (types) {
        typeSet.add(types);
      }
    });
    return Array.from(typeSet).map((type) => ({ type, display: type }));
  }, [pilgrimages, selectedCountry, selectedCity]);

  // Filter the pilgrimage offers to match all fields.
  const filteredOffers = React.useMemo(() => {
    return pilgrimages.filter((p: any) => {
      if (p.destination !== selectedCountry) return false;
      if (p.city !== selectedCity) return false;
      if (
        selectedType &&
        Array.isArray(p.pilgrimage_type_display) &&
        !p.pilgrimage_type_display.includes(selectedType)
      )
        return false;
      if (
        selectedType &&
        typeof p.pilgrimage_type_display === "string" &&
        p.pilgrimage_type_display !== selectedType
      )
        return false;
      return true;
    });
  }, [pilgrimages, selectedCountry, selectedCity, selectedType]);

  // Combine Country and City into a single selection card
  // All unique combinations of {destination, city}
  const countryCityOptions = React.useMemo(() => {
    const combos = new Set<string>();
    pilgrimages.forEach((p) => {
      if (p.destination && p.city) {
        combos.add(`${p.destination}|${p.city}`);
      }
    });
    // Each is { destination, city }
    return Array.from(combos).map((str) => {
      const [destination, city] = str.split("|");
      return { destination, city };
    });
  }, [pilgrimages]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Combined Country and City Selection */}
        <Card className="rounded-2xl shadow-md flex-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Select Destination Country & City
            </Typography>
            {/* Replace TextField with Autocomplete */}
            <Autocomplete
              fullWidth
              options={countryCityOptions}
              getOptionLabel={({ destination, city }) =>
                `${countryDisplay(destination)}${city ? `, ${city}` : ""}`
              }
              isOptionEqualToValue={(option, value) =>
                option.destination === value.destination && option.city === value.city
              }
              noOptionsText="No destinations available"
              value={
                selectedCountry && selectedCity
                  ? countryCityOptions.find(
                      (opt) =>
                        opt.destination === selectedCountry &&
                        opt.city === selectedCity
                    ) || null
                  : null
              }
              onChange={(_, newValue) => {
                if (newValue) {
                  handleCountryCityChange(`${newValue.destination}|${newValue.city}`);
                } else {
                  handleCountryCityChange("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country & City"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    sx: { fontWeight: 500 }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 500 } }}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Pilgrimage Type Selection */}
        <Card className="rounded-2xl shadow-md flex-1">
          <CardContent className="flex flex-col gap-2">
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Select Pilgrimage Type
            </Typography>
            <Autocomplete
              fullWidth
              options={pilgrimageTypeOptions}
              getOptionLabel={(opt) => opt.display || ""}
              isOptionEqualToValue={(option, value) =>
                option.type === value.type
              }
              noOptionsText="No type options available"
              value={
                selectedType
                  ? pilgrimageTypeOptions.find(
                      (opt) => opt.type === selectedType
                    ) || null
                  : null
              }
              onChange={handleTypeChangeAutocomplete}
              disabled={
                !selectedCountry ||
                !selectedCity ||
                pilgrimageTypeOptions.length === 0
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pilgrimage Type"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    sx: { fontWeight: 500 }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 500 } }}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Pilgrimage Offer/Program Selection */}
        <Card className="rounded-2xl shadow-md flex-1">
          <CardContent className="flex flex-col gap-2">
            <Typography
              variant="subtitle1"
              className="font-semibold mb-2"
            >
              Select Pilgrimage Offer
            </Typography>
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <Autocomplete
                fullWidth
                options={filteredOffers}
                getOptionLabel={(pilgrimage) =>
                  pilgrimage
                    ? `${pilgrimage.title} - ${countryDisplay(
                        pilgrimage.destination
                      )}${pilgrimage.city ? `, ${pilgrimage.city}` : ""}${
                        pilgrimage.price
                          ? ` - ${pilgrimage.price} ${pilgrimage.currency || ""}`
                          : ""
                      }`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                noOptionsText="No pilgrimage offers available"
                value={
                  filteredOffers.find((p) => p.id === selectedPilgrimageId) || null
                }
                onChange={(_, newValue) => {
                  handlePilgrimageChange({
                    target: { value: newValue ? newValue.id : "" }
                  });
                }}
                disabled={!selectedType}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pilgrimage Program"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      sx: { fontWeight: 500 }
                    }}
                    InputLabelProps={{ sx: { fontWeight: 500 } }}
                  />
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>
      {/* Start Application Button */}
      <Button
        variant="contained"
        fullWidth
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
        disabled={!selectedPilgrimageId || submitting}
        onClick={handleStartApplication}
      >
        {submitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Start Application"
        )}
      </Button>

      {/* Dashboard Banners area (replaces previous ad images area) */}
     {/* Applications (Start a New Application) */}
     {!loadingBanners && banners && banners.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
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
                      // handleActionClick(banner.actionLabel);
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
      {/* Tabs for Recent Applications (for consistency, though only one tab for now) */}
      <Box sx={{ mt: 4, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Applications and Offers"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Applications" />
          <Tab label="Recent Offers" />
        </Tabs>
        {/* View all button, changes based on tab */}
        {tabValue === 0 ? (
          <Button
            size="small"
            variant="text"
            sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}
            onClick={() => {
              navigate("/travel/pilgrimage/applications");
            }}
          >
            View all
          </Button>
        ) : (
          <Button
            size="small"
            variant="text"
            sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}
            onClick={() => {
              navigate("/travel/pilgrimage/offers");
            }}
          >
            View all
          </Button>
        )}
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
              <Typography
                variant="body2"
                className="text-gray-500 flex items-center"
              >
                No recent applications found.
              </Typography>
            ) : (
              recentApplications.map((app: any) => {
                const pil = getPilgrimageById(app.pilgrimage_id);
                if (!pil) return null;

                // Only display pilgrimage_type_display, not sponsor
                let type = "";
                if (pil.pilgrimage_type_display) {
                  if (Array.isArray(pil.pilgrimage_type_display)) {
                    type = pil.pilgrimage_type_display.join(", ");
                  } else {
                    type = pil.pilgrimage_type_display;
                  }
                }

                return (
                  <Box
                    key={app.id}
                    sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}
                  >
                    <ApplicationCard
                      title={pil.title}
                      destination={countryDisplay(pil.destination)}
                      city={pil.city}
                      status={app.status}
                      price={pil.price}
                      currency={pil.currency}
                      type={type}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        )}
        {/* Recent Offers Tab */}
        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loading ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : pilgrimages?.length === 0 ? (
              <Typography
                variant="body2"
                className="text-gray-500 flex items-center"
              >
                No recent offers found.
              </Typography>
            ) : (
              pilgrimages
                .slice(0, 7)
                .map((offer: any) => {
                  let type = "";
                  if (offer.pilgrimage_type_display) {
                    if (Array.isArray(offer.pilgrimage_type_display)) {
                      type = offer.pilgrimage_type_display.join(", ");
                    } else {
                      type = offer.pilgrimage_type_display;
                    }
                  }
                  return (
                    <Box
                      key={offer.id}
                      sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}
                    >
                      <ApplicationCard
                        title={offer.title}
                        destination={countryDisplay(offer.destination)}
                        city={offer.city}
                        status={offer.status || "Open"}
                        price={offer.price}
                        currency={offer.currency}
                        type={type}
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
