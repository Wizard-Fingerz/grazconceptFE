import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import FilterPanel from "../../../../components/Filter/FilterPanel";
import Tooltip from "@mui/material/Tooltip";
import { getAllWorkVisaApplication } from "../../../../services/workVisaService";

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

// Helper: Map status (object or primitive) to label
function getStatusLabel(status: any, submittedAt?: string) {
  if (submittedAt) return "Submitted";
  if (status && typeof status === "object" && status.term) return capitalizeWords(status.term);
  if (typeof status === "string") return capitalizeWords(status);
  if (typeof status === "number") {
    if (status === 33) return "Draft";
    return `Status #${status}`;
  }
  return "Draft";
}

const MAX_OCCUPATION_NAME_LENGTH = 18;

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// Card for Work Visa Application
const WorkVisaApplicationCard: React.FC<{ app: any; onContinue: (id: any) => void }> = ({
  app,
  onContinue,
}) => {
  // Get occupation/job title
  const occupation =
    app.offer?.job_title ||
    app.occupation ||
    app.position ||
    (typeof app.job_title === "string"
      ? app.job_title
      : app.job && typeof app.job === "object" && app.job.title
      ? app.job.title
      : "Unknown Occupation");

  const truncatedOccupation = truncateText(occupation, MAX_OCCUPATION_NAME_LENGTH);

  // Get company/employer
  const company =
    app.offer?.organization?.name ||
    app.company_name ||
    app.employer ||
    (typeof app.company === "string"
      ? app.company
      : app.company && typeof app.company === "object" && app.company.name
      ? app.company.name
      : "Unknown Employer");

  // Get country
  const country =
    app.offer?.country ||
    app.country ||
    app.destination_country ||
    (app.location && typeof app.location === "object" && app.location.country
      ? app.location.country
      : "Unknown Country");

  return (
    <Card
      sx={{
        width: { xs: "100%", sm: 600, md: 800 },
        minHeight: 100,
        borderRadius: 1,
        boxShadow: 3,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between",
        p: 2,
        mb: 2,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          p: 0,
          "&:last-child": { pb: 0 },
          width: "100%",
        }}
      >
        {/* Left: Main Info */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          {/* Top Row: Company, Country, Occupation */}
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Chip
              label={capitalizeWords(company)}
              size="small"
              color="primary"
              sx={{ fontWeight: 500, fontSize: 13 }}
            />
            <Chip
              label={country}
              size="small"
              color="secondary"
              sx={{ fontWeight: 500, fontSize: 13 }}
            />
            <Tooltip
              title={occupation}
              arrow
              disableHoverListener={occupation.length <= MAX_OCCUPATION_NAME_LENGTH}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  ml: 2,
                  flexShrink: 1,
                  minWidth: 0,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: 120, sm: 220, md: 350 },
                  cursor: occupation.length > MAX_OCCUPATION_NAME_LENGTH ? "pointer" : "default",
                }}
              >
                {truncatedOccupation}
              </Typography>
            </Tooltip>
          </Stack>
          {/* Status, Dates */}
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight={500}>
              Status:
            </Typography>
            <Typography variant="body2">
              {getStatusLabel(app.status, app.submitted_at)}
            </Typography>
            {app.submitted_at && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Typography variant="body2" fontWeight={500}>
                  Submitted:
                </Typography>
                <Typography variant="body2">
                  {formatDate(app.submitted_at)}
                </Typography>
              </>
            )}
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Typography variant="body2" fontWeight={500}>
              Created:
            </Typography>
            <Typography variant="body2">
              {/* Use submitted_at as fallback to 'created_at': None provided, use passport_expiry_date as a last fallback */}
              {formatDate(app.created_at || app.application_date || app.submitted_at || app.passport_expiry_date)}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
      <CardActions sx={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", minWidth: 120, p: 0, pl: 2 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 100 }}
          onClick={() => onContinue(app.id)}
        >
          {getStatusLabel(app.status, app.submitted_at) === "Draft" ? "Continue" : "View"}
        </Button>
      </CardActions>
    </Card>
  );
};

const PAGE_SIZE = 15; // Default page size

const AllWorkVisaApplication: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState<number>(1);

  // Pagination state from API
  const [count, setCount] = useState<number>(0);
  const [numPages, setNumPages] = useState<number>(1);

  // For search field
  const [search, setSearch] = useState<string>("");

  const filterConfig = useMemo(() => {
    const countries = Array.from(
      new Set(
        applications
          .map((a) =>
            a.offer?.country ||
            a.country ||
            a.destination_country ||
            (a.location && typeof a.location === "object" && a.location.country
              ? a.location.country
              : null)
          )
          .filter(Boolean)
      )
    );
    const companies = Array.from(
      new Set(
        applications
          .map((a) =>
            a.offer?.organization?.name ||
            a.company_name ||
            a.employer ||
            (typeof a.company === "string"
              ? a.company
              : a.company && typeof a.company === "object" && a.company.name
              ? a.company.name
              : null)
          )
          .filter((name) => !!name)
      )
    );
    const occupations = Array.from(
      new Set(
        applications
          .map((a) =>
            a.offer?.job_title ||
            a.occupation ||
            a.position ||
            (typeof a.job_title === "string"
              ? a.job_title
              : a.job && typeof a.job === "object" && a.job.title
              ? a.job.title
              : null)
          )
          .filter((o) => !!o)
      )
    );
    const statuses = Array.from(
      new Set(
        applications
          .map((a) => getStatusLabel(a.status, a.submitted_at))
          .filter((s) => !!s)
      )
    );
    // Add search field as the first filter
    return [
      {
        type: "search",
        name: "search",
        title: "Search",
        placeholder: "Search by job title, employer, country...",
      },
      {
        type: "checkbox",
        name: "country",
        title: "Country",
        options: countries.map((c) => ({ label: c, value: c })),
      },
      {
        type: "checkbox",
        name: "employer",
        title: "Employer",
        options: companies.map((i) => ({ label: capitalizeWords(i), value: i })),
      },
      {
        type: "checkbox",
        name: "occupation",
        title: "Occupation",
        options: occupations.map((p) => ({ label: p, value: p })),
      },
      {
        type: "checkbox",
        name: "status",
        title: "Status",
        options: statuses.map((s) => ({ label: s, value: s })),
      },
    ];
  }, [applications]);

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
    if (filters.employer && Array.isArray(filters.employer) && filters.employer.length > 0) {
      params.company_name = filters.employer.join(",");
      params.employer = filters.employer.join(",");
    }
    // For occupation filter, try all possible fields
    if (filters.occupation && Array.isArray(filters.occupation) && filters.occupation.length > 0) {
      params.occupation = filters.occupation.join(",");
      params.position = filters.occupation.join(",");
      params.job_title = filters.occupation.join(",");
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

  // Fetch applications with pagination and filters
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildQueryParams();
        const data = await getAllWorkVisaApplication(params);
        // API returns { count, next, previous, num_pages, page_size, current_page, results }
        setApplications(Array.isArray(data) ? data : data.results || []);
        setCount(data.count || 0);
        setNumPages(data.num_pages || 1);
      } catch (err) {
        setError("Failed to load work visa applications.");
        setApplications([]);
        setCount(0);
        setNumPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
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

  const handleContinue = (appId: string | number) => {
    window.location.href = `/travel/work-visa/continue/${appId}`;
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
          Work Visa Applications
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all your work visa applications and continue where you left off.
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
            ? "Loading applications..."
            : error
            ? ""
            : `${count} application${count === 1 ? "" : "s"} found`}
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
            placeholder="Search by job title, employer, country..."
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
        {/* Application Cards */}
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
            ) : applications.length === 0 ? (
              <Typography>No work visa applications found.</Typography>
            ) : (
              applications.map((app: any, idx: number) => (
                <WorkVisaApplicationCard key={app.id || idx} app={app} onContinue={handleContinue} />
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

export default AllWorkVisaApplication;
