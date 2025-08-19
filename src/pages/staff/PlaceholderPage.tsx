import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>{title}</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {description || 'This page is under construction. Integrate API and UI components here.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default PlaceholderPage;

