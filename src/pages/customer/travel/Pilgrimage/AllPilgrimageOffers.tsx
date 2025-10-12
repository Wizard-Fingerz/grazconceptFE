import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAllPilgrimages } from "../../../../services/pilgrimageServices";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { capitalizeWords } from "../../../../utils";
import { useNavigate } from "react-router-dom";

/** Simple utility to display country code as label; can be replaced with more advanced logic if needed */
const countryDisplay = (code: string) => {
  const countries: Record<string, string> = {
    SA: "Saudi Arabia",
    IL: "Israel",
    NG: "Nigeria",
    // Add more as needed...
  };
  return countries[code] || code;
};

const PAGE_SIZE = 15;

const OfferCard: React.FC<{
  offer: any;
  onViewOffer: () => void;
}> = ({ offer, onViewOffer }) => {
  const typeAndSponsor =
    (offer.pilgrimage_type_display
      ? Array.isArray(offer.pilgrimage_type_display)
        ? offer.pilgrimage_type_display.join(", ")
        : offer.pilgrimage_type_display
      : "") +
    (offer.sponsorship_display
      ? " (" +
        (Array.isArray(offer.sponsorship_display)
          ? offer.sponsorship_display.join(", ")
          : offer.sponsorship_display) +
        ")"
      : "");
  return (
    <Card
      className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
      sx={{ width: 320, minHeight: 260, display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight={700}>{offer.title}</Typography>
          <Chip
            size="small"
            label={offer.seats_available > 0 ? "Open" : "Closed"}
            color={offer.seats_available > 0 ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body2" gutterBottom sx={{ color: "#616161" }}>
          {typeAndSponsor}
        </Typography>
        <Typography variant="body2">
          <strong>Destination:</strong> {countryDisplay(offer.destination)}
          {offer.city ? `, ${offer.city}` : ""}
        </Typography>
        {offer.price && (
          <Typography variant="body2">
            <strong>Price:</strong> {offer.price} {offer.currency || ""}
          </Typography>
        )}
        <Typography variant="body2">
          <strong>Dates:</strong>{" "}
          {offer.start_date
            ? `${new Date(offer.start_date).toLocaleDateString()}`
            : ""}
          {offer.end_date
            ? ` - ${new Date(offer.end_date).toLocaleDateString()}`
            : ""}
        </Typography>
        {offer.included_items && offer.included_items.length > 0 && (
          <Box mt={1}>
            <Typography variant="body2" fontWeight={600}>
              Included:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {offer.included_items.map((item: any) => (
                <li key={item.id}>
                  <Typography variant="body2">{item.name}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        {/* Description as last item */}
        {offer.description && (
          <Typography variant="body2" sx={{ mt: 1, color: "#757575" }}>
            {offer.description}
          </Typography>
        )}
        <Box flexGrow={1} />
        <Button
          variant="contained"
          color="primary"
          onClick={onViewOffer}
          sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
          fullWidth
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

const AllPilgrimageOffers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState<number>(1);

  // Pagination state from API
  const [count, setCount] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(1);

  // For search field
  const [search, setSearch] = useState<string>("");

  const navigate = useNavigate();

  // For filter options, extract unique values from all offers (not just current page)
  const filterConfig = useMemo(() => {
    const types = Array.from(
      new Set(
        offers
          .flatMap((o) =>
            o.pilgrimage_type_display
              ? Array.isArray(o.pilgrimage_type_display)
                ? o.pilgrimage_type_display
                : [o.pilgrimage_type_display]
              : []
          )
          .filter(Boolean)
      )
    );
    const countries = Array.from(
      new Set(offers.map((o) => o.destination).filter(Boolean))
    );
    const cities = Array.from(
      new Set(offers.map((o) => o.city).filter(Boolean))
    );
    const sponsors = Array.from(
      new Set(
        offers
          .flatMap((o) =>
            o.sponsorship_display
              ? Array.isArray(o.sponsorship_display)
                ? o.sponsorship_display
                : [o.sponsorship_display]
              : []
          )
          .filter(Boolean)
      )
    );
    const statuses = [
      ...new Set(offers.map((o) => (o.seats_available > 0 ? "Open" : "Closed"))),
    ];
    return [
      {
        type: "search",
        name: "search",
        title: "Search",
        placeholder: "Search by title, destination, type...",
      },
      {
        type: "checkbox",
        name: "type",
        title: "Pilgrimage Type",
        options: types.map((t) => ({ label: t, value: t })),
      },
      {
        type: "checkbox",
        name: "country",
        title: "Country",
        options: countries.map((c) => ({
          label: countryDisplay(c),
          value: c,
        })),
      },
      {
        type: "checkbox",
        name: "city",
        title: "City",
        options: cities.map((city) => ({ label: capitalizeWords(city), value: city })),
      },
      {
        type: "checkbox",
        name: "sponsor",
        title: "Sponsor",
        options: sponsors.map((s) => ({ label: s, value: s })),
      },
      {
        type: "checkbox",
        name: "status",
        title: "Status",
        options: statuses.map((s) => ({ label: s, value: s })),
      },
    ];
  }, [offers]);

  // Build query params for filters and pagination
  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {
      page,
      page_size: PAGE_SIZE,
    };
    if (filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
      params.pilgrimage_type_display = filters.type.join(",");
    }
    if (filters.country && Array.isArray(filters.country) && filters.country.length > 0) {
      params.destination = filters.country.join(",");
    }
    if (filters.city && Array.isArray(filters.city) && filters.city.length > 0) {
      params.city = filters.city.join(",");
    }
    if (filters.sponsor && Array.isArray(filters.sponsor) && filters.sponsor.length > 0) {
      params.sponsorship_display = filters.sponsor.join(",");
    }
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      // There's no backend field for seats_available status, so will filter on frontend
      params.status = filters.status.join(",");
    }
    // Add search param if present
    if (filters.search && typeof filters.search === "string" && filters.search.trim().length > 0) {
      params.search = filters.search.trim();
    }
    return params;
  }, [filters, page]);

  // Fetch offers with pagination and filters
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildQueryParams();
        // getAllPilgrimages should support params
        const data = await getAllPilgrimages(params);
        setOffers(Array.isArray(data) ? data : data.results || []);
        setCount(data.count || 0);
        setNumPages(data.num_pages || 1);
      } catch (err) {
        setError("Failed to load pilgrimage offers.");
        setOffers([]);
        setCount(0);
        setNumPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
    // eslint-disable-next-line
  }, [buildQueryParams]);

  // When filters change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFilters({});
    setSearch("");
  };

  const handleViewOffer = (offerId: string | number) => {
    navigate(`/travel/pilgrimage/offers/${offerId}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Frontend filter for status (Open/Closed)
  const filteredOffers = useMemo(() => {
    if (!filters.status || !Array.isArray(filters.status) || filters.status.length === 0)
      return offers;
    return offers.filter((o) =>
      filters.status.includes(o.seats_available > 0 ? "Open" : "Closed")
    );
  }, [offers, filters.status]);

  // Handle search field (debounced update to filters)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters((prev: any) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: any) => ({
      ...prev,
      search: search,
    }));
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
          Pilgrimage Offers
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all available pilgrimage offers and programs.
        </Typography>
      </CustomerPageHeader>

      {/* Show count and search field above the main content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {loading
            ? "Loading offers..."
            : error
            ? ""
            : `${count} offer${count === 1 ? "" : "s"} found`}
        </Typography>
        {/* Standalone search field for quick search */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ width: { xs: "100%", sm: 320 } }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by title, destination, type..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    aria-label="search"
                    edge="end"
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ background: "#fff" }}
          />
        </Box>
      </Box>

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
        {/* Pilgrimage Offer Cards */}
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
              <Typography>No pilgrimage offers found.</Typography>
            ) : (
              filteredOffers.map((offer: any, idx: number) => (
                <OfferCard key={offer.id || idx} offer={offer} onViewOffer={() => handleViewOffer(offer.id)} />
              ))
            )}
          </Box>
          {/* Pagination */}
          {!loading && !error && numPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={numPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
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

export default AllPilgrimageOffers;
