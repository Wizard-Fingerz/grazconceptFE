import React, { useMemo, useState } from 'react';
import { Box, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface SchoolRow {
  id: string;
  school: string;
  country: string;
  program: string;
  intake: string; // e.g., Fall 2025
}

const mock: SchoolRow[] = [
  { id: 's1', school: 'University of Toronto', country: 'Canada', program: 'MSc CS', intake: 'Fall 2025' },
  { id: 's2', school: 'Oxford', country: 'UK', program: 'MSc Math', intake: 'Fall 2025' },
];

export const StudyServicePage: React.FC = () => {
  const [rows] = useState<SchoolRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.school.toLowerCase().includes(term) || r.program.toLowerCase().includes(term)) &&
      (!country || r.country.toLowerCase().includes(country.toLowerCase()))
    ));
  }, [rows, search, country]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'school', headerName: 'School', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 0.8 },
    { field: 'program', headerName: 'Program', flex: 1 },
    { field: 'intake', headerName: 'Intake/Promo', flex: 0.8 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Study Abroad</Typography>
        <Button variant="contained">Add School</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by school/program" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ minWidth: 160 }} />
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

export default StudyServicePage;


