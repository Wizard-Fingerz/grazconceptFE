import React from 'react';
import { Box, Paper, Typography, Divider, Stack } from '@mui/material';

const analyticsData = [
  { label: 'Total Applications', value: 0 },
  { label: 'Approved Applications', value: 0 },
  { label: 'Rejected Applications', value: 0 },
  { label: 'Pending Applications', value: 0 },
];

const summaryData = [
  { label: 'Average Processing Time', value: '0 days' },
  { label: 'Conversion Rate', value: '0%' },
  { label: 'Follow-ups Needed', value: 0 },
  { label: 'Client Satisfaction', value: 'N/A' },
];

export const PerformanceAnalytics: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Performance Analytics Overview
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {analyticsData.map((item) => (
          <Paper key={item.label} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Analytics Chart
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">Analytics chart placeholder</Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 2, height: 340 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Quick Insights
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            {summaryData.map((item) => (
              <Paper key={item.label} variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2">
                  {item.label}: <b>{item.value}</b>
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Service Performance Summary
        </Typography>
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
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                0
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default PerformanceAnalytics;
