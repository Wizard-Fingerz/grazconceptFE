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
  FlightTakeoff as FlightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

// Deprecated "Grid" usage replaced with Box/Flex layout

interface VisaRule {
  id: string;
  country: string;
  category: 'Study' | 'Tourist' | 'Business' | 'Work' | 'Transit';
  visaType: string;
  processingTime: string;
  requirements: string;
  status: 'Active' | 'Inactive' | 'Pending';
  applications: number;
  lastUpdated: string;
}

export const VisaServices: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedRule] = useState<VisaRule | null>(null);

  // Mock data
  const [rules] = useState<VisaRule[]>([
    {
      id: 'VIS001',
      country: 'Canada',
      category: 'Study',
      visaType: 'Student Visa',
      processingTime: '4-6 weeks',
      requirements: 'POF, SOP, Transcript, Admission Letter',
      status: 'Active',
      applications: 125,
      lastUpdated: '2024-03-20',
    },
    {
      id: 'VIS002',
      country: 'UK',
      category: 'Tourist',
      visaType: 'Visit Visa',
      processingTime: '3-4 weeks',
      requirements: 'Invitation Letter, Bank Statement, Travel Itinerary',
      status: 'Active',
      applications: 89,
      lastUpdated: '2024-03-19',
    },
    {
      id: 'VIS003',
      country: 'USA',
      category: 'Business',
      visaType: 'B1 Business Visa',
      processingTime: '5-7 weeks',
      requirements: 'Business Invitation, Financial Proof, Company Letter',
      status: 'Active',
      applications: 67,
      lastUpdated: '2024-03-18',
    },
    {
      id: 'VIS004',
      country: 'Australia',
      category: 'Work',
      visaType: 'Work Permit',
      processingTime: '6-8 weeks',
      requirements: 'Job Offer, Skills Assessment, Medical Exam',
      status: 'Pending',
      applications: 0,
      lastUpdated: '2024-03-15',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rule: VisaRule) => {
    setAnchorEl(event.currentTarget);
    setSelectedRule(rule);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRule(null);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rules.filter(
      (rule) =>
        (!term ||
          rule.country.toLowerCase().includes(term) ||
          rule.visaType.toLowerCase().includes(term) ||
          rule.id.toLowerCase().includes(term)) &&
        (!countryFilter || rule.country.toLowerCase().includes(countryFilter.toLowerCase())) &&
        (!categoryFilter || rule.category === categoryFilter) &&
        (!statusFilter || rule.status === statusFilter)
    );
  }, [rules, searchTerm, countryFilter, categoryFilter, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Study':
        return 'primary';
      case 'Tourist':
        return 'info';
      case 'Business':
        return 'success';
      case 'Work':
        return 'warning';
      case 'Transit':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.status === 'Active').length;
    const totalApplications = rules.reduce((sum, r) => sum + r.applications, 0);
    const countries = new Set(rules.map((r) => r.country)).size;
    return { total, active, totalApplications, countries };
  }, [rules]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'country',
        headerName: 'Country',
        flex: 1,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              <FlightIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.country}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        flex: 0.8,
        renderCell: (params) => (
          <Chip label={params.row.category} color={getCategoryColor(params.row.category) as any} size="small" />
        ),
      },
      {
        field: 'visaType',
        headerName: 'Visa Type',
        flex: 1.2,
      },
      {
        field: 'processingTime',
        headerName: 'Processing Time',
        flex: 1,
      },
      {
        field: 'requirements',
        headerName: 'Requirements',
        flex: 1.5,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {params.row.requirements.length > 50
              ? `${params.row.requirements.substring(0, 50)}...`
              : params.row.requirements}
          </Typography>
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
        field: 'applications',
        headerName: 'Applications',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.applications}
          </Typography>
        ),
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

  // Responsive statistics card layout replacing deprecated Grid
  const statsCards = [
    {
      icon: <FlightIcon color="primary" />,
      value: stats.total,
      label: 'Total Rules',
      valueColor: undefined,
    },
    {
      icon: null,
      value: stats.active,
      label: 'Active Rules',
      valueColor: theme.palette.success.main,
    },
    {
      icon: null,
      value: stats.totalApplications,
      label: 'Total Applications',
      valueColor: theme.palette.info.main,
    },
    {
      icon: null,
      value: stats.countries,
      label: 'Countries',
      valueColor: undefined,
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Visa Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage visa rules, requirements, and processing guidelines
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Visa Rule
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
        }}
      >
        {statsCards.map((card, idx) => (
          <Card
            key={card.label}
            sx={{
              flex: '1 1 225px',
              minWidth: 200,
              maxWidth: 300,
              borderRadius: 2,
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: idx === 0 ? 1 : 0.5 }}>
                {card.icon}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0,
                    ...(card.valueColor ? { color: card.valueColor } : {}),
                  }}
                >
                  {card.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by country, visa type, or ID..."
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
            <TextField
              placeholder="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
                <MenuItem value="Tourist">Tourist</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Transit">Transit</MenuItem>
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

      {/* Rules Table */}
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
          Edit Rule
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Rule
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VisaServices;

