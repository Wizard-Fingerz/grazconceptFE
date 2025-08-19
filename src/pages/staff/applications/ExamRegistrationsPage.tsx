import React, { useMemo, useState } from 'react';
import { Box, MenuItem, Paper, Select, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface ExamRow {
  id: string;
  client: string;
  exam: string; // IELTS, TOEFL, PTE, SAT, etc.
  center: string;
  date: string; // ISO date
}

const mock: ExamRow[] = [
  { id: 'e1', client: 'John Doe', exam: 'IELTS', center: 'Lagos', date: '2025-09-10' },
  { id: 'e2', client: 'Ada Lovelace', exam: 'PTE', center: 'Abuja', date: '2025-09-14' },
];

export const ExamRegistrationsPage: React.FC = () => {
  const [rows] = useState<ExamRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [exam, setExam] = useState('');
  const [center, setCenter] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term)) &&
      (!exam || r.exam.toLowerCase().includes(exam.toLowerCase())) &&
      (!center || r.center.toLowerCase().includes(center.toLowerCase()))
    ));
  }, [rows, search, exam, center]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'exam', headerName: 'Exam', flex: 0.8 },
    { field: 'center', headerName: 'Center', flex: 0.8 },
    { field: 'date', headerName: 'Date', flex: 0.8 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Exam Registrations</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Register Client</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField placeholder="Exam (e.g., IELTS)" value={exam} onChange={(e) => setExam(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField placeholder="Center" value={center} onChange={(e) => setCenter(e.target.value)} sx={{ minWidth: 160 }} />
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

export default ExamRegistrationsPage;


