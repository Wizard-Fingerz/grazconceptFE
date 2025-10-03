import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAllSudyVisaOffer } from "../../../../services/studyVisa";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { OfferCard } from "../../../../components/StudyVisaCard";
import { capitalizeWords } from "../../../../utils";


const AllStudyOffers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});

  // For filter options, extract unique values from offers
  const filterConfig = useMemo(() => {
    const countries = Array.from(
      new Set(offers.map((o) => o.country).filter(Boolean))
    );
    const institutions = Array.from(
      new Set(
        offers
          .map((o) => o.university || o.institution_name)
          .filter((name) => !!name)
      )
    );
    const programs = Array.from(
      new Set(
        offers
          .map((o) => o.program_name || o.program)
          .filter((p) => !!p)
      )
    );
    const statuses = Array.from(
      new Set(
        offers
          .map((o) => o.status_label || o.status)
          .filter((s) => !!s)
      )
    );
    return [
      {
        type: "checkbox",
        name: "country",
        title: "Country",
        options: countries.map((c) => ({ label: c, value: c })),
      },
      {
        type: "checkbox",
        name: "institution",
        title: "Institution",
        options: institutions.map((i) => ({ label: capitalizeWords(i), value: i })),
      },
      {
        type: "checkbox",
        name: "program",
        title: "Program",
        options: programs.map((p) => ({ label: p, value: p })),
      },
      {
        type: "checkbox",
        name: "status",
        title: "Status",
        options: statuses.map((s) => ({ label: s, value: s })),
      },
    ];
  }, [offers]);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        // This API should return all offers for the user
        const data = await getAllSudyVisaOffer();
        setOffers(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError("Failed to load study offers.");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Filtering logic
  const filteredOffers = useMemo(() => {
    if (!offers.length) return [];
    return offers.filter((offer) => {
      // Country filter
      if (
        filters.country &&
        Array.isArray(filters.country) &&
        filters.country.length > 0 &&
        !filters.country.includes(offer.country)
      ) {
        return false;
      }
      // Institution filter
      if (
        filters.institution &&
        Array.isArray(filters.institution) &&
        filters.institution.length > 0 &&
        !filters.institution.includes(offer.university || offer.institution_name)
      ) {
        return false;
      }
      // Program filter
      if (
        filters.program &&
        Array.isArray(filters.program) &&
        filters.program.length > 0 &&
        !filters.program.includes(offer.program_name || offer.program)
      ) {
        return false;
      }
      // Status filter
      if (
        filters.status &&
        Array.isArray(filters.status) &&
        filters.status.length > 0 &&
        !filters.status.includes(offer.status_label || offer.status)
      ) {
        return false;
      }
      return true;
    });
  }, [offers, filters]);

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
  };

  const handleViewOffer = (offerId: string | number) => {
    // You can use react-router's useNavigate if available
    window.location.href = `/travel/study-visa/offer/${offerId}`;
  };

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
          Study Visa Offers
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all your study visa offers from institutions around the world.
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
        {/* Study Offer Cards */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              mt: 2,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  mt: 6,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredOffers.length === 0 ? (
              <Typography>No study visa offers found.</Typography>
            ) : (
              filteredOffers.map((offer: any, idx: number) => (
                <OfferCard key={offer.id || idx} offer={offer} onViewOffer={() => handleViewOffer(offer.id)} />
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

export default AllStudyOffers;
