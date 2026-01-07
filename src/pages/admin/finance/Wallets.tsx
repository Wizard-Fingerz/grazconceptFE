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
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CreditCard as CreditCardIcon,
  MonetizationOn as MonetizationOnIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';

import authService from '../../../services/authService';
import api from '../../../services/api';

// Wallet DTO based on the admin API and network structure
interface Wallet {
  id: number;
  user: string; // email or username
  balance: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // The legacy code expects a 'status', so we will compute it in transform logic
  status?: string;
  [key: string]: any;
}

interface WalletsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  num_pages: number;
  page_size: number;
  current_page: number;
  results: Wallet[];
}

interface WalletAnalytics {
  total_wallets: number;
  total_balance: number;
  avg_balance: number;
  currency_breakdown: {
    currency: string;
    total: number;
    count: number;
  }[];
}

function mapWalletStatus(wallet: Wallet): string {
  // Map only by "is_active"
  if ('is_active' in wallet) {
    return wallet.is_active ? 'active' : 'suspended';
  }
  return '--';
}

export const WalletsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [walletsError, setWalletsError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [numPages, setNumPages] = useState(1);

  // Analytics for summary cards
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    authService
      .getAdminWalletAnalytics()
      .then((data: any) => {
        // Only wallets analytic part
        if (active) setAnalytics(data?.wallets || null);
      })
      .catch(() => {
        if (active) setAnalyticsError('Failed to load wallet analytics');
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
    setWalletsLoading(true);
    setWalletsError(null);

    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (currencyFilter) params.currency = currencyFilter;
    params.page = page;
    params.page_size = pageSize;

    api
      .get('/wallet/wallets/', { params })
      .then((res) => {
        if (!ignore) {
          const apiRes: WalletsApiResponse = res.data;
          // Transform each wallet to ensure it has legacy "status" property
          const transformedWallets = (apiRes.results || []).map((wallet) => ({
            ...wallet,
            status: mapWalletStatus(wallet),
          }));
          setWallets(transformedWallets);
          setTotalCount(apiRes.count || 0);
          setNumPages(apiRes.num_pages || 1);
          setWalletsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setWalletsError('Failed to load wallets');
          setWalletsLoading(false);
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

  // Card stats
  const walletStats =
    analytics
      ? [
          {
            label: 'Total Wallets',
            value: analytics.total_wallets?.toLocaleString(),
            icon: <AccountBalanceWalletIcon />,
            color: theme.palette.primary.main,
          },
          {
            label: 'Total Balance',
            value: toCurrency(analytics.total_balance, '₦'),
            icon: <MonetizationOnIcon />,
            color: theme.palette.success.main,
          },
          {
            label: 'Avg. Wallet Balance',
            value: toCurrency(analytics.avg_balance, '₦'),
            icon: <CreditCardIcon />,
            color: theme.palette.info.main,
          },
        ]
      : [];

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    // Legacy UI expects "closed" but there's no such backend status; you may remove or keep.
    // { value: 'closed', label: 'Closed' },
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
            Wallets
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: '1rem' }}
          >
            View and manage all users' wallets
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
          Export Wallets
        </Button>
      </Box>

      {/* Wallet Stats - Dashboard style cards */}
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
                    width: '82px',
                    height: '21.4px',
                    mb: 0.5,
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
              walletStats.map((stat, _idx) => (
                <Paper
                  key={stat.label}
                  elevation={0}
                  sx={{
                    flex: '1 1 200px',
                    minWidth: 178,
                    maxWidth: { xs: '100%', sm: 230, md: 260 },
                    borderRadius: 1,
                    px: 2.4,
                    py: 2.6,
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
                placeholder="Search wallets..."
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

      {/* Wallets Table */}
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
                    Wallet ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    User
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Balance
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Currency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Created
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {walletsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : walletsError ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="error">{walletsError}</Typography>
                    </TableCell>
                  </TableRow>
                ) : wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>No wallets found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((wallet) => (
                    <TableRow
                      key={wallet.id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>{wallet.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountCircleIcon sx={{ fontSize: 23, color: theme.palette.grey[600] }} />
                          <Typography variant="body2" fontWeight={600}>
                            {wallet.user}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {wallet.currency} {toCurrency(wallet.balance, '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wallet.currency}
                          color="info"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wallet.status}
                          color={
                            wallet.status === 'active'
                              ? 'success'
                              : wallet.status === 'suspended'
                              ? 'warning'
                              : wallet.status === 'closed'
                              ? 'default'
                              : 'primary'
                          }
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {wallet.created_at
                          ? new Date(wallet.created_at).toLocaleString()
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
              {totalCount} wallet{totalCount === 1 ? '' : 's'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WalletsManagement;
