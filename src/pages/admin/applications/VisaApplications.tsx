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
  // Grid,  // Removed deprecated Grid import
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface VisaApplication {
  id: string;
  applicant: string;
  visaType: 'Study' | 'Tourist' | 'Business' | 'Transit' | 'Work';
  country: string;
  stage: 'Documentation' | 'Submission' | 'Biometrics' | 'Decision' | 'Issued' | 'Rejected';
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  submittedDate: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export const VisaApplications: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedApp] = useState<VisaApplication | null>(null);

  // Mock data
  const [applications] = useState<VisaApplication[]>([
    {
      id: 'V001',
      applicant: 'John Doe',
      visaType: 'Study',
      country: 'Canada',
      stage: 'Biometrics',
      status: 'Active',
      submittedDate: '2024-03-15',
      assignedTo: 'Agent Smith',
      priority: 'High',
    },
    {
      id: 'V002',
      applicant: 'Jane Smith',
      visaType: 'Tourist',
      country: 'UK',
      stage: 'Submission',
      status: 'Active',
      submittedDate: '2024-03-18',
      priority: 'Medium',
    },
    {
      id: 'V003',
      applicant: 'Mike Johnson',
      visaType: 'Business',
      country: 'USA',
      stage: 'Decision',
      status: 'Active',
      submittedDate: '2024-03-10',
      assignedTo: 'Agent Brown',
      priority: 'Urgent',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: VisaApplication) => {
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
          app.country.toLowerCase().includes(term) ||
          app.id.toLowerCase().includes(term)) &&
        (!stageFilter || app.stage === stageFilter) &&
        (!statusFilter || app.status === statusFilter) &&
        (!typeFilter || app.visaType === typeFilter)
    );
  }, [applications, searchTerm, stageFilter, statusFilter, typeFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Issued':
        return 'success';
      case 'Decision':
        return 'info';
      case 'Biometrics':
      case 'Submission':
        return 'warning';
      case 'Documentation':
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
    const documentation = applications.filter((a) => a.stage === 'Documentation').length;
    const submitted = applications.filter((a) => a.stage === 'Submission' || a.stage === 'Biometrics').length;
    const decision = applications.filter((a) => a.stage === 'Decision' || a.stage === 'Issued').length;
    return { total, documentation, submitted, decision };
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
        field: 'visaType',
        headerName: 'Visa Type',
        flex: 0.8,
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

  // Instead of Grid, use Box with flex or CSS grid for layout
  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Visa Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage visa applications and processing
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FlightIcon color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Applications
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stats.documentation}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Documentation
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.warning.main }}>
              {stats.submitted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
              {stats.decision}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Decision Pending
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by applicant, country, or ID..."
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
                <MenuItem value="Documentation">Documentation</MenuItem>
                <MenuItem value="Submission">Submission</MenuItem>
                <MenuItem value="Biometrics">Biometrics</MenuItem>
                <MenuItem value="Decision">Decision</MenuItem>
                <MenuItem value="Issued">Issued</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
                <MenuItem value="Tourist">Tourist</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Transit">Transit</MenuItem>
                <MenuItem value="Work">Work</MenuItem>
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

export default VisaApplications;

