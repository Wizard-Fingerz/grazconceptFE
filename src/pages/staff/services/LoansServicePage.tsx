import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, Button, InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface LoanRow {
  id: string;
  plan: string;     // ROI plan
  interest: string; // e.g., 5% monthly
  maxAmount: number;
}

const mock: LoanRow[] = [
  { id: 'ln1', plan: 'Student Finance', interest: '3% monthly', maxAmount: 2000000 },
  { id: 'ln2', plan: 'Device Installment', interest: '5% monthly', maxAmount: 1000000 },
];

export const LoansServicePage: React.FC = () => {
  const [rows] = useState<LoanRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => !term || r.plan.toLowerCase().includes(term));
  }, [rows, search]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'plan', headerName: 'Plan', flex: 1 },
    { field: 'interest', headerName: 'Interest', flex: 0.8 },
    { field: 'maxAmount', headerName: 'Max Amount (₦)', flex: 1, valueGetter: (_v, row: LoanRow) => row.maxAmount.toLocaleString() },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Loan & Investment</Typography>
        <Button variant="contained">Add Plan</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search plans" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default LoansServicePage;


