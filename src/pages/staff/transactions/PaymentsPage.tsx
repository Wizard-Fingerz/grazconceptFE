import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

interface PaymentRow {
  id: string;
  date: string;     // ISO date
  client: string;
  service: string;  // Study, Visa, Exams, etc.
  method: string;   // Bank, Card, Transfer
  amount: number;
  status: PaymentStatus;
}

const statusColor: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Paid: 'success',
  Pending: 'warning',
  Failed: 'error',
};

const mock: PaymentRow[] = [
  { id: 'pay1', date: '2025-08-10', client: 'John Doe', service: 'Study', method: 'Transfer', amount: 150000, status: 'Paid' },
  { id: 'pay2', date: '2025-08-12', client: 'Ada Lovelace', service: 'Visa', method: 'Card', amount: 80000, status: 'Pending' },
];

export const PaymentsPage: React.FC = () => {
  const [rows] = useState<PaymentRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [service, setService] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term)) &&
      (!status || r.status === status) &&
      (!service || r.service.toLowerCase().includes(service.toLowerCase()))
    ));
  }, [rows, search, status, service]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'date', headerName: 'Date', flex: 0.8 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'service', headerName: 'Service', flex: 0.8 },
    { field: 'method', headerName: 'Method', flex: 0.8 },
    { field: 'amount', headerName: 'Amount (₦)', flex: 0.8, valueGetter: (_v, row: PaymentRow) => row.amount.toLocaleString() },
    { field: 'status', headerName: 'Status', flex: 0.7, renderCell: (p) => <Chip label={p.row.status} color={statusColor[p.row.status as PaymentStatus]} size="small" />, sortable: false },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Payments</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}>
            <MenuItem value="">Status</MenuItem>
            {(['Paid','Pending','Failed'] as PaymentStatus[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField placeholder="Service" value={service} onChange={(e) => setService(e.target.value)} sx={{ minWidth: 160 }} />
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

export default PaymentsPage;


