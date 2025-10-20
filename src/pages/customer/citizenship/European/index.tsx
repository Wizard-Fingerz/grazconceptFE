import React, { useEffect, useState, useMemo } from "react";
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

const europeanCitizenshipCountries: any[] = [
  {
    country: "Portugal",
    quote: "Where old-world charm meets modern lifestyle.",
    type: "Golden Visa",
    minimumInvestment: "€280,000+",
    visaFreeAccess: "190+ countries",
    dualCitizenship: "Allowed",
    flagUrl: "https://flagcdn.com/pt.svg",
    gradient: "linear-gradient(135deg, #ffffff 30%, #4f8cff 100%)",
  },
  {
    country: "Greece",
    quote: "Live your myth in Europe.",
    type: "Golden Visa",
    minimumInvestment: "€250,000+",
    visaFreeAccess: "185+ countries",
    dualCitizenship: "Allowed",
    flagUrl: "https://flagcdn.com/gr.svg",
    gradient: "linear-gradient(135deg, #ffffff 30%, #009bb8 100%)",
  },
  {
    country: "Malta",
    quote: "Gateway to Europe with a rich history.",
    type: "Citizenship by Investment",
    minimumInvestment: "€600,000+",
    visaFreeAccess: "190+ countries",
    dualCitizenship: "Allowed",
    flagUrl: "https://flagcdn.com/mt.svg",
    gradient: "linear-gradient(135deg, #ffffff 30%, #bfa974 100%)",
  },
  {
    country: "Spain",
    quote: "Sunshine, siestas, and second citizenship.",
    type: "Golden Visa",
    minimumInvestment: "€500,000+",
    visaFreeAccess: "190+ countries",
    dualCitizenship: "Restricted",
    flagUrl: "https://flagcdn.com/es.svg",
    gradient: "linear-gradient(135deg, #ffffff 30%, #e20327 100%)",
  },
  {
    country: "Turkey",
    quote: "A transcontinental bridge to the world.",
    type: "Citizenship by Investment",
    minimumInvestment: "$400,000+",
    visaFreeAccess: "110+ countries",
    dualCitizenship: "Allowed",
    flagUrl: "https://flagcdn.com/tr.svg",
    gradient: "linear-gradient(135deg, #ffffff 30%, #e30a17 100%)",
  },
];

// Page size for pagination (same as study offer page)
const PAGE_SIZE = 6;

// Filter config similar to study visa pattern - include search!
const filterConfig = [
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
        new Set(europeanCitizenshipCountries.map((c) => c.type).filter(Boolean))
      ).map((t) => ({ label: t, value: t })),
    ],
  },
  {
    type: "checkbox",
    name: "dualCitizenship",
    title: "Dual Citizenship",
    options: [
      ...Array.from(
        new Set(europeanCitizenshipCountries.map((c) => c.dualCitizenship).filter(Boolean))
      ).map((t) => ({ label: t, value: t })),
    ],
  },
];

type Filters = {
  search?: string;
  type?: string[];
  dualCitizenship?: string[];
};

const defaultFilters: Filters = {};

const EuropianCitizenshipListPage: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState<number>(1);

  // Sync data (simulate API call)
  useEffect(() => {
    setTimeout(() => {
      setCountries(europeanCitizenshipCountries);
      setLoading(false);
    }, 500);
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

  // Form for search (separate search field as in AllStudyOffers)
  const [search, setSearch] = useState<string>("");

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
                <CountryCard key={c.country + idx} {...c} />
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
