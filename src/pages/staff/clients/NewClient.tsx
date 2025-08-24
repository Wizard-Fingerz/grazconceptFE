import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Chip, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import userServices from '../../../services/user';
import api from '../../../services/api';

export const NewClient: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  // clientType is now the id (number or string) of the selected client type
  const [clientType, setClientType] = useState<number | ''>('');
  // services is now an array of ids (number or string) of selected services of interest
  const [services, setServices] = useState<(number | string)[]>([]);
  // teams is now an array of ids (number) of selected teams
  const [teams, setTeams] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [serviceOfInterestTypes, setServiceOfInterestTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add is_prospect checkbox state
  const [isProspect, setIsProspect] = useState(false);

  // Toggle for array of ids (number | string)
  const toggleArrayValue = (arr: (number | string)[], value: number | string) => (
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
  );

  // Toggle for array of numbers (for teams)
  const toggleNumberArrayValue = (arr: number[], value: number) => (
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientType, serviceOfInterest] = await Promise.all([
          userServices.getAllClientType(),
          userServices.getAllServiceOfInterestType(),
        ]);

        setClientTypes(clientType.results || []);
        setServiceOfInterestTypes(serviceOfInterest.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // API integration for client creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!firstName || !lastName || !email || clientType === '') {
      setError('First name, last name, email, and client type are required.');
      return;
    }

    setLoading(true);

    // Construct payload
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      country,
      client_type: clientType, // id
      service_of_interest: services, // array of ids
      assign_to_teams: teams,
      notes,
      is_prospect: isProspect, // Add is_prospect to payload
    };

    try {
      // Replace with your actual endpoint for creating a client/prospect
      await api.post('/clients/', payload);
      navigate('/staff/clients');
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        'Failed to create client. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Add New Client / Prospect</Typography>

      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              <TextField
                select
                fullWidth
                value={clientType}
                onChange={(e) => setClientType(e.target.value === '' ? '' : Number(e.target.value))}
                required
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => {
                    if (v === '' || v === undefined) return 'Client Type';
                    const found = clientTypes.find((ct) => String(ct.id) === String(v));
                    return found ? (found.label || found.name || found.term || found.value) : v;
                  }
                }}
              >
                <MenuItem value="">Client Type</MenuItem>
                {clientTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.term}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* is_prospect checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isProspect}
                  onChange={(e) => setIsProspect(e.target.checked)}
                  color="primary"
                />
              }
              label="Is Prospect"
            />

            <Stack>
              <Typography variant="subtitle2" color="text.secondary">Service Interests</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {serviceOfInterestTypes.map((s) => {
                  const value = s.id;
                  const label = s.term;
                  return (
                    <Chip
                      key={s.id || label}
                      label={label}
                      color={services.includes(value) ? 'primary' : 'default'}
                      variant={services.includes(value) ? 'filled' : 'outlined'}
                      onClick={() => setServices(prev => toggleArrayValue(prev, value))}
                    />
                  );
                })}
              </Stack>
            </Stack>

            <Stack>
              <Typography variant="subtitle2" color="text.secondary">Assign to Teams</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {/* 
                  NOTE: This is a placeholder. 
                  In a real app, you would fetch teams from the backend.
                  For now, we will use clientTypes as a mock for teams if you don't have a teams list.
                  Replace 'clientTypes' with your actual teams array if available.
                */}
                {serviceOfInterestTypes.map((team) => (
                  <FormControlLabel
                    key={team.id}
                    control={
                      <Checkbox
                        checked={teams.includes(team.id)}
                        onChange={() => setTeams(prev => toggleNumberArrayValue(prev, team.id))}
                      />
                    }
                    label={team.term}
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
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewClient;
