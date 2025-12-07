import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

interface Transaction {
  id: string;
  user: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export const FinancialManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Demo/mock data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      user: 'John Doe',
      type: 'deposit',
      amount: 50000,
      currency: 'NGN',
      status: 'completed',
      date: '2024-03-20',
    },
    {
      id: '2',
      user: 'Jane Smith',
      type: 'payment',
      amount: 15000,
      currency: 'NGN',
      status: 'completed',
      date: '2024-03-19',
    },
    {
      id: '3',
      user: 'Mike Johnson',
      type: 'withdrawal',
      amount: 25000,
      currency: 'NGN',
      status: 'pending',
      date: '2024-03-18',
    },
  ]);

  const financialStats = [
    { label: 'Total Revenue', value: '₦2,450,000', icon: <TrendingUpIcon />, color: theme.palette.success.main },
    { label: 'Total Deposits', value: '₦1,800,000', icon: <WalletIcon />, color: theme.palette.primary.main },
    { label: 'Total Withdrawals', value: '₦350,000', icon: <PaymentIcon />, color: theme.palette.warning.main },
    { label: 'Pending Transactions', value: '₦125,000', icon: <ReceiptIcon />, color: theme.palette.error.main },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'error';
      case 'payment':
        return 'primary';
      case 'refund':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Card layout variables (match AdminDashboard style)
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
      <Box sx={{
        mb: 3,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 1
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Financial Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.25, fontSize: '1rem' }}>
            Monitor and manage all financial transactions
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{
          mt: isMobile ? 1.5 : 0,
          borderRadius: FLAT_RADIUS,
          fontWeight: 600
        }}>
          Export Report
        </Button>
      </Box>

      {/* Financial Stats - Dashboard style cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2.5,
          mb: 4
        }}
      >
        {financialStats.map((stat, _idx) => (
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
              background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)'
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                mb: 1.4,
                bgcolor: stat.color,
                color: "#fff",
                fontSize: 24,
                boxShadow: "0 1px 8px 0 rgba(0,0,0,0.02)"
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

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 8 } }}
      >
        <Tab label="All Transactions" sx={{ fontWeight: 700, fontSize: '1rem' }} />
        <Tab label="Deposits" sx={{ fontWeight: 700, fontSize: '1rem' }} />
        <Tab label="Withdrawals" sx={{ fontWeight: 700, fontSize: '1rem' }} />
        <Tab label="Payments" sx={{ fontWeight: 700, fontSize: '1rem' }} />
      </Tabs>

      {/* Search and Filters, match dashboard style */}
      <Card sx={{
        mb: 3,
        borderRadius: FLAT_RADIUS,
        boxShadow: 0,
        border: `1px solid ${theme.palette.grey[200]}`
      }} elevation={FLAT_ELEVATION}>
        <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center"
          }}>
            <Box sx={{ flex: 2, minWidth: 220 }}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "#fff", borderRadius: FLAT_RADIUS }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 160 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 160 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type" defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="refund">Refund</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card sx={{
        borderRadius: FLAT_RADIUS,
        boxShadow: 0,
        border: `1px solid ${theme.palette.grey[200]}`
      }} elevation={FLAT_ELEVATION}>
        <CardContent sx={{ p: isMobile ? 1.4 : 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={getTypeColor(transaction.type)}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell align="right">
                      <Button size="small" sx={{ fontWeight: 600 }}>View Details</Button>
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

export default FinancialManagement;
