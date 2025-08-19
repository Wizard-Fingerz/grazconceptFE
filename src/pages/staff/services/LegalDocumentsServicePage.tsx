import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface LegalRow {
  id: string;
  document: string; // Passport, Police Report, Yellow Card, etc.
  price: number;
  duration: string; // e.g., 5 days
}

const mock: LegalRow[] = [
  { id: 'lg1', document: 'Yellow Card', price: 25000, duration: '3 days' },
  { id: 'lg2', document: 'Police Report', price: 15000, duration: '2 days' },
];

export const LegalDocumentsServicePage: React.FC = () => {
  const [rows] = useState<LegalRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => !term || r.document.toLowerCase().includes(term));
  }, [rows, search]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'document', headerName: 'Document', flex: 1 },
    { field: 'price', headerName: 'Price (₦)', flex: 0.8, valueGetter: (_v, row: LegalRow) => row.price.toLocaleString() },
    { field: 'duration', headerName: 'Duration', flex: 0.6 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Legal Documents</Typography>
        <Button variant="contained">Add Document</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search documents" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default LegalDocumentsServicePage;


