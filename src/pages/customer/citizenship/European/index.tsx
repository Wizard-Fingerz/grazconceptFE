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
import CountryCard from "../../../../components/CountryCard";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { getEuropeanCitizenshipPrograms } from "../../../../services/citizenshipServices";
import { useNavigate } from "react-router-dom";

// Page size for pagination (same as study offer page)
const PAGE_SIZE = 15;

// Changing id type to number, and making it required
type CitizenshipCountry = {
  id: number; // id should be number and required
  country: string;
  quote: string;
  type: string;
  minimumInvestment: string;
  visaFreeAccess: string;
  dualCitizenship: string;
  flagUrl: string;
  gradient: string;
};

type Filters = {
  search?: string;
  type?: string[];
  dualCitizenship?: string[];
};

const defaultFilters: Filters = {};

// Helper function: Normalize API to required UI structure, coerce id to number
function normalizeCountry(program: any): CitizenshipCountry {
  return {
    id: typeof program.id === "number" ? program.id : Number(program.id ?? program._id ?? 0),
    country: program.country?.name ?? "",
    quote: program.quote || program.description || "",
    type: typeof program.type === "string" ? program.type : String(program.type ?? ""),
    minimumInvestment: program.minimum_investment || "",
    visaFreeAccess: program.visa_free_access || "",
    dualCitizenship: program.dual_citizenship || "",
    flagUrl: program.flag_url || "",
    gradient: program.gradient || "",
  };
}

const EuropianCitizenshipListPage: React.FC = () => {
  const [countries, setCountries] = useState<CitizenshipCountry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState<number>(1);
  const [filterConfig, setFilterConfig] = useState<any[]>([]);
  const [search, setSearch] = useState<string>(""); // Form for search
  const navigate = useNavigate();

  // Fetch citizenship programs from API
  const fetchCitizenshipData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEuropeanCitizenshipPrograms();

      // Map API results to normalized CitizenshipCountry[]
      const countryList: CitizenshipCountry[] = (data.results || []).map(normalizeCountry);

      setCountries(countryList);
      setLoading(false);

      // Dynamically build filter options based on data
      setFilterConfig([
        {
          type: "search",
          name: "search",
          title: "Search",
          placeholder: "Search by country, program type, investment...",
        },
        {
          type: "checkbox",
          name: "type",
          title: "Program Type",
          options: [
            ...Array.from(
              new Set(
                countryList.map((c: CitizenshipCountry) => c.type).filter(Boolean)
              )
            ).map((t) => ({ label: t, value: t })),
          ],
        },
        {
          type: "checkbox",
          name: "dualCitizenship",
          title: "Dual Citizenship",
          options: [
            ...Array.from(
              new Set(
                countryList.map((c: CitizenshipCountry) => c.dualCitizenship).filter(Boolean)
              )
            ).map((t) => ({ label: t, value: t })),
          ],
        },
      ]);
    } catch {
      setCountries([]);
      setLoading(false);
      setFilterConfig([
        // fallback config
        { type: "search", name: "search", title: "Search", placeholder: "Search by country, program type, investment..." },
        { type: "checkbox", name: "type", title: "Program Type", options: [] },
        { type: "checkbox", name: "dualCitizenship", title: "Dual Citizenship", options: [] },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCitizenshipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtering logic following the AllStudyOffers approach (search and checkboxes)
  const filteredCountries = useMemo(() => {
    let filtered = countries;
    // Search filter
    const searchTerm = (filters.search || "").trim().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter((c) =>
        (c.country?.toLowerCase().includes(searchTerm)) ||
        (c.type?.toLowerCase().includes(searchTerm)) ||
        (c.quote?.toLowerCase().includes(searchTerm)) ||
        (c.minimumInvestment?.toLowerCase().includes(searchTerm)) ||
        (c.visaFreeAccess?.toLowerCase().includes(searchTerm))
      );
    }
    // Type filter
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((c) =>
        filters.type?.includes(c.type)
      );
    }
    // Dual citizenship filter
    if (filters.dualCitizenship && filters.dualCitizenship.length > 0) {
      filtered = filtered.filter((c) =>
        filters.dualCitizenship?.includes(c.dualCitizenship)
      );
    }
    return filtered;
  }, [countries, filters]);

  // Pagination
  const count = filteredCountries.length;
  const numPages = Math.ceil(count / PAGE_SIZE);
  const paginatedCountries = useMemo(
    () =>
      filteredCountries.slice(
        (page - 1) * PAGE_SIZE,
        (page - 1) * PAGE_SIZE + PAGE_SIZE
      ),
    [filteredCountries, page]
  );

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  // On submit, update search in filters (just in case, as in AllStudyOffers)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: search,
    }));
  };

  const handleChange = (name: string, value: any) => {
    setFilters((prev: Filters) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFilters({});
    setSearch("");
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -- Navigation handler for program id (now always a number)
  const handleCardClick = (countryId: number) => {
    if (!countryId && countryId !== 0) return;
    navigate(`/citizenship/europe/apply/${countryId}`);
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
          Europe Second Citizenship
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Explore European countries offering residency and citizenship by investment. Enjoy access to world-class healthcare, education, and global mobility.
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
            ? "Loading country programs..."
            : `${count} program${count === 1 ? "" : "s"} found`}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ width: { xs: "100%", sm: 320 } }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by country, program type, investment..."
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
        {/* Citizenship Country Cards */}
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
            ) : count === 0 ? (
              <Typography>No European citizenship programs found.</Typography>
            ) : (
              paginatedCountries.map((c, idx) => (
                <Box
                  key={`${c.id}-${c.country}-${idx}`}
                  onClick={() => handleCardClick(c.id)}
                  sx={{ cursor: "pointer", flex: "0 1 356px" /* match CountryCard minWidth */ }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(c.id);
                    }
                  }}
                  aria-label={`Apply for ${c.country} citizenship`}
                >
                  <CountryCard {...c} />
                </Box>
              ))
            )}
          </Box>
          {/* Pagination */}
          {!loading && numPages > 1 && (
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

export default EuropianCitizenshipListPage;
