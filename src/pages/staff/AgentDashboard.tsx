import React from 'react';
import { Box, Paper, Typography, Stack, Divider } from '@mui/material';

export const AgentDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Dashboard Overview</Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Total Clients</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>0</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Active Applications</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>0</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Earnings This Month</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>₦0</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Leads to Follow-up</Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>0</Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          mt: 1,
        }}
      >
        <Paper sx={{ p: 2, height: 340 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Performance Analytics</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Analytics chart placeholder</Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 2, height: 340 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2">Add New Client</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2">Create Application</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="body2">Record Payment</Typography>
            </Paper>
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Service Usage Summary</Typography>
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
          }}
        >
          {['Study', 'Visa', 'Cars', 'Gadgets', 'Exams', 'Loans'].map((label) => (
            <Paper key={label} variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>0</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AgentDashboard;

