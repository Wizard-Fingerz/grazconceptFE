import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type WithdrawalStatus = 'Requested' | 'Processing' | 'Paid' | 'Declined';

interface WithdrawalRow {
  id: string;
  date: string;
  agent: string;
  amount: number;
  status: WithdrawalStatus;
}

const statusColor: Record<WithdrawalStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Requested: 'info',
  Processing: 'warning',
  Paid: 'success',
  Declined: 'error',
};

const mock: WithdrawalRow[] = [
  { id: 'w1', date: '2025-08-11', agent: 'Agent A', amount: 120000, status: 'Requested' },
  { id: 'w2', date: '2025-08-15', agent: 'Agent B', amount: 60000, status: 'Paid' },
];

export const WithdrawalsPage: React.FC = () => {
  const [rows] = useState<WithdrawalRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WithdrawalStatus | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.agent.toLowerCase().includes(term)) &&
      (!status || r.status === status)
    ));
  }, [rows, search, status]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'date', headerName: 'Date', flex: 0.8 },
    { field: 'agent', headerName: 'Agent', flex: 1 },
    { field: 'amount', headerName: 'Amount (₦)', flex: 0.8, valueGetter: (_v, row: WithdrawalRow) => row.amount.toLocaleString() },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <Chip label={p.row.status} color={statusColor[p.row.status as WithdrawalStatus]} size="small" />, sortable: false },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Withdrawals</Typography>
        <Button variant="contained">Request Withdrawal</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by agent" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={status} onChange={(e) => setStatus(e.target.value as WithdrawalStatus | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}>
            <MenuItem value="">Status</MenuItem>
            {(['Requested','Processing','Paid','Declined'] as WithdrawalStatus[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
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

export default WithdrawalsPage;


