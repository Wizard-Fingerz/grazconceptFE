import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface ExamConfigRow {
  id: string;
  exam: string; // IELTS, TOEFL, PTE, SAT, etc.
  fee: number;
  centers: string; // summary
}

const mock: ExamConfigRow[] = [
  { id: 'exs1', exam: 'IELTS', fee: 120000, centers: 'Lagos, Abuja' },
  { id: 'exs2', exam: 'PTE', fee: 110000, centers: 'Lagos' },
];

export const ExamServicePage: React.FC = () => {
  const [rows] = useState<ExamConfigRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => !term || r.exam.toLowerCase().includes(term));
  }, [rows, search]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'exam', headerName: 'Exam', flex: 1 },
    { field: 'fee', headerName: 'Fee (₦)', flex: 0.8, valueGetter: (_v, row: ExamConfigRow) => row.fee.toLocaleString() },
    { field: 'centers', headerName: 'Centers', flex: 1.2 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Exams</Typography>
        <Button variant="contained">Add Exam</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by exam" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default ExamServicePage;


