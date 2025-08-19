import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type DocType = 'Yellow Card' | 'Police Report' | 'Medicals' | 'Passport' | 'Birth Cert' | 'Transcript';
type DocStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

interface LegalDocRow {
  id: string;
  client: string;
  docType: DocType;
  status: DocStatus;
  submittedAt?: string;
}

const statusColor: Record<DocStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Pending: 'info', Submitted: 'warning', Approved: 'success', Rejected: 'error'
};

const mock: LegalDocRow[] = [
  { id: 'dl1', client: 'John Doe', docType: 'Yellow Card', status: 'Pending', submittedAt: '2025-08-20' },
  { id: 'dl2', client: 'Ada Lovelace', docType: 'Passport', status: 'Approved', submittedAt: '2025-08-05' },
];

export const DocumentsLegalPage: React.FC = () => {
  const [rows] = useState<LegalDocRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState<DocType | ''>('');
  const [status, setStatus] = useState<DocStatus | ''>('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term)) &&
      (!docType || r.docType === docType) &&
      (!status || r.status === status)
    ));
  }, [rows, search, docType, status]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'docType', headerName: 'Document', flex: 1 },
    { field: 'submittedAt', headerName: 'Submitted', flex: 0.8, valueGetter: (_v, row: LegalDocRow) => row.submittedAt || '-' },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p) => <Chip label={p.row.status} color={statusColor[p.row.status as DocStatus]} size="small" />, sortable: false },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Documents & Legal</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Document</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={docType} onChange={(e) => setDocType(e.target.value as DocType | '')} sx={{ minWidth: 180 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Document Type' }}>
            <MenuItem value="">Document Type</MenuItem>
            {(['Yellow Card','Police Report','Medicals','Passport','Birth Cert','Transcript'] as DocType[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField select value={status} onChange={(e) => setStatus(e.target.value as DocStatus | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}>
            <MenuItem value="">Status</MenuItem>
            {(['Pending','Submitted','Approved','Rejected'] as DocStatus[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

export default DocumentsLegalPage;


