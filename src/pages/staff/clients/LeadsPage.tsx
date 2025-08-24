import React, { useMemo, useState, useEffect } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment, IconButton, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import userServices from '../../../services/user';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
type LeadService = string; // Use string to allow dynamic mapping

interface LeadRow {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  service: LeadService;
  source?: string;
  nextStep?: string;
}

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

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For mapping ids to names (service_of_interest, etc.)
  const [serviceOfInterestMap, setServiceOfInterestMap] = useState<Record<number, string>>({});

  // Fetch definitions for mapping ids to names
  useEffect(() => {
    let mounted = true;
    const fetchDefinitions = async () => {
      try {
        const serviceOfInterestRes = await userServices.getAllServiceOfInterestType();
        const serviceOfInterestObj: Record<number, string> = {};
        (serviceOfInterestRes.results || []).forEach((s: any) => {
          serviceOfInterestObj[s.id] = s.term || s.label || s.name || s.value || String(s.id);
        });
        if (mounted) {
          setServiceOfInterestMap(serviceOfInterestObj);
        }
      } catch (err) {
        // ignore for now
      }
    };
    fetchDefinitions();
    return () => { mounted = false; };
  }, []);

  // Fetch all clients and filter for is_prospect === true
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    userServices.getAllClient()
      .then((data: any) => {
        if (!mounted) return;
        // Only keep is_prospect === true
        const prospects = (data.results || data || []).filter((c: any) => c.is_prospect === true);
        // Map API client object to LeadRow
        const mapped: LeadRow[] = prospects.map((c: any) => {
          // Compose name
          const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || c.id;
          // Map service_of_interest (array of ids) to string for display
          let serviceLabel: string = '-';
          if (Array.isArray(c.service_of_interest) && c.service_of_interest.length > 0) {
            serviceLabel = c.service_of_interest
              .map((sid: number) => serviceOfInterestMap[sid] || String(sid))
              .join(', ');
          }
          // Status: try to use c.status, fallback to 'New'
          let statusValue: LeadStatus = 'New';
          if (c.status && ['New','Contacted','Qualified','Disqualified'].includes(c.status)) {
            statusValue = c.status;
          }
          return {
            id: String(c.id),
            name,
            email: c.email || '',
            status: statusValue,
            service: serviceLabel,
            source: c.source || c.lead_source || '-',
            nextStep: c.next_step || '-',
          };
        });
        setLeads(mapped);
      })
      .catch((err: any) => {
        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          'Failed to load leads.'
        );
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [serviceOfInterestMap]);

  // Get unique services for filter dropdown
  const uniqueServices = useMemo(() => {
    const all: string[] = [];
    leads.forEach(l => {
      if (l.service) {
        l.service.split(',').forEach(s => {
          const trimmed = s.trim();
          if (trimmed && !all.includes(trimmed)) all.push(trimmed);
        });
      }
    });
    return all;
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const term = search.trim().toLowerCase();
      const matchesTerm = !term || l.name.toLowerCase().includes(term) || l.email.toLowerCase().includes(term);
      const matchesStatus = !status || l.status === status;
      const matchesService = !service || (l.service && l.service.split(',').map(s => s.trim()).includes(service));
      return matchesTerm && matchesStatus && matchesService;
    });
  }, [search, status, service, leads]);

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
            {uniqueServices.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (() => {
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
