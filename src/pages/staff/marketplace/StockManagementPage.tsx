import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { marketplaceApi, mockMarketplaceData } from '../../../services/marketplaceService';
import type { StockItem } from '../../../types/marketplace';

// Replacement for deprecated Grid: use CSS flexbox for layout
const ResponsiveRow: React.FC<React.PropsWithChildren<{ gap?: number; mb?: number }>> = ({ children, gap = 16, mb = 0 }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: gap,
      marginBottom: mb,
    }}
  >
    {children}
  </Box>
);

const ResponsiveCol: React.FC<React.PropsWithChildren<{ xs?: number; sm?: number; md?: number; style?: React.CSSProperties }>> = ({
  children,
  xs = 12,
  sm = 6,
  md = 3,
  style = {},
}) => {
  // Calculate width percent based on breakpoints
  // xs, sm, md are out of 12 (like MUI Grid)
  return (
    <Box
      sx={{
        flex: `1 1 ${100 * (xs / 12)}%`,
        minWidth: 0,
        '@media (min-width:600px)': {
          flex: `1 1 ${100 * (sm / 12)}%`,
        },
        '@media (min-width:900px)': {
          flex: `1 1 ${100 * (md / 12)}%`,
        },
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

const StockManagementPage: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<StockItem>>({});

  // Load stock data
  useEffect(() => {
    loadStockData();
  }, [statusFilter, lowStockFilter]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use mock data. Replace with actual API call
      const data = mockMarketplaceData.stock;
      setStockItems(data);
    } catch (err) {
      setError('Failed to load stock data');
      console.error('Error loading stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filter: string, value: any) => {
    switch (filter) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'lowStock':
        setLowStockFilter(value);
        break;
      case 'clear':
        setStatusFilter('');
        setLowStockFilter(false);
        break;
    }
    setFilterMenuAnchor(null);
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setEditForm({
      current_stock: item.current_stock,
      min_stock_level: item.min_stock_level,
      max_stock_level: item.max_stock_level,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
      supplier: item.supplier,
      location: item.location
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      // await marketplaceApi.updateStock(editingItem.id, editForm);

      setStockItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, ...editForm, available_stock: (editForm.current_stock || 0) - item.reserved_stock }
          : item
      ));

      setEditDialogOpen(false);
      setEditingItem(null);
      setEditForm({});
    } catch (err) {
      setError('Failed to update stock item');
    }
  };

  const handleBulkUpdate = async (field: string, value: any) => {
    if (selectedRows.length === 0) return;

    try {
      const updates = selectedRows.map(id => ({
        id,
        stock: { [field]: value }
      }));

      await marketplaceApi.bulkUpdateStock(updates);

      setStockItems(prev => prev.map(item =>
        selectedRows.includes(item.id)
          ? { ...item, [field]: value, available_stock: field === 'current_stock' ? value - item.reserved_stock : item.available_stock }
          : item
      ));

      setSelectedRows([]);
    } catch (err) {
      setError(`Failed to update ${field}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      case 'discontinued': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low_stock': return <WarningIcon />;
      case 'out_of_stock': return <InventoryIcon />;
      default: return <InventoryIcon />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'listing_title',
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.listing_title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            SKU: {params.row.sku}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'current_stock',
      headerName: 'Current Stock',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color={getStatusColor(params.row.status)}>
            {params.row.current_stock}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reserved: {params.row.reserved_stock}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'available_stock',
      headerName: 'Available',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.available_stock}
          size="small"
          color={params.row.available_stock > 0 ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.row.status)}
          label={params.row.status.replace('_', ' ').toUpperCase()}
          size="small"
          color={getStatusColor(params.row.status)}
        />
      ),
    },
    {
      field: 'cost_price',
      headerName: 'Cost Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          ₦{params.row.cost_price.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'selling_price',
      headerName: 'Selling Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          ₦{params.row.selling_price.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.supplier || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.location || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Edit Stock">
          <IconButton size="small" onClick={() => handleEditItem(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      if (searchTerm && !item.listing_title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter && item.status !== statusFilter) {
        return false;
      }
      if (lowStockFilter && item.current_stock >= item.min_stock_level) {
        return false;
      }
      return true;
    });
  }, [stockItems, searchTerm, statusFilter, lowStockFilter]);

  const stats = useMemo(() => {
    return {
      total: stockItems.length,
      inStock: stockItems.filter(item => item.status === 'in_stock').length,
      lowStock: stockItems.filter(item => item.status === 'low_stock').length,
      outOfStock: stockItems.filter(item => item.status === 'out_of_stock').length,
      totalValue: stockItems.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0),
    };
  }, [stockItems]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Stock & Availability
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStockData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Import
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <ResponsiveRow gap={16} mb={24}>
        <ResponsiveCol xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </ResponsiveCol>
        <ResponsiveCol xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    In Stock
                  </Typography>
                  <Typography variant="h4" color="success.main">{stats.inStock}</Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </ResponsiveCol>
        <ResponsiveCol xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" color="warning.main">{stats.lowStock}</Typography>
                </Box>
                <Badge badgeContent={stats.lowStock} color="warning">
                  <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </ResponsiveCol>
        <ResponsiveCol xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    ₦{stats.totalValue.toLocaleString()}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            Filters
          </Button>
          {selectedRows.length > 0 && (
            <Button
              color="primary"
              onClick={() => handleBulkUpdate('min_stock_level', 5)}
            >
              Update Min Stock ({selectedRows.length})
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper>
        <CustomDataTable
          rows={filteredItems}
          columns={columns}
          rowCount={filteredItems.length}
          isLoading={loading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange('status', 'in_stock')}>
          In Stock Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', 'low_stock')}>
          Low Stock Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', 'out_of_stock')}>
          Out of Stock Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('lowStock', true)}>
          Low Stock Alert
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('clear', null)}>
          Clear Filters
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Stock Item</DialogTitle>
        <DialogContent>
          <ResponsiveRow gap={16} mb={0} >
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={editForm.current_stock || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Min Stock Level"
                type="number"
                value={editForm.min_stock_level || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) || 0 }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Max Stock Level"
                type="number"
                value={editForm.max_stock_level || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, max_stock_level: parseInt(e.target.value) || 0 }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={editForm.cost_price || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={editForm.selling_price || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={editForm.supplier || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, supplier: e.target.value }))}
              />
            </ResponsiveCol>
            <ResponsiveCol xs={12} sm={12} md={12}>
              <TextField
                fullWidth
                label="Location"
                value={editForm.location || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </ResponsiveCol>
          </ResponsiveRow>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockManagementPage;
