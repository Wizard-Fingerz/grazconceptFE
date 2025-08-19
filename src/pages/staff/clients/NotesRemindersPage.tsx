import React, { useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

interface NoteRow {
  id: string;
  client: string;
  message: string;
  remindAt?: string; // ISO date
}

const initialNotes: NoteRow[] = [
  { id: 'n1', client: 'John Doe', message: 'Follow up on bank statement', remindAt: '2025-08-21' },
  { id: 'n2', client: 'Ada Lovelace', message: 'Send SOP template', remindAt: '' },
];

export const NotesRemindersPage: React.FC = () => {
  const [rows, setRows] = useState<NoteRow[]>(initialNotes);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [client, setClient] = useState('');
  const [message, setMessage] = useState('');
  const [remindAt, setRemindAt] = useState('');

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 0.8 },
    { field: 'message', headerName: 'Note', flex: 1.4 },
    { field: 'remindAt', headerName: 'Reminder', flex: 0.8, valueGetter: (_v, row: NoteRow) => row.remindAt || '-' },
    {
      field: 'actions', headerName: 'Actions', flex: 0.5, align: 'right', headerAlign: 'right', sortable: false,
      renderCell: (params) => (
        <IconButton size="small" color="error" onClick={() => setRows(prev => prev.filter(r => r.id !== (params.id as string)))}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )
    },
  ], []);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return rows.slice(start, end);
  }, [rows, paginationModel]);

  const handleAdd = () => {
    if (!client || !message) return;
    setRows(prev => [{ id: `${Date.now()}`, client, message, remindAt }, ...prev]);
    setClient('');
    setMessage('');
    setRemindAt('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Notes & Reminders</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Client" value={client} onChange={(e) => setClient(e.target.value)} />
            <TextField fullWidth label="Reminder Date" type="date" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Stack>
          <TextField fullWidth label="Note" value={message} onChange={(e) => setMessage(e.target.value)} multiline minRows={3} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" onClick={handleAdd}>Add</Button>
          </Stack>
        </Stack>
      </Paper>
      <CustomDataTable
        rows={pagedRows}
        columns={columns}
        rowCount={rows.length}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default NotesRemindersPage;


