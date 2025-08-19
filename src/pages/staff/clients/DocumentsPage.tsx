import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';

type DocumentStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

interface ClientDocumentRow {
  id: string;
  name: string;        // file name
  client: string;
  type: string;        // Passport, Transcript, Bank Statement, etc.
  status: DocumentStatus;
  uploadedAt: string;  // ISO date
}

const statusColors: Record<DocumentStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Pending: 'info',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

const initialDocs: ClientDocumentRow[] = [
  { id: 'd1', name: 'Passport.pdf', client: 'John Doe', type: 'Passport', status: 'Submitted', uploadedAt: '2025-08-14' },
  { id: 'd2', name: 'Transcript.pdf', client: 'Ada Lovelace', type: 'Transcript', status: 'Approved', uploadedAt: '2025-08-10' },
];

export const DocumentsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<ClientDocumentRow[]>(initialDocs);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [docType, setDocType] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchTerm = !term || r.name.toLowerCase().includes(term) || r.client.toLowerCase().includes(term);
      const matchStatus = !status || r.status === status;
      const matchType = !docType || r.type.toLowerCase().includes(docType.toLowerCase());
      return matchTerm && matchStatus && matchType;
    });
  }, [rows, search, status, docType]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Document', flex: 1.2 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 0.8 },
    { field: 'uploadedAt', headerName: 'Uploaded', flex: 0.8 },
    {
      field: 'status', headerName: 'Status', flex: 0.8, sortable: false,
      renderCell: (p: GridRenderCellParams<ClientDocumentRow, any>) => (
        <Chip label={p.row.status} color={statusColors[p.row.status as DocumentStatus]} size="small" />
      )
    },
    {
      field: 'actions', headerName: 'Actions', flex: 0.8, align: 'right', headerAlign: 'right', sortable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
          <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
          <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      )
    },
  ], []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const next: ClientDocumentRow[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      next.push({
        id: `${Date.now()}_${i}`,
        name: f.name,
        client: 'Unknown Client',
        type: 'General',
        status: 'Pending',
        uploadedAt: new Date().toISOString().slice(0, 10),
      });
    }
    setRows((prev) => [...next, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Client Documents</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by document or client"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            )}}
          />
          <TextField
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as DocumentStatus | '')}
            sx={{ minWidth: 160 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}
          >
            <MenuItem value="">Status</MenuItem>
            {(['Pending','Submitted','Approved','Rejected'] as DocumentStatus[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            placeholder="Type (e.g., Passport)"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button variant="contained" startIcon={<UploadIcon />} onClick={handleUploadClick}>
            Upload Document
          </Button>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesSelected} />
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

export default DocumentsPage;


