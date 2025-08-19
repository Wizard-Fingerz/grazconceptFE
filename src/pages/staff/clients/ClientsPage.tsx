import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';

type ClientStatus = 'New' | 'Active' | 'Completed';
type ClientService = 'Study' | 'Visa' | 'Car' | 'Property' | 'Loans' | 'Docs';
type ClientType = 'Student' | 'JAPA Client' | 'Investor' | 'Buyer' | 'Loan Seeker' | 'Exam Candidate';

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: ClientType;
  status: ClientStatus;
  service: ClientService;
  country?: string;
  team?: string;
  lastActivity?: string;
}

const mockClients: ClientRow[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', type: 'Student', status: 'New', service: 'Study', country: 'Canada', team: 'Study', lastActivity: '2025-08-12' },
  { id: '2', name: 'Ada Lovelace', email: 'ada@example.com', type: 'Investor', status: 'Active', service: 'Property', country: 'UK', team: 'Sales', lastActivity: '2025-08-16' },
  { id: '3', name: 'Tunde Balogun', email: 'tunde@example.com', type: 'JAPA Client', status: 'Active', service: 'Visa', country: 'USA', team: 'Visa', lastActivity: '2025-08-18' },
];

const statusColors: Record<ClientStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  New: 'info',
  Active: 'success',
  Completed: 'default',
};

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ClientStatus | ''>('');
  const [service, setService] = useState<ClientService | ''>('');
  const [country, setCountry] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const filtered = useMemo(() => {
    return mockClients.filter((c) => {
      const term = search.trim().toLowerCase();
      const matchesTerm = !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
      const matchesStatus = !status || c.status === status;
      const matchesService = !service || c.service === service;
      const matchesCountry = !country || (c.country || '').toLowerCase().includes(country.toLowerCase());
      return matchesTerm && matchesStatus && matchesService && matchesCountry;
    });
  }, [search, status, service, country]);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.2,
      renderCell: (params: GridRenderCellParams<ClientRow, any>) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
        </Stack>
      ),
      sortable: false,
    },
    { field: 'type', headerName: 'Type', flex: 0.8, renderCell: (p: GridRenderCellParams<ClientRow, any>) => <Chip label={p.row.type} size="small" />, sortable: false },
    { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p: GridRenderCellParams<ClientRow, any>) => <Chip label={p.row.status} color={statusColors[p.row.status as ClientStatus]} size="small" />, sortable: false },
    { field: 'service', headerName: 'Service', flex: 0.8 },
    { field: 'country', headerName: 'Country', flex: 0.8, valueGetter: (_value, row: ClientRow) => row.country || '-' },
    { field: 'team', headerName: 'Team', flex: 0.8, valueGetter: (_value, row: ClientRow) => row.team || '-' },
    { field: 'lastActivity', headerName: 'Last Activity', flex: 0.8, valueGetter: (_value, row: ClientRow) => row.lastActivity || '-' },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: () => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
          <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
          <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
        </Stack>
      ),
      sortable: false,
      filterable: false,
    },
  ], []);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Clients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/staff/clients/new')}>
          Add New Client
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            )}}
          />
          <TextField
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus | '')}
            sx={{ minWidth: 160 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}
          >
            <MenuItem value="">Status</MenuItem>
            {(['New','Active','Completed'] as ClientStatus[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={service}
            onChange={(e) => setService(e.target.value as ClientService | '')}
            sx={{ minWidth: 180 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Service' }}
          >
            <MenuItem value="">Service</MenuItem>
            {(['Study','Visa','Car','Property','Loans','Docs'] as ClientService[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            sx={{ minWidth: 160 }}
          />
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

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">Upload & Track Documents, Team Assignment, Notes/Reminders, and WhatsApp/Email actions will appear in the client details page.</Typography>
    </Box>
  );
};

export default ClientsPage;


