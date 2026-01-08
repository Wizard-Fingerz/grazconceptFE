import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  Stack,
  Avatar,
  useTheme,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import api from '../../../services/api';

// Updated interface based on API response/network data
interface StudyApplication {
  id: string | number;
  applicant: string | number;
  applicantInitial?: string;
  institution: string | number;
  institution_name?: string;
  course_of_study?: string | number;
  course_of_study_name?: string;
  status: string | number;
  status_name?: string;
  destination_country?: string;
  application_date?: string;
  submitted_at?: string;
  program_type_name?: string;
  is_submitted?: boolean;
  // ...other api props as needed
}

type AnalyticsResponse = {
  total: number;
  by_status: Record<string, number>;
  by_institution: Record<string, number>;
  by_country: Record<string, number>;
};

export const StudyApplications: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  // Instead of paginationModel, we now track page number and page size directly
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedApp] = useState<StudyApplication | null>(null);

  // Pagination states from API response
  const [rowCount, setRowCount] = useState<number>(0);

  // Data states
  const [applications, setApplications] = useState<StudyApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    total: 0,
    by_status: {},
    by_institution: {},
    by_country: {}
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Tab State for Status Analytics
  const statusKeys = React.useMemo(() => Object.keys(analytics.by_status || {}), [analytics]);
  const [statusTab, setStatusTab] = useState(0);

  const institutionKeys = React.useMemo(() => Object.keys(analytics.by_institution || {}), [analytics]);
  const countryKeys = React.useMemo(() => Object.keys(analytics.by_country || {}), [analytics]);

  // Data fetch effect (mapping direct from API data fields)
  useEffect(() => {
    setLoadingApps(true);
    const params: any = {
      page: currentPage,
      page_size: pageSize,
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(institutionFilter ? { institution: institutionFilter } : {}),
      ...(countryFilter ? { country: countryFilter } : {}),
    };

    api
      .get('/app/study-visa-application/', { params })
      .then(res => res.data)
      .then((data) => {
        let results: any[] = [];
        if (Array.isArray(data.results)) {
          results = data.results;
        } else {
          results = [];
        }
        const count = typeof data.count === 'number' ? data.count : results.length;

        // Network data mapping: Use only actual returned fields, don't try to synthesize columns
        const rows: StudyApplication[] = results.map((app: any) => ({
          ...app,
          applicantInitial:
            typeof app.applicant === 'string' && app.applicant
              ? app.applicant[0]
              : typeof app.applicant === 'number'
              ? String(app.applicant)[0]
              : '?',
        }));

        setApplications(rows);
        setRowCount(count);
        setLoadingApps(false);
      })
      .catch(() => {
        setApplications([]);
        setRowCount(0);
        setLoadingApps(false);
      });
  }, [currentPage, pageSize, searchTerm, statusFilter, institutionFilter, countryFilter]);

  // If filters/search change, reset page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, institutionFilter, countryFilter]);

  // Fetch analytics
  useEffect(() => {
    setLoadingAnalytics(true);
    api
      .get('/app/study-visa-application-analytics/')
      .then(res => res.data)
      .then((data: AnalyticsResponse) => {
        setAnalytics({
          total: data.total ?? 0,
          by_status: data.by_status ?? {},
          by_institution: data.by_institution ?? {},
          by_country: data.by_country ?? {},
        });
        setLoadingAnalytics(false);
      })
      .catch(() => {
        setAnalytics({ total: 0, by_status: {}, by_institution: {}, by_country: {} });
        setLoadingAnalytics(false);
      });
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: StudyApplication) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  // Helper: stat chips colors by known status
  const getStatusColor = (status: string) => {
    if (!status) return 'default';
    if (/complete|completed/i.test(status)) return 'success';
    if (/draft/i.test(status)) return 'warning';
    if (/reject/i.test(status)) return 'error';
    if (/approved/i.test(status)) return 'success';
    if (/pending/i.test(status)) return 'warning';
    if (/hold/i.test(status)) return 'warning';
    return 'default';
  };

  // Analytics Cards and rendering logic: unchanged
  function StatusAnalyticsCards() {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
            Applications by Status
          </Typography>
          {loadingAnalytics ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Tabs
                value={statusTab}
                onChange={(_, v) => setStatusTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                {statusKeys.map((stat, idx) => (
                  <Tab
                    key={stat}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          size="small"
                          color={getStatusColor(stat)}
                          label={stat}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1,
                            textTransform: 'none'
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 18 }}>
                          {analytics.by_status[stat]}
                        </Typography>
                      </Stack>
                    }
                    value={idx}
                  />
                ))}
              </Tabs>
              {statusKeys[statusTab] && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {analytics.by_status[statusKeys[statusTab]]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statusKeys[statusTab]}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  function InstitutionAnalyticsCards() {
    const shownInstitutions = institutionKeys.slice(0, 5);
    const moreCount = Math.max(0, institutionKeys.length - shownInstitutions.length);
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
            Applications by Institution
          </Typography>
          {loadingAnalytics ? (
            <CircularProgress size={24} />
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {shownInstitutions.map((name) => (
                <Chip
                  key={name}
                  label={`${name} (${analytics.by_institution[name]})`}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    background: theme.palette.grey[100],
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                />
              ))}
              {moreCount > 0 && (
                <Chip
                  label={`+${moreCount} more`}
                  variant="outlined"
                  color="info"
                  sx={{ mb: 1 }}
                />
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  }

  function CountryAnalyticsCards() {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
            Applications by Country
          </Typography>
          {loadingAnalytics ? (
            <CircularProgress size={24} />
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {countryKeys.map((code) => (
                <Chip
                  key={code}
                  label={`${code} (${analytics.by_country[code]})`}
                  variant="filled"
                  sx={{
                    mb: 1,
                    background: theme.palette.grey[200],
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  }

  function SummaryCard() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 2,
          justifyContent: { xs: 'flex-start', md: 'space-between' },
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' }, minWidth: 200, flexGrow: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, minHeight: 100 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loadingAnalytics ? <CircularProgress size={24} /> : analytics.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  // Pagination controls
  function TablePagination() {
    const totalPages = Math.ceil(rowCount / pageSize);
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          mt: 2,
          gap: 2,
        }}
      >
        <Typography variant="body2">
          Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          Prev
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
        <FormControl size="small" sx={{ minWidth: 75 }}>
          <Select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 25, 50].map(opt => (
              <MenuItem key={opt} value={opt}>{opt} / page</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Study Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage study abroad and academic applications
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            // TODO: implement CSV export or other export logic
            alert('Export functionality not yet implemented.');
          }}
        >
          Export
        </Button>
      </Box>

      {/* Summary Card (Total) */}
      <SummaryCard />

      {/* Analytics Cards (Status, Institution, Country) */}
      <StatusAnalyticsCards />
      <InstitutionAnalyticsCards />
      <CountryAnalyticsCards />

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by applicant, institution, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusKeys.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Institution</InputLabel>
              <Select
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                label="Institution"
                size="small"
              >
                <MenuItem value="">All Institutions</MenuItem>
                {institutionKeys.map((inst) => (
                  <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                label="Country"
                size="small"
              >
                <MenuItem value="">All Countries</MenuItem>
                {countryKeys.map((cty) => (
                  <MenuItem key={cty} value={cty}>{cty}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<FilterIcon />} disabled>
              More Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
          {loadingApps ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 900,
                background: 'white'
              }}>
                <thead>
                  <tr style={{ background: theme.palette.grey[100] }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Applicant</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Institution</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Program</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Country</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Program Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Submitted</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <td style={{ padding: '10px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                            {app.applicantInitial || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {String(app.applicant ?? '')}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '10px' }}>{app.institution_name}</td>
                      <td style={{ padding: '10px' }}>{app.course_of_study_name}</td>
                      <td style={{ padding: '10px' }}>{app.destination_country}</td>
                      <td style={{ padding: '10px' }}>{app.program_type_name}</td>
                      <td style={{ padding: '10px' }}>
                        <Chip
                          label={app.status_name ?? ''}
                          color={getStatusColor(app.status_name || '') as any}
                          size="small"
                          variant="filled"
                        />
                      </td>
                      <td style={{ padding: '10px' }}>
                        {(app.submitted_at ? String(app.submitted_at).split('T')[0] : app.application_date ?? '')}
                      </td>
                      <td style={{ padding: 0, textAlign: "center" }}>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, app)}>
                          <MoreVertIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!loadingApps && applications.length === 0) && (
                <Typography
                  sx={{ mt: 4, mb: 2, textAlign: "center", color: "text.secondary" }}
                  variant="body1"
                >
                  No study applications found.
                </Typography>
              )}
            </Box>
          )}
          <TablePagination />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Application
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AssignmentIcon sx={{ mr: 1 }} fontSize="small" />
          Assign to Staff
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download Documents
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudyApplications;
