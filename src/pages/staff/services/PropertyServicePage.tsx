import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface ListingRow {
  id: string;
  type: string; // Land, House
  location: string;
  price: number;
  availability: string; // Available, Sold
}

const mock: ListingRow[] = [
  { id: 'ls1', type: 'Land', location: 'Lekki', price: 30000000, availability: 'Available' },
  { id: 'ls2', type: 'House', location: 'Ikeja', price: 85000000, availability: 'Available' },
];

export const PropertyServicePage: React.FC = () => {
  const [rows] = useState<ListingRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.type.toLowerCase().includes(term)) &&
      (!location || r.location.toLowerCase().includes(location.toLowerCase()))
    ));
  }, [rows, search, location]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'type', headerName: 'Type', flex: 0.8 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'price', headerName: 'Price (₦)', flex: 0.8, valueGetter: (_v, row: ListingRow) => row.price.toLocaleString() },
    { field: 'availability', headerName: 'Availability', flex: 0.8 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Property & Real Estate</Typography>
        <Button variant="contained">Add Listing</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by type" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ minWidth: 160 }} />
        </Stack>
      </Paper>

      <CustomDataTable
        rows={pagedRows}
        columns={columns}
        rowCount={filtered.length}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default PropertyServicePage;


