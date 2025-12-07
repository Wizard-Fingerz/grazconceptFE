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
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  SupportAgent as SupportIcon,
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  last_reply: string;
  messages_count: number;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

export const SupportTicketsManagement: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [tickets] = useState<SupportTicket[]>([
    {
      id: '1',
      user: 'John Doe',
      subject: 'Payment issue with my booking',
      status: 'open',
      priority: 'high',
      created_at: '2024-01-20',
      last_reply: '2024-01-21',
      messages_count: 3,
    },
    {
      id: '2',
      user: 'Jane Smith',
      subject: 'Question about visa requirements',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2024-01-19',
      last_reply: '2024-01-20',
      messages_count: 5,
    },
  ]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = !search ||
        ticket.user.toLowerCase().includes(search.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !filterStatus || ticket.status === filterStatus;
      const matchesPriority = !filterPriority || ticket.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, filterStatus, filterPriority]);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    open: 'error',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default',
  };

  const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'error',
  };

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    { field: 'user', headerName: 'User', flex: 1.2 },
    { field: 'subject', headerName: 'Subject', flex: 2 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.status.replace('_', ' ')}
          color={statusColors[params.row.status] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.row.priority}
          color={priorityColors[params.row.priority] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'messages_count',
      headerName: 'Messages',
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={params.row.messages_count} size="small" variant="outlined" />
      ),
    },
    { field: 'created_at', headerName: 'Created', flex: 1 },
    { field: 'last_reply', headerName: 'Last Reply', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setSelectedTicket(params.row);
              setViewDialogOpen(true);
            }}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <ReplyIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], []);

  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: <SupportIcon />, color: theme.palette.primary.main },
    { label: 'Open', value: tickets.filter((t) => t.status === 'open').length, icon: <SupportIcon />, color: theme.palette.error.main },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length, icon: <SupportIcon />, color: theme.palette.warning.main },
    { label: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length, icon: <SupportIcon />, color: theme.palette.success.main },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Support Tickets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer support tickets and inquiries
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
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

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </TextField>
            <TextField
              select
              size="small"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={filteredTickets}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            isLoading={false} rowCount={filteredTickets.length} />
        </CardContent>
      </Card>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Ticket #{selectedTicket?.id}</Typography>
            <IconButton size="small" onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">User</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedTicket.user}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Subject</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedTicket.subject}</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedTicket.status.replace('_', ' ')}
                    color={statusColors[selectedTicket.status] || 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip
                    label={selectedTicket.priority}
                    color={priorityColors[selectedTicket.priority] || 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Stack>
              <Divider />
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Messages ({selectedTicket.messages_count})</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Message content will be loaded here...
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ReplyIcon />}>
            Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTicketsManagement;

