import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  level: 'info' | 'warning' | 'error' | 'success';
  ipAddress: string;
  details: string;
}

export const SecurityLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-03-20 10:30:45',
      user: 'admin@example.com',
      action: 'User Login',
      level: 'success',
      ipAddress: '192.168.1.1',
      details: 'Successful login from Chrome browser',
    },
    {
      id: '2',
      timestamp: '2024-03-20 09:15:22',
      user: 'user@example.com',
      action: 'Failed Login Attempt',
      level: 'warning',
      ipAddress: '192.168.1.2',
      details: 'Invalid password attempt',
    },
    {
      id: '3',
      timestamp: '2024-03-19 14:20:10',
      user: 'admin@example.com',
      action: 'Permission Changed',
      level: 'info',
      ipAddress: '192.168.1.1',
      details: 'User role updated from Agent to Admin',
    },
    {
      id: '4',
      timestamp: '2024-03-19 11:05:33',
      user: 'system',
      action: 'System Error',
      level: 'error',
      ipAddress: 'N/A',
      details: 'Database connection timeout',
    },
  ]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      default:
        return <SecurityIcon fontSize="small" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >  {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Security & Audit Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor system security events and user activities
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export Logs
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Log Level</InputLabel>
              <Select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} label="Log Level">
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">{log.timestamp}</Typography>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getLevelIcon(log.level)}
                        label={log.level}
                        color={getLevelColor(log.level) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.details}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecurityLogs;

