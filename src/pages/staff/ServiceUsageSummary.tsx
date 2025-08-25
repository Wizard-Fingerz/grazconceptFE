import React from 'react';
import { Box, Paper, Typography, Divider, Stack, Avatar, useTheme, useMediaQuery } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const usageData = [
  { label: 'Study Abroad', value: 0, icon: <SchoolIcon /> },
  { label: 'Visa', value: 0, icon: <FlightTakeoffIcon /> },
  { label: 'Car Rentals', value: 0, icon: <DirectionsCarIcon /> },
  { label: 'Gadgets', value: 0, icon: <DevicesOtherIcon /> },
  { label: 'Legal Docs', value: 0, icon: <GavelIcon /> },
  { label: 'Tours', value: 0, icon: <EmojiEventsIcon /> },
];

const summaryStats = [
  { label: 'Total Services Used', value: 0, icon: <TrendingUpIcon /> },
  { label: 'Active Users', value: 0, icon: <PeopleAltIcon /> },
  { label: 'Completed Transactions', value: 0, icon: <CheckCircleIcon /> },
  { label: 'Pending Requests', value: 0, icon: <HourglassEmptyIcon /> },
  { label: 'Avg. Usage/Client', value: '0', icon: <StarIcon /> },
  { label: 'Top Service', value: 'N/A', icon: <EmojiEventsIcon /> },
];

export const ServiceUsageSummary: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 1, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Service Usage Summary
      </Typography>


      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          mb: 4,
        }}
      >
        {usageData.map((item) => (
          <Paper
            key={item.label}
            elevation={1}
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2,
              // Remove background color
              transition: 'box-shadow 0.2s',
              // Remove hover border color
              '&:hover': { boxShadow: 4 },
            }}
          >
            <Avatar
              sx={{
                // Remove custom colors
                mx: 'auto',
                mb: 1,
                width: 40,
                height: 40,
              }}
            >
              {item.icon}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Usage Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          }}
        >
          {summaryStats.map((stat) => (
            <Paper
              key={stat.label}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                // Remove background color
                minHeight: 80,
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  // Remove custom colors
                  width: 36,
                  height: 36,
                  mr: 1.5,
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default ServiceUsageSummary;
