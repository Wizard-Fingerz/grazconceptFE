import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { VacationCard } from "../../../../components/VacationCard";
import { getAllVacations } from "../../../../services/vacationService";

const PAGE_SIZE = 15; // Adjustable based on desired page size

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

// Optionally, for demonstration purposes. You might want to get these from API in real cases.
const destinations = [
  { label: "Mexico to Accra", value: "mexico-accra" },
  { label: "India to Mexico", value: "india-mexico" },
  { label: "America to Cameroon", value: "america-cameroon" },
];

const flightTypes = [
  { label: "One-Way", value: "oneWay" },
  { label: "Round Trip", value: "roundTrip" },
  { label: "Multi-City", value: "multiCity" },
];

const VacationPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({});
  const [vacationData, setVacationData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);

  // Standalone search
  const [search, setSearch] = useState<string>("");

  // For filter panel dynamic options (countries, etc) if needed
  const filterConfig = useMemo(() => [
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
      options: destinations,
    },
    {
      type: "radio",
      name: "flightType",
      title: "Flight Type",
      options: flightTypes,
    },
    // Add more based on actual API fields/columns
  ], []);

  // Build query parameters for API based on filters and pagination
  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {
      page,
      page_size: PAGE_SIZE,
    };
    // Add filters to params as needed for your backend API contract
    if (filters.destination && Array.isArray(filters.destination) && filters.destination.length > 0) {
      params.destination = filters.destination.join(",");
    }
    if (filters.flightType) {
      params.flight_type = filters.flightType;
    }
    if (filters.price && Array.isArray(filters.price) && filters.price.length === 2) {
      params.price__gte = filters.price[0];
      params.price__lte = filters.price[1];
    }
    if (filters.search && typeof filters.search === "string" && filters.search.trim().length > 0) {
      params.search = filters.search.trim();
    }
    if (search && typeof search === "string" && search.trim().length > 0) {
      params.search = search.trim();
    }
    // ...add any other filters here
    return params;
  }, [filters, page, search]);

  // Fetch vacation data with filters and pagination
  useEffect(() => {
    const fetchVacations = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildQueryParams();
        const data = await getAllVacations(params);
        // If the API returns { results: [...], count, num_pages }, use accordingly
        setVacationData(Array.isArray(data) ? data : data.results || []);
        setCount(typeof data.count === "number" ? data.count : (Array.isArray(data) ? data.length : 0));
        setNumPages(typeof data.num_pages === "number" ? data.num_pages : Math.ceil((Array.isArray(data) ? data.length : (data.count || 0)) / PAGE_SIZE));
      } catch (err: any) {
        setError("Failed to load vacation packages.");
        setVacationData([]);
        setCount(0);
        setNumPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchVacations();
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search field
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
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Vacation Packages
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all available vacation packages and explore your next get-away.
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
            ? "Loading vacation packages..."
            : error
            ? ""
            : `${count} package${count === 1 ? "" : "s"} found`}
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
            placeholder="Search by title, destination..."
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
                <Typography>Loading vacation packages...</Typography>
              </Box>
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
