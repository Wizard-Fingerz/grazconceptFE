import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  FlightTakeoff as FlightIcon,
  LocalAtm as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AdminPanelSettings as AdminIcon,
  ContentPaste as ContentIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
} from 'recharts';

// Remove Grid, use Box (with flex, gap, wrap, etc) for layout

interface DashboardMetric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

const statusInfo = [
  { label: "API", status: "Operational", color: "success", value: 100 },
  { label: "Database", status: "Healthy", color: "success", value: 99 },
  { label: "Payment Gateway", status: "Operational", color: "success", value: 100 },
  { label: "Email Service", status: "Operational", color: "success", value: 98 },
  { label: "Storage", status: "Warning: 85% full", color: "warning", value: 85 },
];

// Demo analytics/mock data for Recharts
const analyticsData = [
  { month: 'Jan', Users: 400, Revenue: 2400, Applications: 35 },
  { month: 'Feb', Users: 700, Revenue: 3200, Applications: 50 },
  { month: 'Mar', Users: 820, Revenue: 4100, Applications: 54 },
  { month: 'Apr', Users: 950, Revenue: 5600, Applications: 58 },
  { month: 'May', Users: 1100, Revenue: 6200, Applications: 60 },
  { month: 'Jun', Users: 1240, Revenue: 7200, Applications: 65 },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);

  // Demo/mock data
  const [metrics] = useState<DashboardMetric[]>([
    { label: 'Users', value: 1240, icon: <PeopleIcon />, color: theme.palette.primary.main, change: '+12.5%', trend: 'up', tooltip: 'Total registered users' },
    { label: 'Revenue', value: '₦10,257,500', icon: <MoneyIcon />, color: theme.palette.success.main, change: '+8.1%', trend: 'up', tooltip: 'Total revenue generated this month' },
    { label: 'Applications', value: 265, icon: <AssignmentIcon />, color: theme.palette.warning.main, change: '+3.2%', trend: 'up', tooltip: 'Active/ongoing applications' },
    { label: 'Approvals', value: 14, icon: <ScheduleIcon />, color: theme.palette.error.main, change: '-2%', trend: 'down', tooltip: 'Pending approvals for admin review' },
    { label: 'Staff', value: 33, icon: <AdminIcon />, color: theme.palette.secondary.main, change: '+2', trend: 'up', tooltip: 'Staff accounts' },
    { label: 'Health', value: '99%', icon: <CheckCircleIcon />, color: theme.palette.success.light, change: 'Normal', trend: 'neutral', tooltip: 'System uptime this month' },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: '1', type: 'user', description: 'New user registered', timestamp: '2h ago', user: 'John Doe' },
    { id: '2', type: 'application', description: 'Study visa application submitted', timestamp: '3h ago', user: 'Jane Smith' },
    { id: '3', type: 'payment', description: 'Payment processed', timestamp: '5h ago', user: 'Mike Johnson' },
    { id: '4', type: 'user', description: 'User upgraded to premium', timestamp: '7h ago', user: 'Emily Wilson' },
    { id: '5', type: 'application', description: 'Work visa approved', timestamp: '10h ago', user: 'Peter China' },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const quickActions = [
    { label: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users', color: theme.palette.primary.main },
    { label: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings', color: theme.palette.grey[800] },
    { label: 'Analytics', icon: <ChartIcon />, path: '/admin/analytics', color: theme.palette.success.main },
    { label: 'Content', icon: <ContentIcon />, path: '/admin/content', color: theme.palette.warning.main },
    { label: 'Finances', icon: <WalletIcon />, path: '/admin/financial', color: theme.palette.secondary.main },
    { label: 'Security Logs', icon: <SecurityIcon />, path: '/admin/security', color: theme.palette.error.main },
  ];

  const serviceStats = [
    { label: 'Study Visa', count: 78, icon: <SchoolIcon /> },
    { label: 'Work Visa', count: 33, icon: <FlightIcon /> },
    { label: 'Travel', count: 44, icon: <FlightIcon /> },
    { label: 'Loans', count: 12, icon: <MoneyIcon /> },
  ];

  // Default border radius and elevation for all Card/Paper
  const FLAT_RADIUS = 1; // reduce from 3, 2.5, 2 etc to 1
  const FLAT_ELEVATION = 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress color="primary" thickness={4} size={56} />
      </Box>
    );
  }

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
      {/* Dashboard Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: 1
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.25, fontSize: '1rem' }}>
            Welcome, {user?.first_name || 'Admin'}. Review key stats and manage the platform efficiently.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: isMobile ? 2 : 0 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/admin/analytics')}>
            View Analytics
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/settings')}>
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          alignItems: "stretch"
        }}
      >
        {metrics.map((metric, idx) => (
          <Box
            key={idx}
            sx={{
              minWidth: {
                xs: '100%',
                sm: '260px',   // Or use a minimum width you prefer for each box
                md: '220px',   // Adjust as needed for your design
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

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Quick actions */}
        <Box sx={{
          width: { xs: '100%', md: '41.5%' },
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Card sx={{
            borderRadius: FLAT_RADIUS,
            boxShadow: 0,
            border: `1px solid ${theme.palette.grey[200]}`,
            height: '100%',
            minHeight: 1,
            flex: 1
          }} elevation={FLAT_ELEVATION}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.2,
                }}
              >
                {quickActions.map((action, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: { xs: '0 0 48%', sm: '0 0 31%' },
                      minWidth: { xs: '48%', sm: '31%' },
                      maxWidth: { xs: '48%', sm: '31%' },
                    }}
                  >
                    <Paper
                      elevation={FLAT_ELEVATION}
                      onClick={() => navigate(action.path)}
                      sx={{
                        py: 2.5,
                        px: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        background: 'linear-gradient(104deg, #fafafc 0%, #f5f6fa 100%)',
                        borderRadius: FLAT_RADIUS,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        boxShadow: "0 0.5px 2px -2px #e3e6ee", // was 0 1.5px 5px -2px, reduce for less depth
                        transition: "all 0.18s",
                        '&:hover': {
                          background: theme.palette.grey[50],
                          boxShadow: "0 2px 10px -4px #d3d8e3", // smaller hover shadow
                          transform: "translateY(-2px)",
                        }
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: action.color, width: 38, height: 38, boxShadow: 1, mb: 0.5 }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '15px', textAlign: 'center', color: theme.palette.text.primary }}>
                        {action.label}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* System status */}
        <Box sx={{ width: { xs: '100%', md: 'calc(58.5% - 24px)' }, minHeight: 1, display: 'flex', flexDirection: "column" }}>
          <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: 0, border: `1px solid ${theme.palette.grey[200]}` }} elevation={FLAT_ELEVATION}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                System Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2} sx={{ width: '100%', mt: 1 }}>
                {statusInfo.map((item) => (
                  <Box key={item.label} sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.color as 'success' | 'warning' | 'error' | 'default'}
                        sx={{ fontWeight: 600, minWidth: 94 }}
                        icon={item.color === "warning"
                          ? <WarningIcon fontSize="small" />
                          : <CheckCircleIcon fontSize="small" />
                        }
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      color={item.color as 'success' | 'warning' | 'error' | 'primary'}
                      sx={{
                        height: 7,
                        bgcolor: theme.palette.grey[100],
                        borderRadius: 6,
                        mb: 0.2
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* More Data Widgets */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3
        }}
      >
        <Box sx={{ width: { xs: '100%', md: '47%' }, display: 'flex', flexDirection: "column" }}>
          <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: 0, border: `1px solid ${theme.palette.grey[200]}` }} elevation={FLAT_ELEVATION}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Service Stats</Typography>
                <Button size="small" color="primary" sx={{ fontWeight: 600 }} onClick={() => navigate('/admin/services')}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2.5
                }}
              >
                {serviceStats.map((service, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flexBasis: { xs: '48%', sm: '48%' },
                      maxWidth: { xs: '48%', sm: '48%' },
                      minWidth: { xs: '48%', sm: '48%' },
                    }}
                  >
                    <Paper
                      elevation={FLAT_ELEVATION}
                      sx={{
                        borderRadius: FLAT_RADIUS,
                        px: 2,
                        py: 2.3,
                        textAlign: "center",
                        background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)',
                        border: `1px solid ${theme.palette.grey[100]}`,
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          mb: 0.5,
                          mx: 'auto',
                          bgcolor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                          fontSize: 22,
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{service.count}</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>{service.label}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '53%' }, display: 'flex', flexDirection: "column" }}>
          <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: 0, border: `1px solid ${theme.palette.grey[200]}` }} elevation={FLAT_ELEVATION}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Recent Activities</Typography>
                <Button size="small" color="primary" onClick={() => navigate('/admin/activities')} sx={{ fontWeight: 600 }}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense disablePadding>
                {recentActivities.slice(0, 5).map((activity, idx) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      px: 0.5,
                      py: 1.1,
                      borderBottom: idx === recentActivities.length - 1
                        ? "none"
                        : `1px solid ${theme.palette.grey[100]}`,
                      '&:last-child': { borderBottom: "none" }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor:
                            activity.type === 'user'
                              ? theme.palette.primary.main
                              : activity.type === 'application'
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                          color: "#fff"
                        }}
                      >
                        {activity.type === 'user'
                          ? <PeopleIcon fontSize="small" />
                          : activity.type === 'application'
                            ? <AssignmentIcon fontSize="small" />
                            : <MoneyIcon fontSize="small" />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
                          {activity.description}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {activity.user || 'System'} &bull; {activity.timestamp}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {recentActivities.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="body2" color="text.secondary">No activity log found.</Typography>}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Analytics Section */}
      <Card sx={{
        borderRadius: FLAT_RADIUS,
        boxShadow: 0,
        border: `1px solid ${theme.palette.grey[200]}`,
        mt: 3
      }} elevation={FLAT_ELEVATION}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Analytics Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              height: 310,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(110deg, #f8fafb 0%, #f1f7fa 100%)',
              borderRadius: FLAT_RADIUS
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData}
                margin={{ top: 28, right: 24, left: 10, bottom: 2 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'light' ? '#e6eaea' : '#374151'} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 13 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  style={{ fontSize: 13 }}
                  tickFormatter={tick => tick < 1000 ? tick : `${tick / 1000}k`}
                />
                <RechartTooltip
                  contentStyle={{
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.grey[200]}`,
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="Users"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 5, fill: theme.palette.primary.main, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Users"
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  dot={{ r: 5, fill: theme.palette.success.main, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="Applications"
                  stroke={theme.palette.warning.main}
                  strokeWidth={3}
                  dot={{ r: 5, fill: theme.palette.warning.main, stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
