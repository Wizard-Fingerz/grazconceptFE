import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getMyRecentSudyVisaOffer } from "../../../../services/studyVisa";
import FilterPanel from "../../../../components/Filter/FilterPanel";

// Helper: Format date
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper: Capitalize words
function capitalizeWords(str: string) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Study Offer Card
const StudyOfferCard: React.FC<{ offer: any; onView: (id: any) => void }> = ({
  offer,
  onView,
}) => (
  <Card
    sx={{
      width: { xs: 320, sm: 350, md: 380 },
      minHeight: 260,
      borderRadius: 3,
      boxShadow: 3,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      p: 2,
    }}
  >
    <CardContent sx={{ flex: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Chip
          label={capitalizeWords(offer.university || offer.institution_name || "Unknown Institution")}
          size="small"
          color="primary"
          sx={{ fontWeight: 500, fontSize: 13 }}
        />
        <Chip
          label={offer.country || "Unknown Country"}
          size="small"
          color="secondary"
          sx={{ fontWeight: 500, fontSize: 13 }}
        />
      </Stack>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {offer.program_name || offer.program || "Unknown Program"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {offer.description || offer.notes || ""}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          Status:
        </Typography>
        <Typography variant="body2">
          {offer.status_label || offer.status || "Pending"}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          Offer Date:
        </Typography>
        <Typography variant="body2">
          {formatDate(offer.created_at || offer.offer_date)}
        </Typography>
      </Stack>
    </CardContent>
    <CardActions sx={{ justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        onClick={() => onView(offer.id)}
      >
        View Details
      </Button>
    </CardActions>
  </Card>
);

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
        const data = await getMyRecentSudyVisaOffer();
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
                <StudyOfferCard key={offer.id || idx} offer={offer} onView={handleViewOffer} />
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
