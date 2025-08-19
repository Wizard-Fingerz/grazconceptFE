import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
type LeadService = 'Study' | 'Visa' | 'Car' | 'Property' | 'Loans' | 'Docs';

interface LeadRow {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  service: LeadService;
  source?: string;
  nextStep?: string;
}

const mockLeads: LeadRow[] = [
  { id: 'l1', name: 'Mary Jane', email: 'mary@example.com', status: 'New', service: 'Study', source: 'Website', nextStep: 'Call' },
  { id: 'l2', name: 'Chidi Okafor', email: 'chidi@example.com', status: 'Contacted', service: 'Visa', source: 'Referral', nextStep: 'Docs' },
];

const statusColors: Record<LeadStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  New: 'info',
  Contacted: 'warning',
  Qualified: 'success',
  Disqualified: 'default',
};

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [service, setService] = useState<LeadService | ''>('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const filtered = useMemo(() => {
    return mockLeads.filter((l) => {
      const term = search.trim().toLowerCase();
      const matchesTerm = !term || l.name.toLowerCase().includes(term) || l.email.toLowerCase().includes(term);
      const matchesStatus = !status || l.status === status;
      const matchesService = !service || l.service === service;
      return matchesTerm && matchesStatus && matchesService;
    });
  }, [search, status, service]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Leads</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/staff/clients/new')}>
          Add New Prospect
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
            onChange={(e) => setStatus(e.target.value as LeadStatus | '')}
            sx={{ minWidth: 160 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}
          >
            <MenuItem value="">Status</MenuItem>
            {(['New','Contacted','Qualified','Disqualified'] as LeadStatus[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={service}
            onChange={(e) => setService(e.target.value as LeadService | '')}
            sx={{ minWidth: 180 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Service' }}
          >
            <MenuItem value="">Service</MenuItem>
            {(['Study','Visa','Car','Property','Loans','Docs'] as LeadService[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {(() => {
        const columns: GridColDef[] = [
          {
            field: 'name',
            headerName: 'Name',
            flex: 1.2,
            renderCell: (params: GridRenderCellParams<LeadRow, any>) => (
              <Stack spacing={0.25}>
                <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
                <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
              </Stack>
            ),
            sortable: false,
          },
          { field: 'status', headerName: 'Status', flex: 0.8, renderCell: (p: GridRenderCellParams<LeadRow, any>) => <Chip label={p.row.status} color={statusColors[p.row.status as LeadStatus]} size="small" />, sortable: false },
          { field: 'service', headerName: 'Service', flex: 0.8 },
          { field: 'source', headerName: 'Source', flex: 0.8, valueGetter: (_value, row: LeadRow) => row.source || '-' },
          { field: 'nextStep', headerName: 'Next Step', flex: 0.8, valueGetter: (_value, row: LeadRow) => row.nextStep || '-' },
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
        ];
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const rows = filtered.slice(start, end);

        return (
          <CustomDataTable
            rows={rows}
            columns={columns}
            rowCount={filtered.length}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
          />
        );
      })()}
    </Box>
  );
};

export default LeadsPage;


