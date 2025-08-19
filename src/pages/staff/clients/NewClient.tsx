import React, { useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type ClientType = 'Student' | 'JAPA Client' | 'Investor' | 'Buyer' | 'Loan Seeker' | 'Exam Candidate';

export const NewClient: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [clientType, setClientType] = useState<ClientType | ''>('');
  const [services, setServices] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggleArrayValue = (arr: string[], value: string) => (
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with API
    // eslint-disable-next-line no-console
    console.log({ firstName, lastName, email, phone, country, clientType, services, teams, notes });
    navigate('/staff/clients');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Add New Client / Prospect</Typography>

      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              <TextField select fullWidth value={clientType} onChange={(e) => setClientType(e.target.value as ClientType | '')} SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Client Type' }}>
                <MenuItem value="">Client Type</MenuItem>
                {(['Student','JAPA Client','Investor','Buyer','Loan Seeker','Exam Candidate'] as ClientType[]).map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack>
              <Typography variant="subtitle2" color="text.secondary">Service Interests</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['Study','Visa','Car','Property','Loans','Docs'].map(s => (
                  <Chip
                    key={s}
                    label={s}
                    color={services.includes(s) ? 'primary' : 'default'}
                    variant={services.includes(s) ? 'filled' : 'outlined'}
                    onClick={() => setServices(prev => toggleArrayValue(prev, s))}
                  />
                ))}
              </Stack>
            </Stack>

            <Stack>
              <Typography variant="subtitle2" color="text.secondary">Assign to Teams</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {['Study','Visa','Docs','Sales','Loans'].map(team => (
                  <FormControlLabel
                    key={team}
                    control={<Checkbox checked={teams.includes(team)} onChange={() => setTeams(prev => toggleArrayValue(prev, team))} />}
                    label={team}
                  />
                ))}
              </Stack>
            </Stack>

            <TextField
              label="Internal Notes & Reminders"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={3}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
              <Button variant="contained" type="submit">Save</Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewClient;


