import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Paper,
  Avatar,
  Divider,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface Permission {
  id: string;
  name: string;
  codename: string;
  category: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  user_count: number;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user: string;
  user_email: string;
  role: string;
  assigned_at: string;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

// Mock permissions grouped by category
const PERMISSION_CATEGORIES = [
  {
    category: 'User Management',
    permissions: [
      { id: '1', name: 'View Users', codename: 'view_user', description: 'Can view user list and details' },
      { id: '2', name: 'Add Users', codename: 'add_user', description: 'Can create new users' },
      { id: '3', name: 'Edit Users', codename: 'change_user', description: 'Can modify user information' },
      { id: '4', name: 'Delete Users', codename: 'delete_user', description: 'Can remove users' },
      { id: '5', name: 'Manage Roles', codename: 'manage_roles', description: 'Can assign and modify roles' },
    ],
  },
  {
    category: 'Content Management',
    permissions: [
      { id: '6', name: 'View Content', codename: 'view_content', description: 'Can view all content' },
      { id: '7', name: 'Add Content', codename: 'add_content', description: 'Can create new content' },
      { id: '8', name: 'Edit Content', codename: 'change_content', description: 'Can modify content' },
      { id: '9', name: 'Delete Content', codename: 'delete_content', description: 'Can remove content' },
      { id: '10', name: 'Publish Content', codename: 'publish_content', description: 'Can publish content' },
    ],
  },
  {
    category: 'Financial Management',
    permissions: [
      { id: '11', name: 'View Transactions', codename: 'view_transaction', description: 'Can view financial transactions' },
      { id: '12', name: 'Process Payments', codename: 'process_payment', description: 'Can process payments' },
      { id: '13', name: 'View Reports', codename: 'view_report', description: 'Can view financial reports' },
      { id: '14', name: 'Export Data', codename: 'export_data', description: 'Can export financial data' },
    ],
  },
  {
    category: 'Application Management',
    permissions: [
      { id: '15', name: 'View Applications', codename: 'view_application', description: 'Can view all applications' },
      { id: '16', name: 'Process Applications', codename: 'process_application', description: 'Can process applications' },
      { id: '17', name: 'Approve Applications', codename: 'approve_application', description: 'Can approve applications' },
      { id: '18', name: 'Reject Applications', codename: 'reject_application', description: 'Can reject applications' },
    ],
  },
  {
    category: 'Service Management',
    permissions: [
      { id: '19', name: 'View Services', codename: 'view_service', description: 'Can view all services' },
      { id: '20', name: 'Add Services', codename: 'add_service', description: 'Can create new services' },
      { id: '21', name: 'Edit Services', codename: 'change_service', description: 'Can modify services' },
      { id: '22', name: 'Delete Services', codename: 'delete_service', description: 'Can remove services' },
    ],
  },
  {
    category: 'System Administration',
    permissions: [
      { id: '23', name: 'View System Settings', codename: 'view_settings', description: 'Can view system settings' },
      { id: '24', name: 'Modify System Settings', codename: 'change_settings', description: 'Can modify system settings' },
      { id: '25', name: 'View Logs', codename: 'view_logs', description: 'Can view system logs' },
      { id: '26', name: 'Manage Permissions', codename: 'manage_permissions', description: 'Can manage roles and permissions' },
    ],
  },
];

export const RolesPermissions: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false);
  const [viewRoleUsers, setViewRoleUsers] = useState<UserRole[]>([]);

  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: PERMISSION_CATEGORIES.flatMap((cat) => cat.permissions.map((p) => p.id)),
      user_count: 2,
      is_system_role: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Administrative access to most features',
      permissions: ['1', '2', '3', '6', '7', '8', '11', '15', '16', '19', '20', '21'],
      user_count: 5,
      is_system_role: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-10',
    },
    {
      id: '3',
      name: 'Staff',
      description: 'Staff member with limited administrative access',
      permissions: ['1', '6', '11', '15', '19'],
      user_count: 15,
      is_system_role: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-05',
    },
    {
      id: '4',
      name: 'Agent',
      description: 'Agent with application processing capabilities',
      permissions: ['1', '15', '16', '19'],
      user_count: 25,
      is_system_role: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-08',
    },
  ]);

  const [userRoles] = useState<UserRole[]>([
    { id: '1', user: 'John Doe', user_email: 'john@example.com', role: 'Super Admin', assigned_at: '2024-01-01' },
    { id: '2', user: 'Jane Smith', user_email: 'jane@example.com', role: 'Admin', assigned_at: '2024-01-02' },
    { id: '3', user: 'Bob Johnson', user_email: 'bob@example.com', role: 'Staff', assigned_at: '2024-01-03' },
  ]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = !search ||
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [roles, search]);

  const roleColumns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Role Name',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
            <SecurityIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.name}
            </Typography>
            {params.row.is_system_role && (
              <Chip label="System" size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }} />
            )}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 1,
      renderCell: (params) => (
        <Chip label={`${params.row.permissions.length} permissions`} size="small" variant="outlined" />
      ),
    },
    {
      field: 'user_count',
      headerName: 'Users',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.user_count}
          size="small"
          color="info"
          icon={<GroupIcon />}
        />
      ),
    },
    { field: 'updated_at', headerName: 'Last Updated', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setSelectedRole(params.row);
              setSelectedRolePermissions([...params.row.permissions]);
              setPermissionDialogOpen(true);
            }}
            title="Manage Permissions"
          >
            <SecurityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => {
              const roleUsers = userRoles.filter((ur) => ur.role === params.row.name);
              setViewRoleUsers(roleUsers);
              setViewUsersDialogOpen(true);
            }}
            title="View Users"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          {!params.row.is_system_role && (
            <>
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setSelectedRole(params.row);
                  setRoleDialogOpen(true);
                }}
                title="Edit Role"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" title="Delete Role">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Stack>
      ),
    },
  ], [theme, userRoles]);

  const stats = [
    { label: 'Total Roles', value: roles.length, icon: <SecurityIcon />, color: theme.palette.primary.main },
    { label: 'System Roles', value: roles.filter((r) => r.is_system_role).length, icon: <SecurityIcon />, color: theme.palette.info.main },
    { label: 'Custom Roles', value: roles.filter((r) => !r.is_system_role).length, icon: <SecurityIcon />, color: theme.palette.success.main },
    { label: 'Total Permissions', value: PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0), icon: <CheckCircleIcon />, color: theme.palette.warning.main },
  ];

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedRolePermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleCategoryToggle = (categoryPermissions: Permission[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => selectedRolePermissions.includes(id));

    if (allSelected) {
      // Deselect all in category
      setSelectedRolePermissions((prev) => prev.filter((id) => !categoryIds.includes(id)));
    } else {
      // Select all in category
      setSelectedRolePermissions((prev) => {
        const newPerms = [...prev];
        categoryIds.forEach((id) => {
          if (!newPerms.includes(id)) {
            newPerms.push(id);
          }
        });
        return newPerms;
      });
    }
  };

  return (
    <Box
    sx={{
      px: { xs: 1, sm: 2, md: 4 },
      py: { xs: 1, sm: 2 },
      width: '100%',
      maxWidth: 1600,
      mx: 'auto',
    }}
  >  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Roles & Permissions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user roles and their permissions across the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedRole(null);
            setSelectedRolePermissions([]);
            setRoleDialogOpen(true);
          }}
        >
          Create Role
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            elevation={FLAT_ELEVATION}
            sx={{
              flex: '1 1 200px',
              minWidth: 178,
              maxWidth: { xs: '100%', sm: 230, md: 275 },
              borderRadius: FLAT_RADIUS,
              px: 2.4,
              py: 2.6,
              boxShadow: 0,
              border: `1px solid ${theme.palette.grey[100]}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)',
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                mb: 1.4,
                bgcolor: stat.color,
                color: '#fff',
                fontSize: 24,
                boxShadow: '0 1px 8px 0 rgba(0,0,0,0.02)',
              }}
              variant="rounded"
            >
              {stat.icon}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={filteredRoles}
            columns={roleColumns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            isLoading={false} rowCount={0} />
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Role Name"
              defaultValue={selectedRole?.name}
              placeholder="e.g., Content Manager"
            />
            <TextField
              fullWidth
              label="Description"
              defaultValue={selectedRole?.description}
              multiline
              rows={3}
              placeholder="Describe the role's purpose and responsibilities"
            />
            {selectedRole?.is_system_role && (
              <Alert severity="info">
                This is a system role and cannot be deleted. Some permissions may be restricted.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setRoleDialogOpen(false)}>
            {selectedRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <SecurityIcon />
            <Box>
              <Typography variant="h6">Manage Permissions</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRole?.name}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, maxHeight: 500, overflowY: 'auto' }}>
            {PERMISSION_CATEGORIES.map((category) => {
              const categoryPermissions = category.permissions;
              const allSelected = categoryPermissions.every((p) => selectedRolePermissions.includes(p.id));
              const someSelected = categoryPermissions.some((p) => selectedRolePermissions.includes(p.id));

              return (
                <Card key={category.category} sx={{ mb: 2, borderRadius: FLAT_RADIUS }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.category}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected && !allSelected}
                            onChange={() =>
                              handleCategoryToggle(
                                categoryPermissions as Permission[]
                              )
                            }
                          />
                        }
                        label={allSelected ? 'All Selected' : someSelected ? 'Some Selected' : 'Select All'}
                      />
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {categoryPermissions.map((permission) => (
                        <ListItem key={permission.id} sx={{ px: 0 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedRolePermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {permission.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {permission.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: FLAT_RADIUS }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Selected:</strong> {selectedRolePermissions.length} of{' '}
              {PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0)} permissions
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Save permissions logic here
              setPermissionDialogOpen(false);
            }}
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={viewUsersDialogOpen} onClose={() => setViewUsersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <GroupIcon />
            <Typography variant="h6">Users with this Role</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {viewRoleUsers.length > 0 ? (
            <List>
              {viewRoleUsers.map((userRole) => (
                <ListItem key={userRole.id}>
                  <ListItemText
                    primary={userRole.user}
                    secondary={userRole.user_email}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={userRole.assigned_at} size="small" variant="outlined" />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No users assigned to this role
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUsersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPermissions;

