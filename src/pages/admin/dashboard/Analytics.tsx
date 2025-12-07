import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Divider,
  Stack,
  useTheme,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export const AdminAnalytics: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30days');
  const [tabValue, setTabValue] = useState(0);

  // Design and style the stats cards/boxes like AdminDashboard
  const stats = [
    {
      label: 'Total Revenue',
      value: '₦2,450,000',
      icon: <WalletIcon />,
      color: theme.palette.success.main,
      change: '+12%',
      trend: 'up',
      tooltip: 'Revenue generated in selected period',
    },
    {
      label: 'New Users',
      value: '1,234',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      change: '+8%',
      trend: 'up',
      tooltip: 'Total new users registered',
    },
    {
      label: 'Applications',
      value: '456',
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      change: '+15%',
      trend: 'up',
      tooltip: 'Applications received',
    },
    {
      label: 'Growth Rate',
      value: '23%',
      icon: <TrendingUpIcon />,
      color: theme.palette.secondary.main,
      change: '+5%',
      trend: 'up',
      tooltip: 'User base growth rate',
    },
  ];

  // Flat radii and elevation per AdminDashboard look
  const FLAT_RADIUS = 1;
  const FLAT_ELEVATION = 0;

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 3, lg: 6 },
        py: { xs: 2, md: 4 },
        width: '100%',
        maxWidth: '1440px',
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Analytics & Reports
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.25, fontSize: '1rem' }}>
            Comprehensive system analytics and insights
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 170 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            size="small"
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards: styled like AdminDashboard */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          alignItems: "stretch"
        }}
      >
        {stats.map((metric, idx) => (
          <Box
            key={idx}
            sx={{
              minWidth: {
                xs: '100%',
                sm: '260px',
                md: '220px',
                lg: '180px'
              },
              display: "flex"
            }}
          >
            <Tooltip title={metric.tooltip || metric.label} placement="top" arrow TransitionComponent={Fade}>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: FLAT_RADIUS,
                  px: 1.5,
                  pb: 1.5,
                  background: "linear-gradient(102deg, rgba(245,247,250,0.98) 0%, #fff 60%)",
                  border: `1px solid ${theme.palette.grey[200]}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  '&:hover': { boxShadow: 4, transform: "translateY(-2px)" }
                }}
                elevation={FLAT_ELEVATION}
              >
                <CardContent sx={{ p: 2, pb: "12px !important" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: metric.color,
                        color: "#fff",
                        width: 46,
                        height: 46,
                        boxShadow: 2,
                        border: '2px solid #fff'
                      }}
                    >
                      {metric.icon}
                    </Avatar>
                    {metric.change && (
                      <Chip
                        size="small"
                        label={metric.change}
                        color={metric.trend === "up" ? "success" : metric.trend === "down" ? "error" : "default"}
                        icon={metric.trend === "up" ? <CheckCircleIcon fontSize="small" /> : metric.trend === "down" ? <WarningIcon fontSize="small" /> : undefined}
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          bgcolor: metric.trend === "up"
                            ? theme.palette.success.light
                            : metric.trend === "down"
                              ? theme.palette.error.light
                              : theme.palette.grey[50]
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0, color: theme.palette.text.primary, letterSpacing: -1 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}>
        <Tab label="Revenue Analytics" />
        <Tab label="User Analytics" />
        <Tab label="Application Analytics" />
        <Tab label="Service Analytics" />
      </Tabs>

      {/* Analytics Chart: style as in AdminDashboard */}
      <Card sx={{
        borderRadius: FLAT_RADIUS,
        boxShadow: 0,
        border: `1px solid ${theme.palette.grey[200]}`,
        mb: 3
      }} elevation={FLAT_ELEVATION}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {tabValue === 0 && 'Revenue Trends'}
            {tabValue === 1 && 'User Growth'}
            {tabValue === 2 && 'Application Statistics'}
            {tabValue === 3 && 'Service Performance'}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              height: 340,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(110deg, #f8fafb 0%, #f1f7fa 100%)',
              borderRadius: FLAT_RADIUS
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {/* Insert chart library here, e.g., Recharts, Chart.js, etc. */}
              Chart visualization will be displayed here
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Additional Analytics Section: boxes styled per AdminDashboard */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: "column" }}>
          <Card sx={{
            borderRadius: FLAT_RADIUS,
            boxShadow: 0,
            border: `1px solid ${theme.palette.grey[200]}`,
          }} elevation={FLAT_ELEVATION}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Top Performing Services
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Service performance chart
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', flexDirection: "column" }}>
          <Card sx={{
            borderRadius: FLAT_RADIUS,
            boxShadow: 0,
            border: `1px solid ${theme.palette.grey[200]}`,
          }} elevation={FLAT_ELEVATION}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                User Demographics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Demographics chart
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAnalytics;
