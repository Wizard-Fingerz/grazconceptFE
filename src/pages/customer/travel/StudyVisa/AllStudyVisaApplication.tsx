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
import { getAllStudyVisaApplication } from "../../../../services/studyVisa";
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

// Helper: Map status code to label (customize as needed)
function getStatusLabel(status: any, is_submitted: boolean, status_name?: string) {
  if (is_submitted) return "Submitted";
  if (status_name) return capitalizeWords(status_name);
  if (status === null || status === undefined) return "Draft";
  if (typeof status === "string") return capitalizeWords(status);
  if (typeof status === "number") {
    if (status === 33) return "Draft";
    return `Status #${status}`;
  }
  return "Draft";
}

// Application Card (Horizontal, larger width, compact height)
// Simplified: Only show key summary info, not all details (view page has full info)
// Truncate long course/program names and show full name in tooltip
import Tooltip from "@mui/material/Tooltip";

const MAX_COURSE_NAME_LENGTH = 15;

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

const StudyVisaApplicationCard: React.FC<{ app: any; onContinue: (id: any) => void }> = ({
  app,
  onContinue,
}) => {
  // Get course/program name
  const courseName =
    app.course_of_study_name ||
    app.program_name ||
    app.program ||
    (typeof app.course_of_study === "string"
      ? app.course_of_study
      : app.course_of_study && typeof app.course_of_study === "object" && app.course_of_study.name
        ? app.course_of_study.name
        : "Unknown Program");

  const truncatedCourseName = truncateText(courseName, MAX_COURSE_NAME_LENGTH);

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
          {/* Top Row: Institution, Country, Program */}
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Chip
              label={
                app.institution_name ||
                app.university ||
                (typeof app.institution === "string"
                  ? capitalizeWords(app.institution)
                  : app.institution && typeof app.institution === "object" && app.institution.name
                    ? capitalizeWords(app.institution.name)
                    : "Unknown Institution")
              }
              size="small"
              color="primary"
              sx={{ fontWeight: 500, fontSize: 13 }}
            />
            <Chip
              label={
                app.country ||
                app.destination_country ||
                "Unknown Country"
              }
              size="small"
              color="secondary"
              sx={{ fontWeight: 500, fontSize: 13 }}
            />
            <Tooltip title={courseName} arrow disableHoverListener={courseName.length <= MAX_COURSE_NAME_LENGTH}>
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
                  cursor: courseName.length > MAX_COURSE_NAME_LENGTH ? "pointer" : "default",
                }}
              >
                {truncatedCourseName}
              </Typography>
            </Tooltip>
          </Stack>
          {/* Status, Dates */}
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight={500}>
              Status:
            </Typography>
            <Typography variant="body2">
              {getStatusLabel(app.status, app.is_submitted, app.status_name)}
            </Typography>
            {app.is_submitted && app.submitted_at && (
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
              {formatDate(app.created_at || app.application_date)}
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
          {getStatusLabel(app.status, app.is_submitted, app.status_name) === "Draft" ? "Continue" : "View"}
        </Button>
      </CardActions>
    </Card>
  );
};

const PAGE_SIZE = 15; // Default page size, can be adjusted if needed

const AllStudyVisaApplication: React.FC = () => {
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

  // For filter options, extract unique values from all applications (not just current page)
  // To do this, we need to fetch all applications for filter options, but for now, use current page
  const filterConfig = useMemo(() => {
    const countries = Array.from(
      new Set(
        applications
          .map((a) => a.country || a.destination_country)
          .filter(Boolean)
      )
    );
    const institutions = Array.from(
      new Set(
        applications
          .map((a) =>
            a.institution_name ||
            a.university ||
            (typeof a.institution === "string" ? a.institution : null)
          )
          .filter((name) => !!name)
      )
    );
    const programs = Array.from(
      new Set(
        applications
          .map((a) =>
            a.course_of_study_name ||
            a.program_name ||
            a.program ||
            (typeof a.course_of_study === "string" ? a.course_of_study : null)
          )
          .filter((p) => !!p)
      )
    );
    const statuses = Array.from(
      new Set(
        applications
          .map((a) => getStatusLabel(a.status, a.is_submitted, a.status_name))
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
    if (filters.institution && Array.isArray(filters.institution) && filters.institution.length > 0) {
      params.institution_name = filters.institution.join(",");
    }
    // For program filter, use course_of_study_name and program_name as the param
    if (filters.program && Array.isArray(filters.program) && filters.program.length > 0) {
      params.course_of_study_name = filters.program.join(",");
      params.program_name = filters.program.join(",");
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
        // getAllStudyVisaApplication should accept query params for pagination and filters
        const params = buildQueryParams();
        const data = await getAllStudyVisaApplication(params);
        // API returns { count, next, previous, num_pages, page_size, current_page, results }
        setApplications(Array.isArray(data) ? data : data.results || []);
        setCount(data.count || 0);
        setNumPages(data.num_pages || 1);
      } catch (err) {
        setError("Failed to load study visa applications.");
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
    window.location.href = `/travel/study-visa/continue/${appId}`;
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
          Study Visa Applications
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Browse all your study visa applications and continue where you left off.
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
              <Typography>No study visa applications found.</Typography>
            ) : (
              applications.map((app: any, idx: number) => (
                <StudyVisaApplicationCard key={app.id || idx} app={app} onContinue={handleContinue} />
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

export default AllStudyVisaApplication;
