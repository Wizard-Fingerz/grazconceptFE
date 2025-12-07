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
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FlightTakeoff as FlightIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface FlightBooking {
  id: string;
  user: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

export const FlightBookingsManagement: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [filterStatus, setFilterStatus] = useState('');

  const [bookings] = useState<FlightBooking[]>([
    {
      id: '1',
      user: 'Jane Smith',
      flight_number: 'AA123',
      origin: 'New York',
      destination: 'London',
      departure_date: '2024-02-15',
      return_date: '2024-02-20',
      passengers: 1,
      total_amount: 850,
      status: 'confirmed',
      created_at: '2024-01-20',
    },
  ]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = !search ||
        booking.user.toLowerCase().includes(search.toLowerCase()) ||
        booking.flight_number.toLowerCase().includes(search.toLowerCase()) ||
        booking.origin.toLowerCase().includes(search.toLowerCase()) ||
        booking.destination.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !filterStatus || booking.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, filterStatus]);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'error',
    completed: 'info',
  };

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    { field: 'user', headerName: 'Customer', flex: 1.2 },
    { field: 'flight_number', headerName: 'Flight #', flex: 1 },
    { field: 'origin', headerName: 'Origin', flex: 1 },
    { field: 'destination', headerName: 'Destination', flex: 1 },
    { field: 'departure_date', headerName: 'Departure', flex: 1 },
    {
      field: 'passengers',
      headerName: 'Passengers',
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.passengers} passenger(s)</Typography>
      ),
    },
    {
      field: 'total_amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${params.row.total_amount}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={statusColors[params.row.status] || 'default'}
          size="small"
        />
      ),
    },
  ], []);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: <FlightIcon />, color: theme.palette.primary.main },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, icon: <CalendarIcon />, color: theme.palette.success.main },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, icon: <CalendarIcon />, color: theme.palette.warning.main },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Flight Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage flight reservations and bookings
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
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

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={filteredBookings}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={filteredBookings.length}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default FlightBookingsManagement;

