import React, { useMemo, useState } from 'react';
import { Box, Chip, Paper, Stack, TextField, Typography, Button, InputAdornment, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type OrderStatus = 'Quoted' | 'Paid' | 'Shipped' | 'Delivered';

interface OrderRow {
  id: string;
  client: string;
  product: string;
  status: OrderStatus;
  plan?: string; // installment plan
}

const statusColor: Record<OrderStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Quoted: 'info',
  Paid: 'primary',
  Shipped: 'warning',
  Delivered: 'success',
};

const mock: OrderRow[] = [
  { id: 'o1', client: 'John Doe', product: 'Toyota Camry', status: 'Quoted', plan: '6 months' },
  { id: 'o2', client: 'Ada Lovelace', product: 'iPhone 15', status: 'Paid', plan: '3 months' },
];

export const OrdersPage: React.FC = () => {
  const [rows] = useState<OrderRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term) || r.product.toLowerCase().includes(term)) &&
      (!status || r.status === status)
    ));
  }, [rows, search, status]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'product', headerName: 'Product', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <Chip label={p.row.status} color={statusColor[p.row.status as OrderStatus]} size="small" />, sortable: false },
    { field: 'plan', headerName: 'Installment', flex: 0.8, valueGetter: (_v, row: OrderRow) => row.plan || '-' },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Orders (Car/Gadget/TV)</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Order</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client or product" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}>
            <MenuItem value="">Status</MenuItem>
            {(['Quoted','Paid','Shipped','Delivered'] as OrderStatus[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

export default OrdersPage;


