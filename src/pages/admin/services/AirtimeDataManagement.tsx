import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  Tabs,
  Tab,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  PhoneIphone as PhoneIcon,
  DataUsage as DataIcon,
  ShoppingCart as PurchaseIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface NetworkProvider {
  id: string;
  label: string;
  value: string;
  active: boolean;
  accent: string;
  logo?: string;
}

interface AirtimePurchase {
  id: string;
  user: string;
  provider: string;
  phone: string;
  amount: number;
  completed: boolean;
  created_at: string;
  external_ref?: string;
  status_message?: string;
}

interface DataPlan {
  id: string;
  provider: string;
  label: string;
  value: string;
  category: string;
  data: string;
  amount: number;
}

interface DataPurchase {
  id: string;
  user: string;
  provider: string;
  plan: string;
  phone: string;
  amount: number;
  completed: boolean;
  created_at: string;
  external_ref?: string;
  status_message?: string;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

export const AirtimeDataManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const [providers] = useState<NetworkProvider[]>([
    { id: '1', label: 'MTN', value: 'mtn', active: true, accent: '#FFC107' },
    { id: '2', label: 'Airtel', value: 'airtel', active: true, accent: '#E91E63' },
    { id: '3', label: 'Glo', value: 'glo', active: true, accent: '#4CAF50' },
  ]);

  const [airtimePurchases] = useState<AirtimePurchase[]>([
    {
      id: '1',
      user: 'John Doe',
      provider: 'MTN',
      phone: '+2348012345678',
      amount: 1000,
      completed: true,
      created_at: '2024-01-20',
      external_ref: 'REF123',
    },
  ]);

  const [dataPlans] = useState<DataPlan[]>([
    {
      id: '1',
      provider: 'MTN',
      label: '1GB - 30 Days',
      value: '1gb-30days',
      category: 'Monthly',
      data: '1GB',
      amount: 500,
    },
  ]);

  const [dataPurchases] = useState<DataPurchase[]>([
    {
      id: '1',
      user: 'Jane Smith',
      provider: 'MTN',
      plan: '1GB - 30 Days',
      phone: '+2348012345679',
      amount: 500,
      completed: true,
      created_at: '2024-01-21',
      external_ref: 'REF124',
    },
  ]);

  const providerColumns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    {
      field: 'label',
      headerName: 'Provider',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: params.row.accent || theme.palette.primary.main }}>
            <PhoneIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.label}
          </Typography>
        </Stack>
      ),
    },
    { field: 'value', headerName: 'Code', flex: 1 },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? 'Active' : 'Inactive'}
          color={params.row.active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ], [theme]);

  const airtimeColumns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    { field: 'user', headerName: 'User', flex: 1.2 },
    { field: 'provider', headerName: 'Provider', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1.2 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₦{params.row.amount}
        </Typography>
      ),
    },
    {
      field: 'completed',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.completed ? 'Completed' : 'Pending'}
          color={params.row.completed ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    { field: 'created_at', headerName: 'Date', flex: 1 },
    { field: 'external_ref', headerName: 'Reference', flex: 1.2 },
  ], []);

  const dataPlanColumns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    { field: 'provider', headerName: 'Provider', flex: 1 },
    { field: 'label', headerName: 'Plan', flex: 1.5 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'data', headerName: 'Data', flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₦{params.row.amount}
        </Typography>
      ),
    },
  ], []);

  const dataPurchaseColumns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    { field: 'user', headerName: 'User', flex: 1.2 },
    { field: 'provider', headerName: 'Provider', flex: 1 },
    { field: 'plan', headerName: 'Plan', flex: 1.5 },
    { field: 'phone', headerName: 'Phone', flex: 1.2 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₦{params.row.amount}
        </Typography>
      ),
    },
    {
      field: 'completed',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.completed ? 'Completed' : 'Pending'}
          color={params.row.completed ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    { field: 'created_at', headerName: 'Date', flex: 1 },
  ], []);

  const getCurrentData = () => {
    switch (tabValue) {
      case 0:
        return {
          rows: providers, columns: providerColumns, stats: [
            { label: 'Providers', value: providers.length, icon: <PhoneIcon />, color: theme.palette.primary.main },
            { label: 'Active', value: providers.filter((p) => p.active).length, icon: <PhoneIcon />, color: theme.palette.success.main },
          ]
        };
      case 1:
        return {
          rows: airtimePurchases, columns: airtimeColumns, stats: [
            { label: 'Purchases', value: airtimePurchases.length, icon: <PurchaseIcon />, color: theme.palette.primary.main },
            { label: 'Completed', value: airtimePurchases.filter((p) => p.completed).length, icon: <PurchaseIcon />, color: theme.palette.success.main },
          ]
        };
      case 2:
        return {
          rows: dataPlans, columns: dataPlanColumns, stats: [
            { label: 'Data Plans', value: dataPlans.length, icon: <DataIcon />, color: theme.palette.primary.main },
          ]
        };
      case 3:
        return {
          rows: dataPurchases, columns: dataPurchaseColumns, stats: [
            { label: 'Purchases', value: dataPurchases.length, icon: <PurchaseIcon />, color: theme.palette.primary.main },
            { label: 'Completed', value: dataPurchases.filter((p) => p.completed).length, icon: <PurchaseIcon />, color: theme.palette.success.main },
          ]
        };
      default:
        return { rows: [], columns: [], stats: [] };
    }
  };

  const currentData = getCurrentData();

  return (
    <Box
    sx={{
      px: { xs: 1, sm: 2, md: 4 },
      py: { xs: 1, sm: 2 },
      width: '100%',
      maxWidth: 1600,
      mx: 'auto',
    }}
  >   <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Airtime & Data Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage network providers, airtime purchases, and data plans
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Network Providers" />
        <Tab label="Airtime Purchases" />
        <Tab label="Data Plans" />
        <Tab label="Data Purchases" />
      </Tabs>

      {/* Stats */}
      {currentData.stats.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
          {currentData.stats.map((stat, idx) => (
            <Paper
              key={idx}
              elevation={FLAT_ELEVATION}
              sx={{
                flex: '1 1 200px',
                minWidth: 178,
                maxWidth: { xs: '100%', sm: 230, md: 275 },
                borderRadius: FLAT_RADIUS,
                px: 2.4,
                py: 2.6,
                boxShadow: 0,
                border: `1px solid ${theme.palette.grey[100]}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)',
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  mb: 1.4,
                  bgcolor: stat.color,
                  color: '#fff',
                  fontSize: 24,
                  boxShadow: '0 1px 8px 0 rgba(0,0,0,0.02)',
                }}
                variant="rounded"
              >
                {stat.icon}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={currentData.rows}
            columns={currentData.columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            isLoading={false}
            rowCount={currentData.rows.length}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AirtimeDataManagement;

