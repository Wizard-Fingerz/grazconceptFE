import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';

export const AssignTeamsPage: React.FC = () => {
  const [clientEmail, setClientEmail] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const toggle = (val: string) => setTeams(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const handleAssign = () => {
    // TODO: API call
    // eslint-disable-next-line no-console
    console.log({ clientEmail, teams });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Assign to Internal Teams</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Client Email" fullWidth value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {['Study','Visa','Docs','Sales','Loans'].map(t => (
              <FormControlLabel key={t} control={<Checkbox checked={teams.includes(t)} onChange={() => toggle(t)} />} label={t} />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" onClick={handleAssign}>Assign</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AssignTeamsPage;


