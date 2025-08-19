import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface BizRow {
  id: string;
  service: string; // CAC, TIN, SCUML, Logo Design, Proposal Writing
  price: number;
  sla: string; // e.g., 7 days
}

const mock: BizRow[] = [
  { id: 'bz1', service: 'CAC Registration', price: 50000, sla: '7 days' },
  { id: 'bz2', service: 'Logo Design', price: 30000, sla: '3 days' },
];

export const BusinessBrandingServicePage: React.FC = () => {
  const [rows] = useState<BizRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => !term || r.service.toLowerCase().includes(term));
  }, [rows, search]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'service', headerName: 'Service', flex: 1 },
    { field: 'price', headerName: 'Price (₦)', flex: 0.8, valueGetter: (_v, row: BizRow) => row.price.toLocaleString() },
    { field: 'sla', headerName: 'SLA', flex: 0.6 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Business & Branding</Typography>
        <Button variant="contained">Add Service</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by service" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default BusinessBrandingServicePage;


