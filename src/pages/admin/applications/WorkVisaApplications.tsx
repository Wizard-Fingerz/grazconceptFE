import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface WorkVisaApplication {
  id: string;
  applicant: string;
  jobTitle: string;
  employer: string;
  country: string;
  stage: 'CV Submitted' | 'Interview Scheduled' | 'Offer Received' | 'Visa Application' | 'Approved' | 'Rejected';
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  submittedDate: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// Simple CSS grid utility for deprecation of MUI v4+ Grid
const SimpleGrid: React.FC<React.PropsWithChildren<{
  columns?: number;
  gap?: number;
  sx?: any;
  style?: React.CSSProperties;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}>> = ({ columns = 12, gap = 24, sx, style, item, xs, sm, md, lg, children }) => {
  if (item) {
    let flexBasis = '0%';
    if (xs) flexBasis = `${(xs / columns) * 100}%`;
    if (sm) flexBasis = `${(sm / columns) * 100}%`;
    if (md) flexBasis = `${(md / columns) * 100}%`;
    if (lg) flexBasis = `${(lg / columns) * 100}%`;
    return (
      <div
        style={{
          flexBasis,
          flexGrow: 1,
          maxWidth: flexBasis,
          ...style,
        }}
        // @ts-ignore
        sx={sx}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        ...style,
      }}
      // @ts-ignore
      sx={sx}
    >
      {children}
    </div>
  );
};

export const WorkVisaApplications: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedApp] = useState<WorkVisaApplication | null>(null);

  // Mock data
  const [applications] = useState<WorkVisaApplication[]>([
    {
      id: 'WV001',
      applicant: 'John Doe',
      jobTitle: 'Software Engineer',
      employer: 'Tech Corp',
      country: 'Canada',
      stage: 'Interview Scheduled',
      status: 'Active',
      submittedDate: '2024-03-15',
      assignedTo: 'Agent Smith',
      priority: 'High',
    },
    {
      id: 'WV002',
      applicant: 'Jane Smith',
      jobTitle: 'Data Analyst',
      employer: 'Data Solutions',
      country: 'UK',
      stage: 'Offer Received',
      status: 'Active',
      submittedDate: '2024-03-18',
      priority: 'Urgent',
    },
    {
      id: 'WV003',
      applicant: 'Mike Johnson',
      jobTitle: 'Project Manager',
      employer: 'Global Inc',
      country: 'USA',
      stage: 'Visa Application',
      status: 'Active',
      submittedDate: '2024-03-10',
      assignedTo: 'Agent Brown',
      priority: 'Medium',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: WorkVisaApplication) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter(
      (app) =>
        (!term ||
          app.applicant.toLowerCase().includes(term) ||
          app.jobTitle.toLowerCase().includes(term) ||
          app.employer.toLowerCase().includes(term) ||
          app.id.toLowerCase().includes(term)) &&
        (!stageFilter || app.stage === stageFilter) &&
        (!statusFilter || app.status === statusFilter) &&
        (!countryFilter || app.country.toLowerCase().includes(countryFilter.toLowerCase()))
    );
  }, [applications, searchTerm, stageFilter, statusFilter, countryFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Approved':
        return 'success';
      case 'Visa Application':
        return 'info';
      case 'Offer Received':
      case 'Interview Scheduled':
        return 'warning';
      case 'CV Submitted':
        return 'default';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const cvSubmitted = applications.filter((a) => a.stage === 'CV Submitted').length;
    const interviewScheduled = applications.filter((a) => a.stage === 'Interview Scheduled').length;
    const offerReceived = applications.filter((a) => a.stage === 'Offer Received').length;
    return { total, cvSubmitted, interviewScheduled, offerReceived };
  }, [applications]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'applicant',
        headerName: 'Applicant',
        flex: 1,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              {params.row.applicant[0]}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.applicant}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'jobTitle',
        headerName: 'Job Title',
        flex: 1,
      },
      {
        field: 'employer',
        headerName: 'Employer',
        flex: 1,
      },
      {
        field: 'country',
        headerName: 'Country',
        flex: 0.8,
      },
      {
        field: 'stage',
        headerName: 'Stage',
        flex: 1.2,
        renderCell: (params) => (
          <Chip label={params.row.stage} color={getStageColor(params.row.stage)} size="small" />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.8,
        renderCell: (params) => (
          <Chip label={params.row.status} color={getStatusColor(params.row.status)} size="small" />
        ),
      },
      {
        field: 'assignedTo',
        headerName: 'Assigned To',
        flex: 1,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.assignedTo || 'Unassigned'}
          </Typography>
        ),
      },
      {
        field: 'submittedDate',
        headerName: 'Submitted',
        flex: 0.8,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        sortable: false,
        renderCell: (params) => (
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box
    sx={{
      px: { xs: 1, sm: 2, md: 4 },
      py: { xs: 1, sm: 2 },
      width: '100%',
      maxWidth: 1600,
      mx: 'auto',
    }}
  >    {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Work Visa Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage work visa and employment applications
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* Statistics Cards */}
      <SimpleGrid columns={12} gap={24} sx={{ marginBottom: 4 }}>
        <SimpleGrid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WorkIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </SimpleGrid>
        <SimpleGrid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.cvSubmitted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CV Submitted
              </Typography>
            </CardContent>
          </Card>
        </SimpleGrid>
        <SimpleGrid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.warning.main }}>
                {stats.interviewScheduled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews Scheduled
              </Typography>
            </CardContent>
          </Card>
        </SimpleGrid>
        <SimpleGrid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
                {stats.offerReceived}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offers Received
              </Typography>
            </CardContent>
          </Card>
        </SimpleGrid>
      </SimpleGrid>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by applicant, job title, or employer..."
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Stage</InputLabel>
              <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} label="Stage">
                <MenuItem value="">All Stages</MenuItem>
                <MenuItem value="CV Submitted">CV Submitted</MenuItem>
                <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
                <MenuItem value="Offer Received">Offer Received</MenuItem>
                <MenuItem value="Visa Application">Visa Application</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />}>
              More Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <CustomDataTable
            rows={pagedRows}
            columns={columns}
            rowCount={filtered.length}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
          />
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

export default WorkVisaApplications;

