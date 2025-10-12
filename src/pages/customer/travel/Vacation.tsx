import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { VacationCard } from "../../../components/VacationCard";
import { getAllVacations } from "../../../services/vacationService";

const getMainImage = (vac: any) => {
  // Priority: vac.image > first of vac.images > fallback image
  if (vac.image) {
    return vac.image;
  }
  if (Array.isArray(vac.images) && vac.images.length > 0 && vac.images[0].image) {
    return vac.images[0].image;
  }
  return "/vacation.jpg";
};

const VacationPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({});
  const [vacationData, setVacationData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVacations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllVacations();
        // If the API returns { results: [...] }, use data.results, else use data directly
        setVacationData(Array.isArray(data) ? data : data.results || []);
      } catch (err: any) {
        setError("Failed to load vacation packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchVacations();
  }, []);

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  const filterConfig = [
    {
      type: "slider",
      name: "price",
      title: "Price Range",
      min: 100,
      max: 1000,
      step: 50,
    },
    {
      type: "checkbox",
      name: "destination",
      title: "Destination",
      options: [
        { label: "Mexico to Accra", value: "mexico-accra" },
        { label: "India to Mexico", value: "india-mexico" },
        { label: "America to Cameroon", value: "america-cameroon" },
      ],
    },
    {
      type: "radio",
      name: "flightType",
      title: "Flight Type",
      options: [
        { label: "One-Way", value: "oneWay" },
        { label: "Round Trip", value: "roundTrip" },
        { label: "Multi-City", value: "multiCity" },
      ],
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Vacation
        </Typography>
      </CustomerPageHeader>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "flex-start" },
          justifyContent: "space-between",
          mb: 8,
          gap: { xs: 0, md: 4 }, // Add gap between cards and filter on desktop
        }}
      >
        {/* Vacation Cards */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            {loading ? (
              <Typography>Loading vacation packages...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : vacationData.length === 0 ? (
              <Typography>No vacation packages found.</Typography>
            ) : (
              vacationData.map((vac: any, idx: number) => (
                <VacationCard
                  key={vac.id || idx}
                  image={getMainImage(vac)}
                  title={vac.title}
                  price={vac.price}
                  currency={vac.currency}
                  description={vac.description}
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
            // On desktop, align filter panel to the top of the cards
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

export default VacationPage;
