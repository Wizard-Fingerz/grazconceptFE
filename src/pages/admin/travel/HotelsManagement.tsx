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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Hotel as HotelIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface Hotel {
  id: string;
  name: string;
  location: string;
  country: string;
  city: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  description: string;
  active: boolean;
  created_at: string;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

export const HotelsManagement: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [filterCountry, setFilterCountry] = useState('');

  // Mock data - replace with API call
  const [hotels] = useState<Hotel[]>([
    {
      id: '1',
      name: 'Grand Hotel',
      location: '123 Main St',
      country: 'USA',
      city: 'New York',
      rating: 4.5,
      price_per_night: 150,
      amenities: ['WiFi', 'Pool', 'Gym'],
      images: [],
      description: 'Luxury hotel in the heart of the city',
      active: true,
      created_at: '2024-01-15',
    },
  ]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch = !search || 
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.location.toLowerCase().includes(search.toLowerCase()) ||
        hotel.city.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = !filterCountry || hotel.country === filterCountry;
      return matchesSearch && matchesCountry;
    });
  }, [hotels, search, filterCountry]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Hotel Name',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
            <HotelIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.name}
          </Typography>
        </Stack>
      ),
    },
    { field: 'location', headerName: 'Location', flex: 1.2 },
    { field: 'city', headerName: 'City', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 1 },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={`${params.row.rating} ⭐`} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'price_per_night',
      headerName: 'Price/Night',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${params.row.price_per_night}
        </Typography>
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.active ? 'Active' : 'Inactive'}
          color={params.row.active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setSelectedHotel(params.row);
              setDialogOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [theme]);

  const stats = [
    { label: 'Total Hotels', value: hotels.length, icon: <HotelIcon />, color: theme.palette.primary.main },
    { label: 'Active Hotels', value: hotels.filter((h) => h.active).length, icon: <HotelIcon />, color: theme.palette.success.main },
    { label: 'Countries', value: new Set(hotels.map((h) => h.country)).size, icon: <HotelIcon />, color: theme.palette.info.main },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Hotels Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage hotels, bookings, and amenities
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedHotel(null);
            setDialogOpen(true);
          }}>
            Add Hotel
          </Button>
        </Stack>
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
              placeholder="Search hotels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              size="small"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Countries</option>
              {Array.from(new Set(hotels.map((h) => h.country))).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={filteredHotels}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            isLoading={false} rowCount={0}          />
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHotel ? 'Edit Hotel' : 'Add New Hotel'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Hotel Name" defaultValue={selectedHotel?.name} />
            <TextField fullWidth label="Location" defaultValue={selectedHotel?.location} />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="City" defaultValue={selectedHotel?.city} />
              <TextField fullWidth label="Country" defaultValue={selectedHotel?.country} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Rating"
                type="number"
                defaultValue={selectedHotel?.rating}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
              />
              <TextField
                fullWidth
                label="Price per Night"
                type="number"
                defaultValue={selectedHotel?.price_per_night}
              />
            </Stack>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              defaultValue={selectedHotel?.description}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            {selectedHotel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelsManagement;

