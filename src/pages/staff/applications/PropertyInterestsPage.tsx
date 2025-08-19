import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface PropertyRow {
  id: string;
  client: string;
  interest: string; // land/house
  location: string;
  appointment?: string; // ISO date
}

const mock: PropertyRow[] = [
  { id: 'p1', client: 'John Doe', interest: 'Land', location: 'Lekki', appointment: '2025-09-02' },
  { id: 'p2', client: 'Ada Lovelace', interest: 'House', location: 'Ikeja', appointment: '' },
];

export const PropertyInterestsPage: React.FC = () => {
  const [rows] = useState<PropertyRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term)) &&
      (!location || r.location.toLowerCase().includes(location.toLowerCase()))
    ));
  }, [rows, search, location]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'interest', headerName: 'Interest', flex: 0.8 },
    { field: 'location', headerName: 'Location', flex: 0.8 },
    { field: 'appointment', headerName: 'Appointment', flex: 0.8, valueGetter: (_v, row: PropertyRow) => row.appointment || '-' },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Property Interests</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Interest</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default PropertyInterestsPage;


