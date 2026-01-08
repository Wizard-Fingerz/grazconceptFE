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
  Receipt as PaymentIcon,
  MonetizationOn as MonetizationOnIcon,
  Payment as CreditCardIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

import authService from '../../../services/authService';
import api from '../../../services/api';

/**
 * Payment DTO for the page. Assume backend structure is analogous to a transaction filtered by "payment".
 */
interface Payment {
  id: number;
  user: string;
  wallet: string;
  amount: string;
  currency: string;
  status: string;
  method?: string; // (bank, card, wallet, etc.)
  reference?: string;
  meta?: any;
  created_at: string;
  updated_at: string;
}

interface PaymentsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  num_pages: number;
  page_size: number;
  current_page: number;
  results: Payment[];
}

interface PaymentAnalytics {
  total_payments: number;
  total_paid: number;
  avg_payment: number;
  currency_breakdown: {
    currency: string;
    total: number;
    count: number;
  }[];
}

export const PaymentsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  // Analytics
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  

  useEffect(() => {
    let active = true;
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    // We could use authService.getAdminWalletAnalytics, but the actual shape shown is different than before.
    // So, we map the network response to PaymentAnalytics shape.
    authService
      .getAdminWalletAnalytics?.()
      .then((data: any) => {
        if (!active) return;
        // Accept new response structure (from prompt) - find "by_type" for "payment"
        if (data && data.transactions) {
          const paymentsType = Array.isArray(data.transactions.by_type)
            ? data.transactions.by_type.find((t: any) => t.transaction_type === 'payment')
            : null;

          // Compute payment analytics (using "count" and "total" for payments, and compute avg)
          const total_payments = paymentsType?.count || 0;
          const total_paid = paymentsType?.total || 0;
          const avg_payment =
            total_payments > 0 ? total_paid / total_payments : 0;

          // For currency breakdown, filter by_type for "payment", use "currency" always as "NGN"
          const currencies = [
            {
              currency: "NGN",
              total: total_paid,
              count: total_payments,
            }
          ];

          setAnalytics({
            total_payments,
            total_paid,
            avg_payment,
            currency_breakdown: currencies,
          });
        } else {
          setAnalytics(null);
        }
      })
      .catch(() => {
        if (active) setAnalyticsError('Failed to load payment analytics');
      })
      .finally(() => {
        if (active) setAnalyticsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    setPaymentsLoading(true);
    setPaymentsError(null);

    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (currencyFilter) params.currency = currencyFilter;
    params.transaction_type = 'payment'; // Only payments
    params.page = page;
    params.page_size = pageSize;

    api
      .get('/wallet/wallet-transactions/', { params })
      .then((res) => {
        if (!ignore) {
          const apiRes: PaymentsApiResponse = res.data;
          setPayments(Array.isArray(apiRes.results) ? apiRes.results : []);
          setTotalCount(apiRes.count || 0);
          setNumPages(apiRes.num_pages || 1);
          setPaymentsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setPaymentsError('Failed to load payments');
          setPaymentsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line
  }, [searchTerm, statusFilter, currencyFilter, page, pageSize]);

  function toCurrency(val: number | string | null | undefined, cur: string = '₦') {
    if (val === null || val === undefined) return '--';
    let num = typeof val === 'string' ? parseFloat(val) : val;
    if (typeof num !== 'number' || isNaN(num)) return '--';
    return `${cur}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  // Payment stats cards
  const paymentStats =
    analytics
      ? [
          {
            label: 'Total Payments',
            value: analytics.total_payments?.toLocaleString(),
            icon: <PaymentIcon />,
            color: theme.palette.primary.main,
          },
          {
            label: 'Total Paid',
            value: toCurrency(analytics.total_paid, '₦'),
            icon: <MonetizationOnIcon />,
            color: theme.palette.success.main,
          },
          {
            label: 'Avg. Payment',
            value: toCurrency(analytics.avg_payment, '₦'),
            icon: <CreditCardIcon />,
            color: theme.palette.info.main,
          },
        ]
      : [];

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'successful', label: 'Successful' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  const currencyOptions =
    analytics?.currency_breakdown?.length
      ? [{ value: '', label: 'All' }].concat(
          analytics.currency_breakdown.map((cb) => ({
            value: cb.currency,
            label: cb.currency,
          }))
        )
      : [{ value: '', label: 'All' }];

  // Status color mapping
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

  // Pagination helpers
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
        maxWidth: 1400,
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
            Payments
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: '1rem' }}
          >
            Track and manage all payment transactions from users
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

      {/* Payment Analytics Stats - Dashboard style cards */}
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
                  maxWidth: { xs: '100%', sm: 230, md: 275 },
                  borderRadius: 1,
                  px: 2.4,
                  py: 2.6,
                  boxShadow: 0,
                  border: `1px solid ${theme.palette.grey[100]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)',
                  opacity: 0.52,
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
              paymentStats.map((stat, _idx) => (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    flex: '1 1 200px',
                    minWidth: 178,
                    maxWidth: { xs: '100%', sm: 230, md: 275 },
                    borderRadius: 1,
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

      {/* Search and Filters */}
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
                placeholder="Search payments..."
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
                sx={{ bgcolor: '#fff', borderRadius: 1 }}
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
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 145 }}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  label="Currency"
                  value={currencyFilter}
                  onChange={(e) => {
                    setCurrencyFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {currencyOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payments Table */}
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
                    Payment ID
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
                {paymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paymentsError ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="error">{paymentsError}</Typography>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography>No payments found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountCircleIcon sx={{ fontSize: 23, color: theme.palette.grey[600] }} />
                          <Typography variant="body2" fontWeight={600}>
                            {payment.user}
                          </Typography>
                        </Box>
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
                          {payment.wallet}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {payment.currency} {toCurrency(payment.amount, '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.currency}
                          color="info"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleString()
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
              {totalCount} payment{totalCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentsManagement;