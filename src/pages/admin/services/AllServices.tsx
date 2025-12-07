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
  Delete as DeleteIcon,
  School as SchoolIcon,
  FlightTakeoff as FlightIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface Service {
  id: string;
  name: string;
  type: 'Study' | 'Visa' | 'Loan' | 'Other';
  status: 'Active' | 'Inactive' | 'Pending';
  totalItems: number;
  activeItems: number;
  lastUpdated: string;
  createdBy: string;
}

// Helper map for MUI palette
// Only use palette keys that always exist: 'primary', 'info', 'success', 'warning', 'error', 'secondary'
const TYPE_PALETTE_MAP = {
  Study: 'primary',
  Visa: 'info',
  Loan: 'success',
  Other: 'default', // will fallback to a safe color
} as const;

const STATUS_PALETTE_MAP = {
  Active: 'success',
  Inactive: 'default', // will fallback to a safe color
  Pending: 'warning',
} as const;

export const AllServices: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const [services] = useState<Service[]>([
    {
      id: 'SRV001',
      name: 'Study Abroad Programs',
      type: 'Study',
      status: 'Active',
      totalItems: 150,
      activeItems: 142,
      lastUpdated: '2024-03-20',
      createdBy: 'Admin',
    },
    {
      id: 'SRV002',
      name: 'Visa Processing Services',
      type: 'Visa',
      status: 'Active',
      totalItems: 85,
      activeItems: 80,
      lastUpdated: '2024-03-19',
      createdBy: 'Admin',
    },
    {
      id: 'SRV003',
      name: 'Student Finance Plans',
      type: 'Loan',
      status: 'Active',
      totalItems: 12,
      activeItems: 10,
      lastUpdated: '2024-03-18',
      createdBy: 'Admin',
    },
    {
      id: 'SRV004',
      name: 'Travel Services',
      type: 'Other',
      status: 'Inactive',
      totalItems: 25,
      activeItems: 0,
      lastUpdated: '2024-02-15',
      createdBy: 'Admin',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return services.filter(
      (service) =>
        (!term ||
          service.name.toLowerCase().includes(term) ||
          service.id.toLowerCase().includes(term)) &&
        (!typeFilter || service.type === typeFilter) &&
        (!statusFilter || service.status === statusFilter)
    );
  }, [services, searchTerm, typeFilter, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Study':
        return <SchoolIcon />;
      case 'Visa':
        return <FlightIcon />;
      case 'Loan':
        return <MoneyIcon />;
      default:
        return <AssessmentIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    // Only these colors will be used as color prop for <Chip /> etc...
    // 'primary', 'info', 'success', 'default'
    return TYPE_PALETTE_MAP[type as keyof typeof TYPE_PALETTE_MAP] ?? 'default';
  };

  const getStatusColor = (status: string) => {
    // Only these MUI colors for status chips
    // 'success', 'warning', 'default'
    return STATUS_PALETTE_MAP[status as keyof typeof STATUS_PALETTE_MAP] ?? 'default';
  };

  // Safely fetch color for Avatar background
  const getAvatarBgColor = (type: string) => {
    const colorKey = getTypeColor(type);
    // Default fallback palette color if not valid or not defined:
    // Explicitly check for known palette keys to fix type errors
    if (
      colorKey === 'primary' ||
      colorKey === 'info' ||
      colorKey === 'success'
    ) {
      return theme.palette[colorKey].main;
    }
    // fallback to a neutral grey
    return theme.palette.grey[400];
  };

  // Statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === 'Active').length;
    const totalItems = services.reduce((sum, s) => sum + s.totalItems, 0);
    const activeItems = services.reduce((sum, s) => sum + s.activeItems, 0);
    return { total, active, totalItems, activeItems };
  }, [services]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Service Name',
        flex: 1.5,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: getAvatarBgColor(params.row.type),
              }}
            >
              {getTypeIcon(params.row.type)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.name}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        flex: 0.8,
        renderCell: (params) => (
          <Chip label={params.row.type} color={getTypeColor(params.row.type) as any} size="small" />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.8,
        renderCell: (params) => (
          <Chip label={params.row.status} color={getStatusColor(params.row.status) as any} size="small" />
        ),
      },
      {
        field: 'totalItems',
        headerName: 'Total Items',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'activeItems',
        headerName: 'Active Items',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
            {params.row.activeItems}
          </Typography>
        ),
      },
      {
        field: 'lastUpdated',
        headerName: 'Last Updated',
        flex: 1,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        sortable: false,
        renderCell: () => (
          <IconButton size="small" onClick={(e) => handleMenuOpen(e)}>
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [theme] // theme is a dependency since we call getAvatarBgColor(theme)
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            All Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all service offerings
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Service
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Services
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Services
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
                {stats.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 200 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
                {stats.activeItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Items
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by service name or ID..."
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
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
                <MenuItem value="Visa">Visa</MenuItem>
                <MenuItem value="Loan">Loan</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<FilterIcon />}>
              More Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Services Table */}
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
          Edit Service
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Service
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AllServices;
