import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Stack,
  useTheme,
  Fade,
  Tooltip,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  AccountCircle as AccountCircleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AssignmentInd as AssignmentIndIcon,
  GroupWork as GroupWorkIcon,
  Wc as WcIcon,
  Flag as FlagIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import api from '../../../services/api';

// User and analytics interfaces (updated for API response)
interface User {
  id: number;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name: string;
  email: string;
  user_type: number;
  user_type_name: string;
  role: number | null;
  role_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_deleted: boolean;
  created_date: string;
  last_login: string | null;
  profile_picture_url?: string | null;
  gender_name?: string | null;
  country_of_residence?: { code: string; name: string } | string | null;
  nationality?: { code: string; name: string } | string | null;
  [key: string]: any;
}
interface UserAnalytics {
  all_users: number;
  customers: number;
  staff: number;
  admins: number;
  role_breakdown: { role: string; count: number }[];
  user_type_breakdown: { user_type: string; count: number }[];
  gender_breakdown: { gender: string; count: number }[];
  country_breakdown: { country: string; count: number }[];
  age_distribution: { range: string; count: number }[];
  // For backward compatibility with old UI:
  totalUsers?: number;
  customerCount?: number;
  agentCount?: number;
  adminCount?: number;
}

type UserListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  num_pages: number;
  page_size: number;
  current_page: number;
  results: User[];
};

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Pagination state (from API)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    num_pages: 1,
    page_size: 15,
    current_page: 1
  });

  // New analytics state
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Determine user type from route
  const userType = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/users/customers')) return 'customers';
    if (path.includes('/users/staff')) return 'staff';
    if (path.includes('/users/admins')) return 'admins';
    return 'all';
  }, [location.pathname]);

  // Set initial tab based on route
  const getInitialTab = () => {
    switch (userType) {
      case 'customers': return 1;
      case 'staff': return 2;
      case 'admins': return 3;
      default: return 0;
    }
  };

  // State for tab
  const [tabValue, setTabValue] = useState(getInitialTab());

  // Pagination page state
  const [page, setPage] = useState(1);

  // Keep tab in sync with route, reset page to 1 on change
  useEffect(() => {
    setTabValue(getInitialTab());
    setPage(1);
  }, [userType]);

  // Tab click updates route
  const tabFilters = [
    { label: "All Users", predicate: () => true, route: '/admin/users' },
    { label: "Customers", predicate: (u: User) => (u.user_type_name || '').toLowerCase() === "customer", route: '/admin/users/customers' },
    { label: "Staff", predicate: (u: User) => ["agent", "admin"].includes((u.user_type_name || '').toLowerCase()), route: '/admin/users/staff' },
    { label: "Admins", predicate: (u: User) => (u.user_type_name || '').toLowerCase() === "admin", route: '/admin/users/admins' },
  ];

  const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    navigate(tabFilters[newValue].route);
  };

  // Fetch user analytics (new real API)
  useEffect(() => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    (async () => {
      try {
        const stats = await authService.getAdminUserAnalytics();
        setAnalytics(stats);
      } catch {
        setAnalyticsError('Failed to load user statistics');
      } finally {
        setAnalyticsLoading(false);
      }
    })();
  }, [location.pathname]);

  // --- Updated API fetch for users with Pagination ---
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError(null);
      try {
        let apiParams: any = { page };
        let endpoint = '/users/';

        // Map userType to API filter
        if (userType === 'customers') {
          apiParams.user_type = 3; // or get from analytics breakdown
        } else if (userType === 'admins') {
          apiParams.user_type = 1; // adjust based on backend
        } else if (userType === 'staff') {
          // API may need adjustment; fallback to client filter if needed below.
        }

        let response;
        if (userType === 'staff') {
          response = await api.get(endpoint, { params: { page } }); // get all, filter client
        } else {
          response = await api.get(endpoint, { params: apiParams });
        }

        const data: UserListResponse = response.data;
        let allUsers: User[] = data.results || [];

        // For staff, filter agents or admins client-side (user_type_name == "Agent" || "Admin")
        let filtered: User[] = [];
        switch (userType) {
          case 'customers':
            filtered = allUsers;
            break;
          case 'staff':
            filtered = allUsers.filter(
              u => ["agent", "admin"].includes((u.user_type_name || '').toLowerCase())
            );
            break;
          case 'admins':
            filtered = allUsers;
            break;
          default:
            filtered = allUsers;
        }

        setUsers(filtered);

        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          num_pages: data.num_pages,
          page_size: data.page_size,
          current_page: data.current_page
        });
      } catch (error: any) {
        setUsersError('Failed to load user list');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [userType, location.pathname, page]);
  // --- End users fetch ---

  // Get page title and description based on route
  const pageInfo = useMemo(() => {
    switch (userType) {
      case 'customers':
        return {
          title: 'Customer Management',
          description: 'Manage customer accounts and information',
        };
      case 'staff':
        return {
          title: 'Staff Management',
          description: 'Manage staff members and agents',
        };
      case 'admins':
        return {
          title: 'Admin Management',
          description: 'Manage administrator accounts',
        };
      default:
        return {
          title: 'User Management',
          description: 'Manage all users, roles, and permissions',
        };
    }
  }, [userType]);

  // Show tabs only on "all users" page
  const showTabs = userType === 'all';

  // Table filtering (updated for full_name, email)
  const currentPredicate = tabFilters[getInitialTab()].predicate;
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const fullname = (user.full_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const matchesSearch =
          fullname.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase());
        return currentPredicate(user) && matchesSearch;
      }),
    [users, currentPredicate, searchTerm]
  );

  // Status/Role visual color map
  const getStatusColor = (u: User) => {
    if (u.is_deleted) return 'warning';
    if (u.is_active) return 'success';
    return 'default';
  };
  const getRoleColor = (u: User) => {
    const type = (u.user_type_name || '').toLowerCase();
    switch (type) {
      case 'admin': return 'error';
      case 'agent': return 'warning';
      case 'customer': return 'primary';
      default: return 'default';
    }
  };

  // Map role value to display string
  const displayRoleName = (u: User) => u.user_type_name || "Unknown";

  // Map is_active/is_deleted to label
  const displayStatus = (u: User) => {
    if (u.is_deleted) return 'Deleted';
    return u.is_active ? 'Active' : 'Inactive';
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Format last login
  const formatLastLogin = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      // Could show time ago, but for now show timestamp
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // PRIMARY COUNT BOXES (updated structure for new analytics)
  const countBoxes = useMemo(() => {
    if (analyticsLoading || !analytics) {
      // Loading skeletons
      return [
        {
          label: 'All Users',
          value: <Skeleton width={36} />,
          icon: <PeopleIcon />,
          color: theme.palette.primary.main,
          tooltip: 'Total number of users',
        },
        {
          label: 'Customers',
          value: <Skeleton width={36} />,
          icon: <AccountCircleIcon />,
          color: theme.palette.info.main,
          tooltip: 'Total customers',
        },
        {
          label: 'Staff',
          value: <Skeleton width={36} />,
          icon: <SupervisorAccountIcon />,
          color: theme.palette.secondary.main,
          tooltip: 'Total staff (Admins + Agents)',
        },
        {
          label: 'Admins',
          value: <Skeleton width={36} />,
          icon: <AssignmentIndIcon />,
          color: theme.palette.error.main,
          tooltip: 'Total admin users',
        },
      ];
    }
    // From API
    const totalUsers = analytics.all_users;
    const customerCount = analytics.customers;
    const userTypeMap = analytics.user_type_breakdown.reduce((acc, cur) => {
      acc[cur.user_type.toLowerCase()] = cur.count;
      return acc;
    }, {} as Record<string, number>);
    const agentCount = userTypeMap["agent"] || 0;
    const adminCount = userTypeMap["admin"] || 0;
    const staffCount = agentCount + adminCount;

    const allBoxes = [
      {
        label: 'All Users',
        value: totalUsers,
        icon: <PeopleIcon />,
        color: theme.palette.primary.main,
        tooltip: 'Total number of users',
      },
      {
        label: 'Customers',
        value: customerCount,
        icon: <AccountCircleIcon />,
        color: theme.palette.info.main,
        tooltip: 'Total customers',
      },
      {
        label: 'Staff',
        value: staffCount,
        icon: <SupervisorAccountIcon />,
        color: theme.palette.secondary.main,
        tooltip: 'Total staff (Admins + Agents)',
      },
      {
        label: 'Admins',
        value: adminCount,
        icon: <AssignmentIndIcon />,
        color: theme.palette.error.main,
        tooltip: 'Total admin users',
      },
    ];

    if (userType === 'customers') return [allBoxes[1]];
    if (userType === 'staff') return [allBoxes[2]];
    if (userType === 'admins') return [allBoxes[3]];
    return allBoxes;
  }, [analytics, analyticsLoading, theme, userType]);

  // Breakdown widgets (by role, gender, country, age, etc.)
  const breakdownWidgets = useMemo(() => {
    if (!analytics || analyticsLoading) {
      // Placeholders
      return [
        {
          title: 'Role Breakdown',
          icon: <GroupWorkIcon />,
          color: theme.palette.primary.main,
          rows: [<Skeleton width={140} />, <Skeleton width={90} />],
        },
        {
          title: 'User Type Breakdown',
          icon: <AccountCircleIcon />,
          color: theme.palette.info.main,
          rows: [<Skeleton width={140} />, <Skeleton width={90} />],
        },
        {
          title: 'Gender Breakdown',
          icon: <WcIcon />,
          color: '#9c27b0',
          rows: [<Skeleton width={90} />, <Skeleton width={80} />],
        },
        {
          title: 'Country Breakdown',
          icon: <FlagIcon />,
          color: theme.palette.success.main,
          rows: [<Skeleton width={140} />, <Skeleton width={90} />]
        },
        {
          title: 'Age Distribution',
          icon: <BarChartIcon />,
          color: theme.palette.grey[800],
          rows: [<Skeleton width={110} />, <Skeleton width={70} />, <Skeleton width={110} />]
        }
      ];
    }

    const roleRows = analytics.role_breakdown.map(r =>
      <Box key={r.role} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {r.role}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.count}</Typography>
      </Box>
    );

    const userTypeRows = analytics.user_type_breakdown.map(u =>
      <Box key={u.user_type} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {u.user_type}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.count}</Typography>
      </Box>
    );

    const genderRows = analytics.gender_breakdown.map(g =>
      <Box key={g.gender} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {g.gender}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.count}</Typography>
      </Box>
    );

    const countryRows = analytics.country_breakdown.map(c =>
      <Box key={c.country} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {c.country}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.count}</Typography>
      </Box>
    );

    const ageRows = analytics.age_distribution.map(a =>
      <Box key={a.range} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {a.range}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.count}</Typography>
      </Box>
    );

    return [
      { title: 'Role Breakdown', icon: <GroupWorkIcon />, color: theme.palette.primary.main, rows: roleRows },
      { title: 'User Type Breakdown', icon: <AccountCircleIcon />, color: theme.palette.info.main, rows: userTypeRows },
      { title: 'Gender Breakdown', icon: <WcIcon />, color: '#9c27b0', rows: genderRows },
      { title: 'Country Breakdown', icon: <FlagIcon />, color: theme.palette.success.main, rows: countryRows },
      { title: 'Age Distribution', icon: <BarChartIcon />, color: theme.palette.grey[800], rows: ageRows }
    ];
  }, [analytics, analyticsLoading, theme.palette.primary, theme.palette.info, theme.palette.success, theme.palette.grey]);

  // Row action handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };
  const handleEdit = () => {
    setOpenDialog(true);
    handleMenuClose();
  };
  const handleDelete = () => {
    handleMenuClose();
  };
  const handleBlock = () => {
    handleMenuClose();
  };

  // Pagination navigation (simple)
  const handlePageChange = (delta: number) => {
    setPage((prev) => {
      const nextPage = prev + delta;
      if (nextPage < 1) return 1;
      if (nextPage > pagination.num_pages) return pagination.num_pages;
      return nextPage;
    });
  };

  // Helper for responsive count boxes
  const CountBoxLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
      }}
    >
      {children}
    </Box>
  );

  // Helper for responsive breakdown widget layout
  const BreakdownBoxLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mt: 1,
        width: '100%',
        // Force widgets to fit 5 per row on md+
        '& > *': {
          width: { xs: '100%', sm: '48%', md: '18%' },
          minWidth: 220,
          flex: '1 1 180px',
        },
      }}
    >
      {children}
    </Box>
  );

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
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {pageInfo.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pageInfo.description}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />}>
          Add New User
        </Button>
      </Box>

      {/* Analytics Dashboards: Counts & Breakdown */}
      {/* Counts */}
      {analyticsError ? (
        <Box sx={{ mb: 4 }}>
          <Typography color="error" sx={{ mx: 1, my: 2 }}>
            {analyticsError}
          </Typography>
        </Box>
      ) : (
        <CountBoxLayout>
          {countBoxes.map((box) => (
            <Tooltip key={box.label} title={box.tooltip || box.label} placement="top" arrow TransitionComponent={Fade}>
              <Card
                sx={{
                  flex: '1 1 220px',
                  minWidth: 220,
                  maxWidth: { xs: '100%', sm: '48%', md: '23%' },
                  borderRadius: 2,
                  px: 1.5,
                  pb: 1.5,
                  background: "linear-gradient(100deg, rgba(245,247,252,0.98) 0%, #fff 60%)",
                  border: `1px solid ${theme.palette.grey[200]}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  boxShadow: 0,
                  '&:hover': { boxShadow: 4, transform: "translateY(-2px)" },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 2, pb: "14px !important", width: '100%' }}>
                  <Stack direction="row" alignItems="center" gap={2} justifyContent="space-between" sx={{ mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: box.color,
                        color: "#fff",
                        width: 44,
                        height: 44,
                        boxShadow: 2,
                        border: '2px solid #fff'
                      }}
                    >
                      {box.icon}
                    </Avatar>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {box.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }} >
                    {box.label}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          ))}
        </CountBoxLayout>
      )}
      {/* Breakdown widgets */}
      <BreakdownBoxLayout>
        {breakdownWidgets.map((widget) =>
          <Card
            sx={{
              borderRadius: 2,
              px: 2,
              pt: 2,
              pb: 1,
              height: '100%',
              minHeight: 110,
              border: `1px solid ${theme.palette.grey[200]}`,
              background: "linear-gradient(100deg, #f4f9fd 0 80%, #fff 100%)",
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 180px'
            }}
            elevation={0}
            key={widget.title}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: widget.color, color: "#fff" }}>
                {widget.icon}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{widget.title}</Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Box>{widget.rows}</Box>
          </Card>
        )}
      </BreakdownBoxLayout>

      {/* Tabs - Only show on "all users" page */}
      {showTabs && (
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          aria-label="user-group-tabs"
        >
          {tabFilters.map((tab) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />}>
              Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton width={j === 0 ? 120 : 80} />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
                ) : usersError ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="error">{usersError}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{ width: 32, height: 32 }}
                            src={user.profile_picture_url || undefined}
                          >
                            {(user.full_name && user.full_name[0]) || (user.email && user.email[0])}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.full_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={displayRoleName(user)} color={getRoleColor(user)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={displayStatus(user)} color={getStatusColor(user)} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(user.created_date)}</TableCell>
                      <TableCell>{formatLastLogin(user.last_login)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination Controls */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Page {pagination.current_page} of {pagination.num_pages}
            </Typography>
            <Button
              disabled={pagination.current_page <= 1}
              onClick={() => handlePageChange(-1)}
            >
              Previous
            </Button>
            <Button
              disabled={pagination.current_page >= pagination.num_pages}
              onClick={() => handlePageChange(1)}
            >
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleBlock}>
          <BlockIcon sx={{ mr: 1 }} fontSize="small" />
          {(selectedUser && selectedUser.is_active) ? 'Suspend' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete User
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Typography>User edit form will be displayed here</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
