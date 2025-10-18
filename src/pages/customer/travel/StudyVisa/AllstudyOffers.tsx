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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAllSudyVisaOffer } from "../../../../services/studyVisa";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { OfferCard } from "../../../../components/StudyVisaCard";
import { capitalizeWords } from "../../../../utils";

const PAGE_SIZE = 15; // Default page size, can be adjusted if needed

const AllStudyOffers: React.FC = () => {
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

  // For filter options, extract unique values from all offers (not just current page)
  // To do this, we need to fetch all offers for filter options, but for now, use current page
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
    // Use program_type_name for the program filter
    const programs = Array.from(
      new Set(
        offers
          .map((o) => o.program_type_name)
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
    // Add search field as the first filter
    return [
      {
        type: "search",
        name: "search",
        title: "Search",
        placeholder: "Search by program, institution, country...",
      },
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

  // Build query params for filters and pagination
  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {
      page,
      page_size: PAGE_SIZE,
    };
    // Add filters
    if (filters.country && Array.isArray(filters.country) && filters.country.length > 0) {
      params.country = filters.country.join(",");
    }
    if (filters.institution && Array.isArray(filters.institution) && filters.institution.length > 0) {
      params.institution_name = filters.institution.join(",");
    }
    // For program filter, use program_type_name as the param
    if (filters.program && Array.isArray(filters.program) && filters.program.length > 0) {
      params.program_type_name = filters.program.join(",");
    }
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
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
        // getAllSudyVisaOffer should accept query params for pagination and filters
        const params = buildQueryParams();
        const data = await getAllSudyVisaOffer(params);
        // API returns { count, next, previous, num_pages, page_size, current_page, results }
        setOffers(Array.isArray(data) ? data : data.results || []);
        setCount(data.count || 0);
        setNumPages(data.num_pages || 1);
      } catch (err) {
        setError("Failed to load study offers.");
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
    window.location.href = `/travel/study-visa/offer/${offerId}`;
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          Apply your preferred program
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all your study visa offers from institutions around the world.
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
            placeholder="Search by program, institution, country..."
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
            ) : offers.length === 0 ? (
              <Typography>No study visa offers found.</Typography>
            ) : (
              offers.map((offer: any, idx: number) => (
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

export default AllStudyOffers;
