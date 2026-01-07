import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

import authService from '../../../services/authService';
import api from '../../../services/api';

// Transaction DTO based on actual API response
interface Transaction {
  id: number;
  user: string; // email string
  wallet: string; // "email's Wallet: {amount} NGN"
  transaction_type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | string;
  amount: string; // comes as string in API
  currency: string;
  description?: string | null;
  status: string;
  reference?: string;
  payment_gateway?: string | null;
  meta?: any;
  created_at: string;
  updated_at: string;
  savings_plan?: any;
}

interface WalletTransactionsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  num_pages: number;
  page_size: number;
  current_page: number;
  results: Transaction[];
}

// Dashboard analytics (unchanged)
interface AnalyticsWallets {
  total_wallets: number;
  total_balance: number;
  avg_balance: number;
  currency_breakdown: {
    currency: string;
    total: number;
    count: number;
  }[];
}

interface AnalyticsPendingTransactions {
  count: number;
  recent: any[];
}

interface AnalyticsByTypeItem {
  transaction_type: string;
  count: number;
  total: number;
}

interface AnalyticsByStatusItem {
  status: string;
  count: number;
}

interface AnalyticsTransactions {
  total_transactions: number;
  total_deposits: number;
  total_withdrawals: number;
  total_revenue: number;
  pending_transactions: AnalyticsPendingTransactions;
  by_type: AnalyticsByTypeItem[];
  by_status: AnalyticsByStatusItem[];
  recent: Transaction[];
}

interface AnalyticsAPIResponse {
  wallets: AnalyticsWallets;
  transactions: AnalyticsTransactions;
}

export const FinancialManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // For dashboard cards (Analytics)
  const [analytics, setAnalytics] = useState<AnalyticsAPIResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // For transactions table (/wallet/wallet-transactions)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Pagination state based on backend
  const [page, setPage] = useState(1);
  const [pageSize,] = useState(15); // Matches backend default
  const [totalCount, setTotalCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  // Dashboard card stats fetch (still relies on analytics)
  useEffect(() => {
    let mounted = true;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    authService
      .getAdminWalletAnalytics()
      .then((data: AnalyticsAPIResponse) => {
        if (mounted) {
          setAnalytics(data);
          setAnalyticsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setAnalyticsError('Failed to load wallet analytics');
          setAnalyticsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch table transactions from /wallet/wallet-transactions/
  useEffect(() => {
    let ignore = false;
    setTransactionsLoading(true);
    setTransactionsError(null);

    // Build query params
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.transaction_type = typeFilter;
    // Tab filtering. Manual override for tab (one-of type).
    if (tabValue === 1) params.transaction_type = 'deposit';
    if (tabValue === 2) params.transaction_type = 'withdrawal';
    if (tabValue === 3) params.transaction_type = 'payment';
    params.page = page;
    params.page_size = pageSize;

    api
      .get('/wallet/wallet-transactions/', { params })
      .then((res) => {
        if (!ignore) {
          const apiRes: WalletTransactionsApiResponse = res.data;
          setTransactions(Array.isArray(apiRes.results) ? apiRes.results : []);
          setTotalCount(apiRes.count || 0);
          setNumPages(apiRes.num_pages || 1);
          setTransactionsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setTransactionsError('Failed to load transactions');
          setTransactionsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [searchTerm, statusFilter, typeFilter, tabValue, page, pageSize]);

  // Utility: human-readable status & type, color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
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

  // Stats to show on dashboard cards
  function toCurrency(val: number | string | null | undefined, cur: string = '₦') {
    if (val === null || val === undefined) return '--';
    let num = typeof val === 'string' ? parseFloat(val) : val;
    if (typeof num !== 'number' || isNaN(num)) return '--';
    return `${cur}${num.toLocaleString()}`;
  }

  // Build the stats array based on fetched analytics
  const financialStats =
    analytics
      ? [
          {
            label: 'Total Revenue',
            value: toCurrency(analytics.transactions.total_revenue, '₦'),
            icon: <TrendingUpIcon />,
            color: theme.palette.success.main,
          },
          {
            label: 'Total Deposits',
            value: toCurrency(analytics.transactions.total_deposits, '₦'),
            icon: <WalletIcon />,
            color: theme.palette.primary.main,
          },
          {
            label: 'Total Withdrawals',
            value: toCurrency(analytics.transactions.total_withdrawals, '₦'),
            icon: <PaymentIcon />,
            color: theme.palette.warning.main,
          },
          {
            label: 'Pending Transactions',
            value: analytics.transactions.pending_transactions
              ? analytics.transactions.pending_transactions.count
              : '--',
            icon: <ReceiptIcon />,
            color: theme.palette.error.main,
          },
        ]
      : [];

  // Card layout variables (match AdminDashboard style)
  const FLAT_RADIUS = 1;
  const FLAT_ELEVATION = 0;

  // Pagination UI helpers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < numPages) setPage(page + 1);
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
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Financial Management
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: '1rem' }}
          >
            Monitor and manage all financial transactions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            mt: isMobile ? 1.5 : 0,
            borderRadius: FLAT_RADIUS,
            fontWeight: 600,
          }}
        >
          Export Report
        </Button>
      </Box>

      {/* Financial Stats - Dashboard style cards */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2.5,
          mb: 4,
        }}
      >
        {analyticsLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Paper
                key={idx}
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
                  opacity: 0.56,
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    mb: 1.4,
                    bgcolor: theme.palette.grey[100],
                    color: theme.palette.grey[400],
                    fontSize: 24,
                  }}
                  variant="rounded"
                >
                  <CircularProgress size={22} thickness={4} />
                </Avatar>
                <Box
                  sx={{
                    width: '96px',
                    height: '21.4px',
                    mb: 0.8,
                    bgcolor: theme.palette.action.hover,
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    width: '88px',
                    height: '14.2px',
                    bgcolor: theme.palette.action.hover,
                    borderRadius: 1,
                  }}
                />
              </Paper>
            ))
          : analyticsError ? (
              <Typography color="error">{analyticsError}</Typography>
            ) : (
              financialStats.map((stat, _idx) => (
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              ))
            )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_e, newValue) => {
          setTabValue(newValue);
          setPage(1);
        }}
        sx={{ mb: 3 }}
        TabIndicatorProps={{ sx: { height: 3, borderRadius: 8 } }}
      >
        <Tab
          label="All Transactions"
          sx={{ fontWeight: 700, fontSize: '1rem' }}
        />
        <Tab
          label="Deposits"
          sx={{ fontWeight: 700, fontSize: '1rem' }}
        />
        <Tab
          label="Withdrawals"
          sx={{ fontWeight: 700, fontSize: '1rem' }}
        />
        <Tab
          label="Payments"
          sx={{ fontWeight: 700, fontSize: '1rem' }}
        />
      </Tabs>

      {/* Search and Filters, match dashboard style */}
      <Card
        sx={{
          mb: 3,
          borderRadius: FLAT_RADIUS,
          boxShadow: 0,
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
        elevation={FLAT_ELEVATION}
      >
        <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 2, minWidth: 220 }}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: '#fff', borderRadius: FLAT_RADIUS }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 160 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="successful">Successful</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 160 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={typeFilter}
                  onChange={e => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
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
      <Card
        sx={{
          borderRadius: FLAT_RADIUS,
          boxShadow: 0,
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
        elevation={FLAT_ELEVATION}
      >
        <CardContent sx={{ p: isMobile ? 1.4 : 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Transaction ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Wallet
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                    }}
                    align="right"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : transactionsError ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="error">{transactionsError}</Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>No transactions found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-line',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {tx.wallet}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.transaction_type}
                          color={getTypeColor(tx.transaction_type)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {tx.currency} {toCurrency(tx.amount, '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          color={getStatusColor(tx.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleString()
                          : '--'}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" sx={{ fontWeight: 600 }}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              mt: 2,
              gap: 1,
            }}
          >
            <Button
              size="small"
              disabled={page <= 1}
              onClick={handlePrevPage}
              sx={{ minWidth: 90 }}
            >
              Previous
            </Button>
            <Typography>
              Page {page} of {numPages}
            </Typography>
            <Button
              size="small"
              disabled={page >= numPages}
              onClick={handleNextPage}
              sx={{ minWidth: 90 }}
            >
              Next
            </Button>
            <Typography sx={{ ml: 2, fontSize: 13, color: 'text.secondary' }}>
              {totalCount} transaction{totalCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialManagement;
