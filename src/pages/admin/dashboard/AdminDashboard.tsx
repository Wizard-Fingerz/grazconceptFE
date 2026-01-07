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
  BarChart,
} from 'recharts';

import authService from '../../../services/authService';

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

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [serviceStats, setServiceStats] = useState<{ label: string; count: number; icon: React.ReactNode }[]>([]);
  const [statusInfo, setStatusInfo] = useState<any[]>([]);

  // Fetch analytics data from API
  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        const response = await authService.getAdminDashboardAnalytics();
        if (isMounted && response) {
          // Key Metrics
          setMetrics([
            {
              label: 'Total Users',
              value: response.metrics?.users_total ?? 0,
              icon: <PeopleIcon />,
              color: theme.palette.primary.main,
              tooltip: 'Total registered users'
            },
            {
              label: 'Total Revenue',
              value: typeof response.metrics?.revenue_total === 'number'
                ? `₦${(+response.metrics.revenue_total).toLocaleString()}`
                : '₦0',
              icon: <MoneyIcon />,
              color: theme.palette.success.main,
              tooltip: 'Total revenue generated'
            },
            {
              label: 'Active Applications',
              value: response.metrics?.applications_active ?? 0,
              icon: <AssignmentIcon />,
              color: theme.palette.warning.main,
              tooltip: 'Active/ongoing applications'
            },
            {
              label: 'Pending Approvals',
              value: response.metrics?.approvals_pending ?? 0,
              icon: <ScheduleIcon />,
              color: theme.palette.error.main,
              tooltip: 'Pending approvals for admin review'
            },
            {
              label: 'Staff Count',
              value: response.metrics?.staff_count ?? 0,
              icon: <AdminIcon />,
              color: theme.palette.secondary.main,
              tooltip: 'Staff accounts'
            },
            {
              label: 'System Health',
              value: response.metrics?.health_percent
                ? `${response.metrics.health_percent}%`
                : '99%',
              icon: <CheckCircleIcon />,
              color: theme.palette.success.light,
              tooltip: 'System uptime'
            },
            {
              label: 'Total Investments',
              value: response.metrics?.investment_total ?? 0,
              icon: <BarChartIcon />,
              color: theme.palette.info.main,
              tooltip: 'Total number of investments'
            },
            {
              label: 'Amount Invested',
              value: typeof response.metrics?.amount_invested === 'number'
                ? `₦${(+response.metrics.amount_invested).toLocaleString()}`
                : '₦0',
              icon: <AccountBalanceWalletIcon />,
              color: theme.palette.primary.light,
              tooltip: 'Total amount invested'
            },
            {
              label: 'Investment ROI',
              value: typeof response.metrics?.roi_total === 'number'
                ? `₦${(+response.metrics.roi_total).toLocaleString()}`
                : '₦0',
              icon: <CheckCircleIcon />,
              color: theme.palette.success.dark,
              tooltip: 'Total investment return'
            },
            {
              label: 'Total Investors',
              value: response.metrics?.investor_total ?? 0,
              icon: <PeopleIcon />,
              color: theme.palette.info.dark,
              tooltip: 'Total number of investors'
            },
            {
              label: 'Total Loans',
              value: response.metrics?.loans_total ?? 0,
              icon: <MoneyIcon />,
              color: theme.palette.secondary.light,
              tooltip: 'Loans created'
            },
            {
              label: 'Active Loans',
              value: response.metrics?.loans_active ?? 0,
              icon: <MoneyIcon />,
              color: theme.palette.warning.dark,
              tooltip: 'Active loans'
            },
            {
              label: 'Loan Amount',
              value: typeof response.metrics?.loan_amount_total === 'number'
                ? `₦${(+response.metrics.loan_amount_total).toLocaleString()}`
                : '₦0',
              icon: <MoneyIcon />,
              color: theme.palette.error.light,
              tooltip: 'Total loan amount'
            },
          ]);

          // Analytics chart data
          setAnalyticsData(Array.isArray(response.analytics_data) ? response.analytics_data : []);

          // Recent Activities
          setRecentActivities(
            Array.isArray(response.recent_activities)
              ? response.recent_activities.map((item: any, idx: number) => ({
                  id: item.id ?? String(idx),
                  type: item.type,
                  description: item.description,
                  timestamp: item.timestamp,
                  user: item.user,
                }))
              : []
          );

          // Service Stats
          // Icons mapping for each type
          setServiceStats([
            {
              label: 'Study Visa',
              count: response.service_stats?.study_visa ?? 0,
              icon: <SchoolIcon />
            },
            {
              label: 'Work Visa',
              count: response.service_stats?.work_visa ?? 0,
              icon: <FlightIcon />
            },
            {
              label: 'Travel',
              count: response.service_stats?.travel ?? 0,
              icon: <FlightIcon />
            },
            {
              label: 'Loans',
              count: response.service_stats?.loans ?? 0,
              icon: <MoneyIcon />
            },
            {
              label: 'Investments',
              count: response.service_stats?.investments ?? 0,
              icon: <AccountBalanceWalletIcon />
            }
          ]);

          // Status Info
          setStatusInfo(Array.isArray(response.status_info) ? response.status_info : []);
        }
      } catch (e) {
        // fallback to empty
      } finally {
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 800);
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
    // Only remount theme.palette on color mode change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.palette]);

  // For icon references not imported above:
  // Add the missing icons - BarChartIcon and AccountBalanceWalletIcon
  // Typescript: import as alias since MUI provides as BarChart, AccountBalanceWallet
  function BarChartIcon(props: any) { return <BarChart {...props} />; }
  function AccountBalanceWalletIcon(props: any) { return <WalletIcon {...props} />; }

  const quickActions = [
    { label: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users', color: theme.palette.primary.main },
    { label: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings', color: theme.palette.grey[800] },
    { label: 'Analytics', icon: <ChartIcon />, path: '/admin/analytics', color: theme.palette.success.main },
    { label: 'Content', icon: <ContentIcon />, path: '/admin/content', color: theme.palette.warning.main },
    { label: 'Finances', icon: <WalletIcon />, path: '/admin/financial', color: theme.palette.secondary.main },
    { label: 'Security Logs', icon: <SecurityIcon />, path: '/admin/security', color: theme.palette.error.main },
  ];

  // Default border radius and elevation for all Card/Paper
  const FLAT_RADIUS = 1;
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
                    {/* Removed trend/change since not present in new API */}
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
                        boxShadow: "0 0.5px 2px -2px #e3e6ee",
                        transition: "all 0.18s",
                        '&:hover': {
                          background: theme.palette.grey[50],
                          boxShadow: "0 2px 10px -4px #d3d8e3",
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
                                : activity.type === 'payment'
                                  ? theme.palette.success.main
                                  : activity.type === 'flight'
                                    ? theme.palette.info.light
                                    : activity.type === 'support_ticket'
                                      ? theme.palette.secondary.main
                                      : activity.type === 'support_ticket_message'
                                        ? theme.palette.info.dark
                                        : theme.palette.grey[400],
                          color: "#fff"
                        }}
                      >
                        {activity.type === 'user' ? <PeopleIcon fontSize="small" />
                          : activity.type === 'application' ? <AssignmentIcon fontSize="small" />
                          : activity.type === 'payment' ? <MoneyIcon fontSize="small" />
                          : activity.type === 'flight' ? <FlightIcon fontSize="small" />
                          : activity.type === 'support_ticket' ? <WarningIcon fontSize="small" />
                          : activity.type === 'support_ticket_message' ? <CheckCircleIcon fontSize="small" />
                          : <PeopleIcon fontSize="small" />}
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
