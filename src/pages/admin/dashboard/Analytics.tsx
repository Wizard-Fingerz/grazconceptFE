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

// Import Recharts
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

// Demo colors (from SavingPlan.tsx)
const pieColors = [
  "#009688", "#1976d2", "#ffc107", "#4caf50", "#ff7043", "#8e24aa", "#00bcd4"
];

const demoLineData = [
  { date: "2024-05-01", value: 120000 },
  { date: "2024-05-05", value: 230000 },
  { date: "2024-05-10", value: 365000 },
  { date: "2024-05-15", value: 420000 },
  { date: "2024-05-20", value: 700000 },
  { date: "2024-05-25", value: 1100000 },
  { date: "2024-05-30", value: 1400000 },
  { date: "2024-06-03", value: 2000000 },
  { date: "2024-06-07", value: 2450000 },
];

const demoPieData = [
  { name: "Web App", value: 1220000 },
  { name: "Mobile App", value: 700000 },
  { name: "API Access", value: 310000 },
  { name: "Agent Portal", value: 220000 },
];

const demoUserGrowthData = [
  { date: "2024-05-01", users: 200 },
  { date: "2024-05-07", users: 420 },
  { date: "2024-05-14", users: 900 },
  { date: "2024-05-21", users: 1330 },
  { date: "2024-05-28", users: 1500 },
  { date: "2024-06-04", users: 1600 },
];

export const AdminAnalytics: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30days');
  const [tabValue, setTabValue] = useState(0);

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

  const FLAT_RADIUS = 1;
  const FLAT_ELEVATION = 0;

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

      {/* Analytics Chart using Recharts - as in SavingPlan.tsx */}
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
            {/* Show charts */}
            {/* See SavingPlan.tsx 32-44 */}
            {tabValue === 0 && (
              <ResponsiveContainer width="99%" height={300}>
                <LineChart data={demoLineData}>
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
                <LineChart data={demoUserGrowthData}>
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
                {/* Pie chart for applications */}
                <PieChart>
                  <Pie
                    data={demoPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {demoPieData.map((_entry, idx) => (
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
                {/* For service analytics, another Pie/Line placeholder */}
                <PieChart>
                  <Pie
                    data={[
                      { name: "Payment", value: 800000 },
                      { name: "KYC", value: 300000 },
                      { name: "Loan", value: 950000 },
                      { name: "Reporting", value: 400000 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {[0, 1, 2, 3].map(idx => (
                      <Cell key={`serv-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
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
                {/* Pie Chart: Demo */}
                <ResponsiveContainer width="99%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Payments", value: 420000 },
                        { name: "Transfers", value: 310000 },
                        { name: "Savings", value: 950000 },
                        { name: "Loans", value: 350000 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[0, 1, 2, 3].map(idx => (
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
                {/* Pie Chart: Demo */}
                <ResponsiveContainer width="99%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "18-24", value: 300 },
                        { name: "25-34", value: 600 },
                        { name: "35-44", value: 900 },
                        { name: "45+", value: 400 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[0, 1, 2, 3].map(idx => (
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
