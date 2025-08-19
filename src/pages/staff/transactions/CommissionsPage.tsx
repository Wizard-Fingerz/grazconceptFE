import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type PayoutStatus = 'Pending' | 'Paid';

interface CommissionRow {
  id: string;
  service: string;
  agent: string;
  amount: number;
  rate: string; // e.g., 10%
  status: PayoutStatus;
}

const statusColor: Record<PayoutStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Pending: 'warning',
  Paid: 'success',
};

const mock: CommissionRow[] = [
  { id: 'c1', service: 'Study', agent: 'Agent A', amount: 50000, rate: '10%', status: 'Pending' },
  { id: 'c2', service: 'Visa', agent: 'Agent B', amount: 30000, rate: '8%', status: 'Paid' },
];

export const CommissionsPage: React.FC = () => {
  const [rows] = useState<CommissionRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PayoutStatus | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.agent.toLowerCase().includes(term) || r.service.toLowerCase().includes(term)) &&
      (!status || r.status === status)
    ));
  }, [rows, search, status]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'service', headerName: 'Service', flex: 1 },
    { field: 'agent', headerName: 'Agent', flex: 1 },
    { field: 'rate', headerName: 'Rate', flex: 0.6 },
    { field: 'amount', headerName: 'Amount (₦)', flex: 0.8, valueGetter: (_v, row: CommissionRow) => row.amount.toLocaleString() },
    { field: 'status', headerName: 'Status', flex: 0.7, renderCell: (p) => <Chip label={p.row.status} color={statusColor[p.row.status as PayoutStatus]} size="small" />, sortable: false },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Commissions</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by agent or service" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={status} onChange={(e) => setStatus(e.target.value as PayoutStatus | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}>
            <MenuItem value="">Status</MenuItem>
            {(['Pending','Paid'] as PayoutStatus[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

export default CommissionsPage;


