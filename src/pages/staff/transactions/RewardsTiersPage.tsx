import React, { useMemo, useState } from 'react';
import { Box, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

interface RewardRow {
  id: string;
  agent: string;
  tier: Tier;
  points: number;
  reward?: string; // Cash, Gift, Trip
}

const mock: RewardRow[] = [
  { id: 'r1', agent: 'Agent A', tier: 'Silver', points: 1200, reward: 'Cash' },
  { id: 'r2', agent: 'Agent B', tier: 'Gold', points: 2500, reward: 'Gift' },
];

export const RewardsTiersPage: React.FC = () => {
  const [rows] = useState<RewardRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [tier, setTier] = useState<Tier | ''>('');

  const filtered = useMemo(() => {
    return rows.filter(r => !tier || r.tier === tier);
  }, [rows, tier]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'agent', headerName: 'Agent', flex: 1 },
    { field: 'tier', headerName: 'Tier', flex: 0.6, renderCell: (p) => <Chip label={p.row.tier} size="small" />, sortable: false },
    { field: 'points', headerName: 'Points', flex: 0.6 },
    { field: 'reward', headerName: 'Reward', flex: 0.8, valueGetter: (_v, row: RewardRow) => row.reward || '-' },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Rewards & Tiers</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select value={tier} onChange={(e) => setTier(e.target.value as Tier | '')} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Tier' }}>
            <MenuItem value="">Tier</MenuItem>
            {(['Bronze','Silver','Gold','Diamond'] as Tier[]).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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

export default RewardsTiersPage;


