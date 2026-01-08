import React, { useEffect, useState } from 'react';
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
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

import authService from '../../../services/authService';
import api from '../../../services/api';


interface RevenueBreakdownItem {
  type: string;
  amount: number;
  transactions: number;
}

interface RevenueAnalytics {
  total_revenue: number;
  total_transactions: number;
  avg_revenue: number;
  by_type: RevenueBreakdownItem[];
  by_status?: { status: string; amount: number; transactions: number }[];
  recent: any[]; // Transaction[]
}

interface RevenueTransactionsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  num_pages: number;
  page_size: number;
  current_page: number;
  results: any[];
}

/**
 * Revenue Report Page for Admin
 */
const RevenueReport: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Search/filter/pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  // Revenue analytics
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch analytics (assume API shape like FinancialManagement)
  useEffect(() => {
    let ignore = false;
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    authService
      .getAdminWalletAnalytics?.()
      .then((data: any) => {
        if (ignore) return;
        if (data && data.transactions) {
          const tx = data.transactions;
          // Try to find by_type for revenue, fallback to payments if needed
          let revenueType =
            Array.isArray(tx.by_type) &&
            (tx.by_type.find((t: any) => t.transaction_type === 'payment' || t.transaction_type === 'revenue') ||
              tx.by_type[0]);
          const total_revenue = revenueType?.total || tx.total_revenue || 0;
          const total_transactions = revenueType?.count || tx.total_transactions || 0;
          const avg_revenue = total_transactions > 0 ? total_revenue / total_transactions : 0;
          setAnalytics({
            total_revenue,
            total_transactions,
            avg_revenue,
            by_type: Array.isArray(tx.by_type)
              ? tx.by_type.map((bt: any) => ({
                  type: bt.transaction_type,
                  amount: bt.total,
                  transactions: bt.count,
                }))
              : [],
            by_status: Array.isArray(tx.by_status)
              ? tx.by_status.map((bs: any) => ({
                  status: bs.status,
                  amount: bs.total || 0,
                  transactions: bs.count || 0,
                }))
              : [],
            recent: Array.isArray(tx.recent) ? tx.recent : [],
          });
        } else {
          setAnalytics(null);
        }
      })
      .catch(() => {
        if (!ignore) setAnalyticsError('Failed to load revenue analytics');
      })
      .finally(() => {
        if (!ignore) setAnalyticsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch paged transactions for "payment" (revenue) only
  useEffect(() => {
    let ignore = false;
    setTransactionsLoading(true);
    setTransactionsError(null);

    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.transaction_type = typeFilter;
    params.transaction_type = 'payment'; // Only revenue
    params.page = page;
    params.page_size = pageSize;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    api
      .get('/wallet/wallet-transactions/', { params })
      .then((res) => {
        if (!ignore) {
          const apiRes: RevenueTransactionsApiResponse = res.data;
          setTransactions(Array.isArray(apiRes.results) ? apiRes.results : []);
          setTotalCount(apiRes.count || 0);
          setNumPages(apiRes.num_pages || 1);
          setTransactionsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setTransactionsError('Failed to load revenue transactions');
          setTransactionsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [searchTerm, statusFilter, typeFilter, page, pageSize, startDate, endDate]);

  // Helper: currency format
  function toCurrency(val: number | string | null | undefined, cur: string = '₦') {
    if (val === null || val === undefined) return '--';
    let num = typeof val === 'string' ? parseFloat(val) : val;
    if (typeof num !== 'number' || isNaN(num)) return '--';
    return `${cur}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  // Status color for chips (from context)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'primary';
      case 'refund':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Breakdown options
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'successful', label: 'Successful' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];
  const typeOptions =
    analytics?.by_type?.length
      ? [{ value: '', label: 'All' }].concat(
          analytics.by_type.map(bt => ({
            value: bt.type,
            label: bt.type.charAt(0).toUpperCase() + bt.type.slice(1)
          }))
        )
      : [{ value: '', label: 'All' }, { value: 'payment', label: 'Payment' }];

  // Pagination
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < numPages) setPage(page + 1);
  };

  // Dashboard cards for summary
  const revenueStats = analytics
    ? [
        {
          label: 'Total Revenue',
          value: toCurrency(analytics.total_revenue, '₦'),
          icon: <TrendingUpIcon />,
          color: theme.palette.success.main,
        },
        {
          label: 'Total Transactions',
          value: analytics.total_transactions?.toLocaleString(),
          icon: <PaymentIcon />,
          color: theme.palette.primary.main,
        },
        {
          label: 'Average Revenue',
          value: toCurrency(analytics.avg_revenue, '₦'),
          icon: <MonetizationOnIcon />,
          color: theme.palette.info.main,
        }
      ]
    : [];

  // Date filter UI
  const DateFilters = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        type="date"
        size="small"
        label="Start Date"
        value={startDate}
        onChange={e => {
          setStartDate(e.target.value);
          setPage(1);
        }}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 155 }}
      />
      <TextField
        type="date"
        size="small"
        label="End Date"
        value={endDate}
        onChange={e => {
          setEndDate(e.target.value);
          setPage(1);
        }}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 155 }}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        maxWidth: 1600,
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Revenue Report
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: '1rem' }}
          >
            View and analyze platform revenue
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            mt: isMobile ? 1.5 : 0,
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          Export Report
        </Button>
      </Box>

      {/* Revenue Stats */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2.5,
          mb: 4,
        }}
      >
        {analyticsLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  flex: '1 1 200px',
                  minWidth: 178,
                  maxWidth: { xs: '100%', sm: 230, md: 260 },
                  borderRadius: 1,
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
              revenueStats.map(stat => (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    flex: '1 1 200px',
                    minWidth: 178,
                    maxWidth: { xs: '100%', sm: 230, md: 260 },
                    borderRadius: 1,
                    px: 2.4,
                    py: 2.4,
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

      {/* Revenue Breakdown Table */}
      {analytics && analytics.by_type && (
        <Card sx={{ mb: 4, borderRadius: 1, border: `1px solid ${theme.palette.grey[200]}` }} elevation={0}>
          <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.2 }}>
              Revenue Breakdown by Type
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                      Total Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                      # of Transactions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.by_type.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No breakdown found.</TableCell>
                    </TableRow>
                  ) : (
                    analytics.by_type.map(bt => (
                      <TableRow key={bt.type}>
                        <TableCell>
                          <Chip
                            label={bt.type}
                            color={getTypeColor(bt.type)}
                            size="small"
                            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          {toCurrency(bt.amount, '₦')}
                        </TableCell>
                        <TableCell>
                          {bt.transactions}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 1,
          boxShadow: 0,
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
        elevation={0}
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
                placeholder="Search revenue transactions..."
                value={searchTerm}
                onChange={e => {
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
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 145 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {statusOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 145 }}>
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
                  {typeOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 2 }}>
              {DateFilters}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Revenue Transactions Table */}
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: 0,
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
        elevation={0}
      >
        <CardContent sx={{ p: isMobile ? 1.4 : 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Transaction ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    User
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Wallet
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Currency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Date
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
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
                      <Typography>No revenue transactions found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow
                      key={tx.id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>
                        {tx.user}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-line',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {tx.wallet}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {tx.currency} {toCurrency(tx.amount, '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.currency}
                          color="info"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
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

export default RevenueReport;