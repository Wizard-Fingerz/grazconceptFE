import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import HotelCard from "../../../components/HotelCard";
import FilterPanel from "../../../components/Filter/FilterPanel";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";

// Example hotel data
const hotelData = [
  {
    image: "/hotel.jpg",
    name: "Grand Plaza Hotel",
    rating: 4.5,
    reviews: "1/mgt",
    price: "$2000/night",
    description: "Location in downtown with luxury amenities.",
  },
  {
    image: "/hotel.jpg",
    name: "Seaside Resort",
    rating: 4,
    price: "$1500/night",
    description: "Beautiful beachfront resort with all-inclusive services.",
  },
];

// Example filter config (customize as needed)
const filterConfig = [
  {
    type: "slider",
    name: "price",
    title: "Price Range",
    min: 500,
    max: 3000,
    step: 100,
  },
  {
    type: "checkbox",
    name: "location",
    title: "Location",
    options: [
      { label: "Downtown", value: "downtown" },
      { label: "Beachfront", value: "beachfront" },
    ],
  },
  {
    type: "radio",
    name: "rating",
    title: "Minimum Rating",
    options: [
      { label: "4 stars", value: 4 },
      { label: "4.5 stars", value: 4.5 },
      { label: "5 stars", value: 5 },
    ],
  },
];

const HotelReservation: React.FC = () => {
  const [filters, setFilters] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  // Optionally filter hotelData based on filters (not implemented here)
  // For now, just show all hotels

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
   
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Hotel Reservation
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
      {/* Hotel Cards */}
      <Box sx={{ flex: 1 }}>
      
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {hotelData.map((hotel) => (
            <HotelCard
              key={hotel.name}
              image={hotel.image}
              name={hotel.name}
              rating={hotel.rating}
              reviews={hotel.reviews}
              price={hotel.price}
              description={hotel.description}
              onReserve={() => alert(`Reserved ${hotel.name}`)}
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

export default HotelReservation;
