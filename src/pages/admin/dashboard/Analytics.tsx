import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import authService from '../../../services/authService';

const pieColors = [
  "#009688", "#1976d2", "#ffc107", "#4caf50", "#ff7043", "#8e24aa", "#00bcd4"
];

export const AdminAnalytics: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30days');
  const [tabValue, setTabValue] = useState(0);

  // --- Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    authService.getAdminAnalyticsAndReport({ timeRange })
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch analytics"
        );
        setLoading(false);
      });
  }, [timeRange]);

  // --- Use API fields as per the prompt/response
  // Calculate change/trend as N/A since not present in API
  const stats = [
    {
      label: 'Total Revenue',
      value: analytics?.metrics?.revenue_total != null
        ? '₦' + analytics.metrics.revenue_total.toLocaleString()
        : '₦0',
      icon: <WalletIcon />,
      color: theme.palette.success.main,
      change: '', // no delta in API
      trend: "flat", // no delta provided in API
      tooltip: 'Revenue generated in selected period',
    },
    {
      label: 'New Users',
      value: analytics?.metrics?.new_users != null
        ? analytics.metrics.new_users.toLocaleString()
        : '0',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      change: '', // no delta
      trend: "flat",
      tooltip: 'Total new users registered',
    },
    {
      label: 'Applications',
      value: analytics?.metrics?.applications != null
        ? analytics.metrics.applications.toLocaleString()
        : '0',
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      change: '', // no delta
      trend: "flat",
      tooltip: 'Applications received',
    },
    {
      label: 'Growth Rate',
      value: analytics?.metrics?.growth_rate != null
        ? analytics.metrics.growth_rate
        : '0%',
      icon: <TrendingUpIcon />,
      color: theme.palette.secondary.main,
      change: '', // no delta
      trend: "flat",
      tooltip: 'User base growth rate',
    },
  ];

  const FLAT_RADIUS = 1;
  const FLAT_ELEVATION = 0;

  // --- Chart data from API
  const revenueLineData = analytics?.revenue_trend ?? [];
  const userGrowthLineData = analytics?.user_growth ?? [];
  const applicationsPieData = analytics?.application_distribution ?? [];
  const servicePerformancePieData = analytics?.service_analytics ?? [];
  const topServicesPieData = analytics?.top_services ?? [];
  const userDemographicsPieData = analytics?.user_demographics ?? [];

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: 1600,
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

      {/* Stats Cards */}
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
                    {metric.change && metric.change !== "" && (
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

      {/* Analytics Chart */}
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
            {tabValue === 2 && 'Application Distribution'}
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
              borderRadius: FLAT_RADIUS,
              px: { xs: 0, md: 2 },
            }}
          >
            {/* Chart Loading/Error State */}
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
            ) : (
              <>
                {tabValue === 0 && (
                  <ResponsiveContainer width="99%" height={300}>
                    <LineChart data={revenueLineData}>
                      <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {tabValue === 1 && (
                  <ResponsiveContainer width="99%" height={300}>
                    <LineChart data={userGrowthLineData}>
                      <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {tabValue === 2 && (
                  <ResponsiveContainer width="99%" height={300}>
                    <PieChart>
                      <Pie
                        data={applicationsPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {applicationsPieData.map((_entry: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {tabValue === 3 && (
                  <ResponsiveContainer width="99%" height={300}>
                    <PieChart>
                      <Pie
                        data={servicePerformancePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {servicePerformancePieData.map((_entry: any, idx: number) => (
                          <Cell key={`serv-${idx}`} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Additional Analytics Section */}
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
                <ResponsiveContainer width="99%" height={220}>
                  <PieChart>
                    <Pie
                      data={topServicesPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {topServicesPieData.map((_entry: any, idx: number) => (
                        <Cell key={`topserv-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="99%" height={220}>
                  <PieChart>
                    <Pie
                      data={userDemographicsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {userDemographicsPieData.map((_entry: any, idx: number) => (
                        <Cell key={`age-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAnalytics;
