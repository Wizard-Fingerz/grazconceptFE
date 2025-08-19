import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography, InputAdornment, Button, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  client: string;
  service: string;
  date: string;
  amount: number;
}

const mock: InvoiceRow[] = [
  { id: 'i1', invoiceNo: 'INV-1001', client: 'John Doe', service: 'Study', date: '2025-08-10', amount: 150000 },
  { id: 'i2', invoiceNo: 'INV-1002', client: 'Ada Lovelace', service: 'Visa', date: '2025-08-12', amount: 80000 },
];

export const InvoicesReceiptsPage: React.FC = () => {
  const [rows] = useState<InvoiceRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [service, setService] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term) || r.invoiceNo.toLowerCase().includes(term)) &&
      (!service || r.service.toLowerCase().includes(service.toLowerCase()))
    ));
  }, [rows, search, service]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'invoiceNo', headerName: 'Invoice #', flex: 0.8 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'service', headerName: 'Service', flex: 0.8 },
    { field: 'date', headerName: 'Date', flex: 0.8 },
    { field: 'amount', headerName: 'Amount (₦)', flex: 0.8, valueGetter: (_v, row: InvoiceRow) => row.amount.toLocaleString() },
    {
      field: 'actions', headerName: 'Actions', flex: 0.8, align: 'right', headerAlign: 'right', sortable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
          <IconButton size="small"><PrintIcon fontSize="small" /></IconButton>
          <IconButton size="small"><PictureAsPdfIcon fontSize="small" /></IconButton>
        </Stack>
      )
    },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Invoices & Receipts</Typography>
        <Button variant="contained">New Invoice</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client or invoice #" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
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

export default InvoicesReceiptsPage;


