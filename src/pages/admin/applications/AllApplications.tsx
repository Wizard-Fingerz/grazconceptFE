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
  School as SchoolIcon,
  FlightTakeoff as FlightIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface Application {
  id: string;
  applicant: string;
  type: 'Study' | 'Visa' | 'Work Visa';
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Completed';
  country: string;
  submittedDate: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

// Simple responsive cards container replacing MUI Grid
const CardsRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 3,
      mb: 4,
      justifyContent: { xs: 'flex-start', md: 'space-between' },
    }}
  >
    {React.Children.map(children, (child, idx) => (
      <Box
        sx={{
          flex: '1 1 220px',
          minWidth: { xs: '100%', sm: 220, md: 220 },
          maxWidth: { xs: '100%', sm: '24%', md: '24%' }
        }}
        key={idx}
      >
        {child}
      </Box>
    ))}
  </Box>
);

export const AllApplications: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedApp] = useState<Application | null>(null);

  // Mock data
  const [applications] = useState<Application[]>([
    {
      id: '1',
      applicant: 'John Doe',
      type: 'Study',
      status: 'In Review',
      country: 'Canada',
      submittedDate: '2024-03-15',
      assignedTo: 'Agent Smith',
      priority: 'High',
    },
    {
      id: '2',
      applicant: 'Jane Smith',
      type: 'Visa',
      status: 'Pending',
      country: 'UK',
      submittedDate: '2024-03-18',
      priority: 'Medium',
    },
    {
      id: '3',
      applicant: 'Mike Johnson',
      type: 'Work Visa',
      status: 'Approved',
      country: 'USA',
      submittedDate: '2024-03-10',
      assignedTo: 'Agent Brown',
      priority: 'Urgent',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: Application) => {
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
        (!statusFilter || app.status === statusFilter) &&
        (!typeFilter || app.type === typeFilter) &&
        (!priorityFilter || app.priority === priorityFilter)
    );
  }, [applications, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'success';
      case 'In Review':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Study':
        return <SchoolIcon />;
      case 'Visa':
        return <FlightIcon />;
      case 'Work Visa':
        return <WorkIcon />;
      default:
        return <AssessmentIcon />;
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'Pending').length;
    const inReview = applications.filter((a) => a.status === 'In Review').length;
    const approved = applications.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
    return { total, pending, inReview, approved };
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
        field: 'type',
        headerName: 'Type',
        flex: 0.8,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTypeIcon(params.row.type)}
            <Typography variant="body2">{params.row.type}</Typography>
          </Box>
        ),
      },
      {
        field: 'country',
        headerName: 'Country',
        flex: 0.8,
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
        field: 'priority',
        headerName: 'Priority',
        flex: 0.7,
        renderCell: (params) => (
          <Chip label={params.row.priority} color={getPriorityColor(params.row.priority)} size="small" />
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
  >   {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            All Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all application submissions
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* Statistics Cards - replaced Grid with CardsRow */}
      <CardsRow>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Applications
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.warning.main }}>
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
              {stats.inReview}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Review
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
              {stats.approved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </CardContent>
        </Card>
      </CardsRow>

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
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Review">In Review</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
                <MenuItem value="Visa">Visa</MenuItem>
                <MenuItem value="Work Visa">Work Visa</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
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

export default AllApplications;

