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
  AssignmentInd as AssignmentIndIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const [tabValue, setTabValue] = useState(getInitialTab());

  // Update tab when route changes
  useEffect(() => {
    setTabValue(getInitialTab());
  }, [userType]);

  // Mock data
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Customer',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-03-20',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Agent',
      status: 'active',
      joinDate: '2024-02-01',
      lastLogin: '2024-03-19',
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-03-20',
    },
    // add more users here as needed
  ]);

  // Count calculations
  const allUsersCount = users.length;
  const customerCount = users.filter(u => u.role.toLowerCase() === 'customer').length;
  const agentCount = users.filter(u => u.role.toLowerCase() === 'agent').length;
  const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length;
  const staffCount = agentCount + adminCount;

  const tabFilters = [
    { label: "All Users", predicate: () => true, route: 'all' },
    { label: "Customers", predicate: (u: User) => u.role.toLowerCase() === "customer", route: 'customers' },
    { label: "Staff", predicate: (u: User) => ["agent", "admin"].includes(u.role.toLowerCase()), route: 'staff' },
    { label: "Admins", predicate: (u: User) => u.role.toLowerCase() === "admin", route: 'admins' }
  ];

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
    // Handle delete logic
    handleMenuClose();
  };

  const handleBlock = () => {
    // Handle block logic
    handleMenuClose();
  };

  // Current filter by tab
  const currentPredicate = tabFilters[tabValue].predicate;

  // Filtered users
  const filteredUsers = users.filter(
    (user) =>
      currentPredicate(user) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'agent':
        return 'warning';
      case 'customer':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Count Boxes - show only relevant stats based on route
  const countBoxes = useMemo(() => {
    const allBoxes = [
      {
        label: 'All Users',
        value: allUsersCount,
        icon: <PeopleIcon />,
        color: theme.palette.primary.main,
        tooltip: 'Total number of users'
      },
      {
        label: 'Customers',
        value: customerCount,
        icon: <AccountCircleIcon />,
        color: theme.palette.info.main,
        tooltip: 'Total customers'
      },
      {
        label: 'Staff',
        value: staffCount,
        icon: <SupervisorAccountIcon />,
        color: theme.palette.secondary.main,
        tooltip: 'Total staff (Admins + Agents)'
      },
      {
        label: 'Admins',
        value: adminCount,
        icon: <AssignmentIndIcon />,
        color: theme.palette.error.main,
        tooltip: 'Total admin users'
      }
    ];

    // Show only relevant count boxes based on route
    if (userType === 'customers') {
      return [allBoxes[1]]; // Only customers
    } else if (userType === 'staff') {
      return [allBoxes[2]]; // Only staff
    } else if (userType === 'admins') {
      return [allBoxes[3]]; // Only admins
    }
    return allBoxes; // Show all on "all users" page
  }, [userType, allUsersCount, customerCount, staffCount, adminCount, theme]);

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >    {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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

      {/* Count Boxes */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          alignItems: "stretch"
        }}
      >
        {countBoxes.map((box) => (
          <Box
            key={box.label}
            sx={{
              minWidth: {
                xs: '100%',
                sm: '200px',
                md: '170px',
                lg: '160px'
              },
              display: "flex"
            }}
          >
            <Tooltip title={box.tooltip || box.label} placement="top" arrow TransitionComponent={Fade}>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  px: 1.5,
                  pb: 1.5,
                  background: "linear-gradient(100deg, rgba(245,247,252,0.98) 0%, #fff 60%)",
                  border: `1px solid ${theme.palette.grey[200]}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  boxShadow: 0,
                  '&:hover': { boxShadow: 4, transform: "translateY(-2px)" }
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 2, pb: "14px !important" }}>
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
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{box.value}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{box.label}</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* Tabs - Only show on "all users" page */}
      {showTabs && (
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          {tabFilters.map((tab) => <Tab key={tab.label} label={tab.label} />)}
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.status} color={getStatusColor(user.status)} size="small" />
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
          {selectedUser?.status === 'active' ? 'Suspend' : 'Activate'}
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
