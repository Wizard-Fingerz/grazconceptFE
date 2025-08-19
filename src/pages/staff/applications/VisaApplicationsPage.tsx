import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type VisaStage = 'Docs' | 'Submission' | 'Biometrics' | 'Decision';

interface VisaRow {
  id: string;
  client: string;
  country: string;
  type: string; // e.g., Study, Visit, Work
  stage: VisaStage;
}

const stageColor: Record<VisaStage, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Docs: 'info',
  Submission: 'warning',
  Biometrics: 'primary',
  Decision: 'success',
};

const mock: VisaRow[] = [
  { id: 'v1', client: 'John Doe', country: 'Canada', type: 'Study', stage: 'Submission' },
  { id: 'v2', client: 'Ada Lovelace', country: 'UK', type: 'Visit', stage: 'Biometrics' },
];

export const VisaApplicationsPage: React.FC = () => {
  const [rows] = useState<VisaRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<VisaStage | ''>('');
  const [country, setCountry] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.client.toLowerCase().includes(term) || r.type.toLowerCase().includes(term)) &&
      (!stage || r.stage === stage) &&
      (!country || r.country.toLowerCase().includes(country.toLowerCase()))
    ));
  }, [rows, search, stage, country]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'client', headerName: 'Client', flex: 1 },
    { field: 'country', headerName: 'Country', flex: 0.8 },
    { field: 'type', headerName: 'Visa Type', flex: 0.8 },
    { field: 'stage', headerName: 'Stage', flex: 0.8, renderCell: (p) => <Chip label={p.row.stage} color={stageColor[p.row.stage as VisaStage]} size="small" />, sortable: false },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Visa Applications</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Visa</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by client or type" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField select value={stage} onChange={(e) => setStage(e.target.value as VisaStage | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Stage' }}>
            <MenuItem value="">Stage</MenuItem>
            {(['Docs','Submission','Biometrics','Decision'] as VisaStage[]).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ minWidth: 160 }} />
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

export default VisaApplicationsPage;


