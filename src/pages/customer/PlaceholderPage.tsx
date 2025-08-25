import React from 'react';
import { Box, Paper, Typography, Button, useTheme } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface CustomerPlaceholderPageProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

export const CustomerPlaceholderPage: React.FC<CustomerPlaceholderPageProps> = ({
  title,
  description,
  onBack,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          boxShadow: theme.shadows[4],
        }}
      >
        <ConstructionIcon
          color="warning"
          sx={{
            fontSize: 56,
            mb: 2,
            color: theme.palette.secondary.main,
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description ||
            "We're working hard to bring this page to life. Please check back soon for updates and new features!"}
        </Typography>
        {onBack && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mt: 1 }}
          >
            Go Back
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerPlaceholderPage;
