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
  // Grid,  // <- REMOVE this
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
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface StudyApplication {
  id: string;
  applicant: string;
  institution: string;
  program: string;
  country: string;
  stage: 'Applied' | 'Offer Received' | 'Payment' | 'CAS Issued' | 'Visa Applied' | 'Completed';
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  submittedDate: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export const StudyApplications: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedApp] = useState<StudyApplication | null>(null);

  // Mock data
  const [applications] = useState<StudyApplication[]>([
    {
      id: 'ST001',
      applicant: 'John Doe',
      institution: 'University of Toronto',
      program: 'MSc Computer Science',
      country: 'Canada',
      stage: 'Offer Received',
      status: 'Active',
      submittedDate: '2024-03-15',
      assignedTo: 'Agent Smith',
      priority: 'High',
    },
    {
      id: 'ST002',
      applicant: 'Jane Smith',
      institution: 'Oxford University',
      program: 'MSc Mathematics',
      country: 'UK',
      stage: 'CAS Issued',
      status: 'Active',
      submittedDate: '2024-03-10',
      priority: 'Urgent',
    },
    {
      id: 'ST003',
      applicant: 'Mike Johnson',
      institution: 'MIT',
      program: 'PhD Engineering',
      country: 'USA',
      stage: 'Visa Applied',
      status: 'Active',
      submittedDate: '2024-03-05',
      assignedTo: 'Agent Brown',
      priority: 'Medium',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: StudyApplication) => {
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
          app.institution.toLowerCase().includes(term) ||
          app.program.toLowerCase().includes(term) ||
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
      case 'Completed':
        return 'success';
      case 'CAS Issued':
      case 'Visa Applied':
        return 'info';
      case 'Offer Received':
      case 'Payment':
        return 'warning';
      case 'Applied':
        return 'default';
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
    const applied = applications.filter((a) => a.stage === 'Applied').length;
    const offerReceived = applications.filter((a) => a.stage === 'Offer Received').length;
    const casIssued = applications.filter((a) => a.stage === 'CAS Issued').length;
    return { total, applied, offerReceived, casIssued };
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
        field: 'institution',
        headerName: 'Institution',
        flex: 1.2,
      },
      {
        field: 'program',
        headerName: 'Program',
        flex: 1.2,
      },
      {
        field: 'country',
        headerName: 'Country',
        flex: 0.8,
      },
      {
        field: 'stage',
        headerName: 'Stage',
        flex: 1,
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

  // Custom replacement for deprecated Grid
  // Creating a responsive row/column layout using Stack, Box, and sx props

  // Helper for the statistics card section (replaces Grid container and item)
  function StatisticsCards() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          justifyContent: { xs: 'flex-start', md: 'space-between' },
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' }, minWidth: 200, flexGrow: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SchoolIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' }, minWidth: 200, flexGrow: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.applied}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Applied
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' }, minWidth: 200, flexGrow: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.warning.main }}>
                {stats.offerReceived}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offers Received
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '48%', md: '23%' }, minWidth: 200, flexGrow: 1 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
                {stats.casIssued}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CAS Issued
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Study Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage study abroad and academic applications
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* Statistics Cards (Grid replaced) */}
      <StatisticsCards />

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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Stage</InputLabel>
              <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} label="Stage">
                <MenuItem value="">All Stages</MenuItem>
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Offer Received">Offer Received</MenuItem>
                <MenuItem value="Payment">Payment</MenuItem>
                <MenuItem value="CAS Issued">CAS Issued</MenuItem>
                <MenuItem value="Visa Applied">Visa Applied</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
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

export default StudyApplications;

