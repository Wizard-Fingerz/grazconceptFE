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
import FilterPanel from "../../../../components/Filter/FilterPanel";
import { getAllVacationApplications } from "../../../../services/vacationService";

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

// Card for a single vacation application
const VacationApplicationCard: React.FC<{ app: any; onView: (id: any) => void }> = ({
    app,
    onView,
}) => {
    // Responsive arrangement and sizing
    return (
        <Card
            sx={{
                width: {
                    xs: "100%", // always full width on mobile
                    sm: "90vw", // responsive up to a reasonable width
                    md: 500,
                    lg: 600,
                },
                maxWidth: {
                    xs: "98vw", // avoid screen overflow
                    sm: 500,
                    md: 600,
                },
                minWidth: 0,
                minHeight: 110,
                borderRadius: 1,
                boxShadow: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, // column for mobile, row for desktop
                alignItems: { xs: "stretch", sm: "stretch" },
                justifyContent: { xs: "flex-start", sm: "space-between" },
                p: 2,
                mb: 2,
                mx: "auto", // center horizontally on mobile
            }}
        >
            <CardContent
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 0,
                    "&:last-child": { pb: 0 },
                    width: "100%",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    mb={2}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={capitalizeWords(app.offer_title ?? "Unknown Destination")}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600, fontSize: 13 }}
                        />
                        <Chip
                            label={capitalizeWords(app.accommodation_type ?? "Unknown Type")}
                            size="small"
                            color="secondary"
                            sx={{ fontWeight: 500, fontSize: 13 }}
                        />
                    </Stack>
                    {app.number_of_people && (
                        <Typography
                            variant="body2"
                            sx={{
                                ml: { sm: 2 },
                                mt: { xs: 1, sm: 0 }
                            }}
                        >
                            {`For ${app.number_of_people} ${
                                app.number_of_people == 1 ? "person" : "people"
                            }`}
                        </Typography>
                    )}
                </Stack>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    mb={1}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Travel Date:
                        </Typography>
                        <Typography variant="body2">
                            {formatDate(app.travel_date)}
                        </Typography>
                    </Stack>
                    <Divider
                        orientation={window.innerWidth < 600 ? "horizontal" : "vertical"}
                        flexItem
                        sx={{
                            mx: { xs: 0, sm: 1 },
                            my: { xs: 1, sm: 0 },
                            display: { xs: "block", sm: "block" },
                        }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Date of Birth:
                        </Typography>
                        <Typography variant="body2">
                            {formatDate(app.date_of_birth)}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Applicant:
                        </Typography>
                        <Typography variant="body2">
                            {app.applicant_detail?.name}
                        </Typography>
                    </Stack>
                    {app.status_display && (
                        <>
                            <Divider
                                orientation={window.innerWidth < 600 ? "horizontal" : "vertical"}
                                flexItem
                                sx={{
                                    mx: { xs: 0, sm: 1 },
                                    my: { xs: 1, sm: 0 },
                                    display: { xs: "block", sm: "block" },
                                }}
                            />
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" fontWeight={600}>
                                    Status:
                                </Typography>
                                <Typography variant="body2">
                                    {capitalizeWords(app.status_display)}
                                </Typography>
                            </Stack>
                        </>
                    )}
                    <Divider
                        orientation={window.innerWidth < 600 ? "horizontal" : "vertical"}
                        flexItem
                        sx={{ mx: { xs: 0, sm: 1 }, my: { xs: 1, sm: 0 }, display: { xs: "block", sm: "block" } }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                            Created:
                        </Typography>
                        <Typography variant="body2">
                            {formatDate(app.created_at)}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
            <CardActions
                sx={{
                    flexDirection: { xs: "row", sm: "column" },
                    justifyContent: { xs: "flex-end", sm: "center" },
                    alignItems: { xs: "center", sm: "flex-end" },
                    minWidth: { xs: "unset", sm: 120 },
                    p: 0,
                    pt: { xs: 2, sm: 0 },
                    pl: { xs: 0, sm: 2 },
                    width: { xs: "100%", sm: "auto" },
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        minWidth: 90,
                        width: { xs: "100%", sm: "auto" }, // full width button on mobile
                    }}
                    onClick={() => onView(app.id)}
                >
                    View
                </Button>
            </CardActions>
        </Card>
    );
};

const PAGE_SIZE = 15; // Default page size

const AllVactionApplications: React.FC = () => {
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

    // Build the filter options from fetched applications
    const filterConfig = useMemo(() => {
        const destinations = Array.from(
            new Set(
                applications.map((a) => a.offer_title).filter((v) => !!v)
            )
        );
        const accommodationTypes = Array.from(
            new Set(
                applications.map((a) => a.accommodation_type).filter((v) => !!v)
            )
        );
        // status_display should be used for status (but data has only nulls in sample)
        const statuses = Array.from(
            new Set(applications.map((a) => a.status_display).filter((s) => !!s))
        );
        // Add search and filters UI
        return [
            {
                type: "search",
                name: "search",
                title: "Search",
                placeholder: "Search by destination, accommodation, applicant...",
            },
            {
                type: "checkbox",
                name: "destination",
                title: "Destination",
                options: destinations.map((d) => ({ label: d, value: d })),
            },
            {
                type: "checkbox",
                name: "accommodation_type",
                title: "Accommodation Type",
                options: accommodationTypes.map((t) => ({
                    label: capitalizeWords(t),
                    value: t,
                })),
            },
            ...(statuses.length
                ? [
                      {
                          type: "checkbox",
                          name: "status",
                          title: "Status",
                          options: statuses.map((s) => ({
                              label: capitalizeWords(s),
                              value: s,
                          })),
                      },
                  ]
                : []),
        ];
    }, [applications]);

    // Build query params for filters and pagination
    const buildQueryParams = useCallback(() => {
        const params: Record<string, any> = {
            page,
            page_size: PAGE_SIZE,
        };
        // Destination filter (offer_title)
        if (
            filters.destination &&
            Array.isArray(filters.destination) &&
            filters.destination.length > 0
        ) {
            params.offer_title = filters.destination.join(",");
        }
        // Accommodation type filter
        if (
            filters.accommodation_type &&
            Array.isArray(filters.accommodation_type) &&
            filters.accommodation_type.length > 0
        ) {
            params.accommodation_type = filters.accommodation_type.join(",");
        }
        // Status filter
        if (
            filters.status &&
            Array.isArray(filters.status) &&
            filters.status.length > 0
        ) {
            params.status_display = filters.status.join(",");
        }
        // Search filter (searching for offer_title, applicant email, etc.)
        if (
            filters.search &&
            typeof filters.search === "string" &&
            filters.search.trim().length > 0
        ) {
            params.search = filters.search.trim();
        }
        return params;
    }, [filters, page]);

    // Fetch vacation applications
    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = buildQueryParams();
                const data = await getAllVacationApplications(params);
                // API returns { count, next, previous, num_pages, page_size, current_page, results }
                setApplications(Array.isArray(data) ? data : data.results || []);
                setCount(data.count ?? (Array.isArray(data) ? data.length : 0));
                setNumPages(data.num_pages || 1);
            } catch (err) {
                setError("Failed to load vacation applications.");
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

    // When filters/search change, reset to page 1
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

    const handleView = (appId: string | number) => {
        window.location.href = `/travel/vacation/continue/${appId}`;
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Search field handler
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
        <>
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
                        placeholder="Search by destination, accommodation, applicant..."
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
                            flexDirection: { xs: "column", sm: "row" },
                            flexWrap: { xs: "nowrap", sm: "wrap" },
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
                            <Typography>No vacation applications found.</Typography>
                        ) : (
                            applications.map((app: any, idx: number) => (
                                <VacationApplicationCard
                                    key={app.id || idx}
                                    app={app}
                                    onView={handleView}
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
        </>
    );
};

export default AllVactionApplications;
