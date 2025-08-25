import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { VacationCard } from "../../../components/VacationCard";


const vacationData = [
  {
    image: "/vacation.jpg",
    title: "Discover Dubai Getaway",
    price: 200,
    description: "Flight + 5-star hotel, City tour, Airport transfer",
  },
  {
    image: "/vacation.jpg",
    title: "Explore Paris Adventure",
    price: 400,
    description: "Flight + 4-star hotel, Eiffel Tower tour, River cruise",
  },
  {
    image: "/vacation.jpg",
    title: "Maldives Beach Escape",
    price: 600,
    description: "Flight + Resort, Water sports, Island hopping",
  },
  {
    image: "/vacation.jpg",
    title: "New York City Lights",
    price: 800,
    description: "Flight + 5-star hotel, Broadway show, City tour",
  },
];

const VacationPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({});

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
            {vacationData.map((vac, idx) => (
              <VacationCard
                key={idx}
                image={vac.image}
                title={vac.title}
                price={vac.price}
                description={vac.description}
              />
            ))}
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
