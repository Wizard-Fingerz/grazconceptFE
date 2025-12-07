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
  // Grid deprecated, so no import
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface LoanPlan {
  id: string;
  planName: string;
  category: 'Student Finance' | 'Device Installment' | 'Business Loan' | 'Personal Loan';
  interestRate: string;
  maxAmount: number;
  minAmount: number;
  tenure: string;
  status: 'Active' | 'Inactive' | 'Pending';
  applications: number;
  approved: number;
  lastUpdated: string;
}

export const LoanServices: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedPlan] = useState<LoanPlan | null>(null);

  // Mock data
  const [plans] = useState<LoanPlan[]>([
    {
      id: 'LN001',
      planName: 'Study Abroad Finance',
      category: 'Student Finance',
      interestRate: '3% monthly',
      maxAmount: 2000000,
      minAmount: 50000,
      tenure: '12-24 months',
      status: 'Active',
      applications: 145,
      approved: 98,
      lastUpdated: '2024-03-20',
    },
    {
      id: 'LN002',
      planName: 'Device Installment Plan',
      category: 'Device Installment',
      interestRate: '5% monthly',
      maxAmount: 1000000,
      minAmount: 20000,
      tenure: '6-12 months',
      status: 'Active',
      applications: 89,
      approved: 67,
      lastUpdated: '2024-03-19',
    },
    {
      id: 'LN003',
      planName: 'Business Travel Loan',
      category: 'Business Loan',
      interestRate: '4% monthly',
      maxAmount: 5000000,
      minAmount: 100000,
      tenure: '12-36 months',
      status: 'Active',
      applications: 56,
      approved: 42,
      lastUpdated: '2024-03-18',
    },
    {
      id: 'LN004',
      planName: 'Personal Travel Loan',
      category: 'Personal Loan',
      interestRate: '6% monthly',
      maxAmount: 1500000,
      minAmount: 50000,
      tenure: '6-18 months',
      status: 'Pending',
      applications: 0,
      approved: 0,
      lastUpdated: '2024-03-15',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plan: LoanPlan) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return plans.filter(
      (plan) =>
        (!term ||
          plan.planName.toLowerCase().includes(term) ||
          plan.category.toLowerCase().includes(term) ||
          plan.id.toLowerCase().includes(term)) &&
        (!categoryFilter || plan.category === categoryFilter) &&
        (!statusFilter || plan.status === statusFilter)
    );
  }, [plans, searchTerm, categoryFilter, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Student Finance':
        return 'primary';
      case 'Device Installment':
        return 'info';
      case 'Business Loan':
        return 'success';
      case 'Personal Loan':
        return 'warning';
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
    const total = plans.length;
    const active = plans.filter((p) => p.status === 'Active').length;
    const totalApplications = plans.reduce((sum, p) => sum + p.applications, 0);
    const totalApproved = plans.reduce((sum, p) => sum + p.approved, 0);
    return { total, active, totalApplications, totalApproved };
  }, [plans]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'planName',
        headerName: 'Plan Name',
        flex: 1.5,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.success.main }}>
              <MoneyIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.planName}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        flex: 1,
        renderCell: (params) => (
          <Chip label={params.row.category} color={getCategoryColor(params.row.category) as any} size="small" />
        ),
      },
      {
        field: 'interestRate',
        headerName: 'Interest Rate',
        flex: 1,
      },
      {
        field: 'amountRange',
        headerName: 'Amount Range',
        flex: 1.2,
        renderCell: (params) => (
          <Typography variant="body2">
            ₦{params.row.minAmount.toLocaleString()} - ₦{params.row.maxAmount.toLocaleString()}
          </Typography>
        ),
      },
      {
        field: 'tenure',
        headerName: 'Tenure',
        flex: 1,
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
        field: 'approved',
        headerName: 'Approved',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
            {params.row.approved}
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

  // Helper for deprecated Grid: using Box + responsive flex layout instead
  const StatCardRow = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        justifyContent: { xs: 'center', sm: 'flex-start' },
      }}
    >
      <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MoneyIcon color="success" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Plans
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Plans
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
              {stats.totalApplications}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Applications
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
              {stats.totalApproved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved Loans
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Loan Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage loan plans, interest rates, and financing options
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Loan Plan
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards (Grid replaced) */}
      <StatCardRow />

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by plan name, category, or ID..."
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
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Student Finance">Student Finance</MenuItem>
                <MenuItem value="Device Installment">Device Installment</MenuItem>
                <MenuItem value="Business Loan">Business Loan</MenuItem>
                <MenuItem value="Personal Loan">Personal Loan</MenuItem>
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

      {/* Plans Table */}
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
          Edit Plan
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Plan
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LoanServices;

