import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import userServices from '../../../services/user';

type ClientStatus = 'New' | 'Active' | 'Completed';

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: string; // Now string, not enum
  status: ClientStatus;
  service: string; // Now string, not enum
  country?: string;
  team?: string;
  lastActivity?: string;
}

const statusColors: Record<ClientStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  New: 'info',
  Active: 'success',
  Completed: 'default',
};

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ClientStatus | ''>('');
  const [service, setService] = useState<string | ''>('');
  const [country, setCountry] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For mapping ids to names
  const [clientTypeMap, setClientTypeMap] = useState<Record<number, string>>({});
  const [serviceOfInterestMap, setServiceOfInterestMap] = useState<Record<number, string>>({});
  const [teamMap, setTeamMap] = useState<Record<number, string>>({});

  // Fetch definitions for mapping ids to names
  useEffect(() => {
    let mounted = true;
    const fetchDefinitions = async () => {
      try {
        const [clientTypeRes, serviceOfInterestRes] = await Promise.all([
          userServices.getAllClientType(),
          userServices.getAllServiceOfInterestType(),
        ]);
        // Build id->name maps
        const clientTypeObj: Record<number, string> = {};
        (clientTypeRes.results || []).forEach((ct: any) => {
          clientTypeObj[ct.id] = ct.term || ct.label || ct.name || ct.value || String(ct.id);
        });
        const serviceOfInterestObj: Record<number, string> = {};
        (serviceOfInterestRes.results || []).forEach((s: any) => {
          serviceOfInterestObj[s.id] = s.term || s.label || s.name || s.value || String(s.id);
        });
        // For demo, use serviceOfInterest as teams as well (see NewClient.tsx)
        const teamObj: Record<number, string> = {};
        (serviceOfInterestRes.results || []).forEach((t: any) => {
          teamObj[t.id] = t.term || t.label || t.name || t.value || String(t.id);
        });
        if (mounted) {
          setClientTypeMap(clientTypeObj);
          setServiceOfInterestMap(serviceOfInterestObj);
          setTeamMap(teamObj);
        }
      } catch (err) {
        // ignore for now
      }
    };
    fetchDefinitions();
    return () => { mounted = false; };
  }, []);

  // Map API client object to ClientRow, using id->name maps
  function mapApiClientToRow(apiClient: any): ClientRow {
    // Client type
    let typeName = '';
    if (typeof apiClient.client_type === 'number' && clientTypeMap[apiClient.client_type]) {
      typeName = clientTypeMap[apiClient.client_type];
    } else if (apiClient.client_type_name) {
      typeName = apiClient.client_type_name;
    } else if (apiClient.client_type_label) {
      typeName = apiClient.client_type_label;
    } else {
      typeName = String(apiClient.client_type || '');
    }

    // Service of interest (show first, or join if multiple)
    let serviceName = '';
    if (Array.isArray(apiClient.service_of_interest) && apiClient.service_of_interest.length > 0) {
      serviceName = apiClient.service_of_interest
        .map((id: number) => serviceOfInterestMap[id] || String(id))
        .join(', ');
    } else if (apiClient.service_of_interest_label) {
      if (Array.isArray(apiClient.service_of_interest_label)) {
        serviceName = apiClient.service_of_interest_label.join(', ');
      } else {
        serviceName = apiClient.service_of_interest_label;
      }
    } else if (apiClient.service_of_interest) {
      serviceName = String(apiClient.service_of_interest);
    }

    // Team (assign_to_teams)
    let teamName = '';
    if (Array.isArray(apiClient.assign_to_teams) && apiClient.assign_to_teams.length > 0) {
      teamName = apiClient.assign_to_teams
        .map((id: number) => teamMap[id] || String(id))
        .join(', ');
    } else if (apiClient.assign_to_teams_label) {
      if (Array.isArray(apiClient.assign_to_teams_label)) {
        teamName = apiClient.assign_to_teams_label.join(', ');
      } else {
        teamName = apiClient.assign_to_teams_label;
      }
    } else if (apiClient.team) {
      teamName = String(apiClient.team);
    }

    return {
      id: String(apiClient.id),
      name: `${apiClient.first_name || ''} ${apiClient.last_name || ''}`.trim() || apiClient.name || apiClient.email || 'Unknown',
      email: apiClient.email || '',
      phone: apiClient.phone_number || apiClient.phone || '',
      type: typeName || 'Unknown',
      status: (apiClient.status || 'New') as ClientStatus,
      service: serviceName || 'Unknown',
      country: apiClient.country || '',
      team: teamName || '',
      lastActivity: apiClient.last_activity || apiClient.lastActivity || '',
    };
  }

  // Fetch clients
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    userServices.getAllClient()
      .then((data) => {
        const apiClients = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        // Wait for mapping data to be loaded before mapping clients
        setClients(apiClients.map(mapApiClientToRow));
      })
      .catch((_err) => {
        if (mounted) setError('Failed to load clients');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [clientTypeMap, serviceOfInterestMap, teamMap]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const term = search.trim().toLowerCase();
      const matchesTerm = !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
      const matchesStatus = !status || c.status === status;
      const matchesService = !service || (c.service && c.service.toLowerCase().includes(service.toLowerCase()));
      const matchesCountry = !country || (c.country || '').toLowerCase().includes(country.toLowerCase());
      return matchesTerm && matchesStatus && matchesService && matchesCountry;
    });
  }, [clients, search, status, service, country]);

  // For service filter dropdown, get all unique service names from serviceOfInterestMap
  const allServiceNames = useMemo(() => {
    const names = Object.values(serviceOfInterestMap);
    return Array.from(new Set(names)).sort();
  }, [serviceOfInterestMap]);

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
            onChange={(e) => setService(e.target.value as string | '')}
            sx={{ minWidth: 180 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Service' }}
          >
            <MenuItem value="">Service</MenuItem>
            {allServiceNames.map(s => (
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Stack alignItems="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <CustomDataTable
          rows={pagedRows}
          columns={columns}
          rowCount={filtered.length}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
        />
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">Upload & Track Documents, Team Assignment, Notes/Reminders, and WhatsApp/Email actions will appear in the client details page.</Typography>
    </Box>
  );
};

export default ClientsPage;
