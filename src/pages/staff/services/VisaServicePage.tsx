import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface RuleRow {
  id: string;
  country: string;
  category: string; // Study, Visit, Work
  checklist: string; // summary
}

const mock: RuleRow[] = [
  { id: 'vr1', country: 'Canada', category: 'Study', checklist: 'POF, SOP, Transcript' },
  { id: 'vr2', country: 'UK', category: 'Visit', checklist: 'Invitation, Bank Statement' },
];

export const VisaServicePage: React.FC = () => {
  const [rows] = useState<RuleRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.country.toLowerCase().includes(term) || r.category.toLowerCase().includes(term)) &&
      (!country || r.country.toLowerCase().includes(country.toLowerCase())) &&
      (!category || r.category.toLowerCase().includes(category.toLowerCase()))
    ));
  }, [rows, search, country, category]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'country', headerName: 'Country', flex: 0.8 },
    { field: 'category', headerName: 'Category', flex: 0.8 },
    { field: 'checklist', headerName: 'Checklist', flex: 1.2 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Visa</Typography>
        <Button variant="contained">Add Rule</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by country/category" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }} />
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

export default VisaServicePage;


