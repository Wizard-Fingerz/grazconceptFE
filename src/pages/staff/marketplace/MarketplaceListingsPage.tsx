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
  Avatar,
  Badge,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { mockMarketplaceData } from '../../../services/marketplaceService';
import type { MarketplaceListing, MarketplaceFilter, MarketplaceSort } from '../../../types/marketplace';

const MarketplaceListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<MarketplaceFilter>({});
  const [sort] = useState<MarketplaceSort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  // Load listings
  useEffect(() => {
    loadListings();
  }, [filter, sort, pagination]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockMarketplaceData.listings;
      setListings(data);
    } catch (err) {
      setError('Failed to load listings');
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilter(prev => ({ ...prev, search: value || undefined }));
  };

  const handleFilterChange = (newFilter: Partial<MarketplaceFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setFilterMenuAnchor(null);
  };

  // const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
  //   setSort({ field: field as any, direction });
  // };

  const handleDeleteListing = async (id: string) => {
    try {
      // await marketplaceApi.deleteListing(id);
      setListings(prev => prev.filter(listing => listing.id !== id));
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    } catch (err) {
      setError('Failed to delete listing');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRows.length === 0) return;

    try {
      // await marketplaceApi.bulkAction({
      //   action: action as any,
      //   listing_ids: selectedRows
      // });
      
      // Reload listings after bulk action
      loadListings();
      setSelectedRows([]);
    } catch (err) {
      setError(`Failed to ${action} listings`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'sold': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'error';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Product',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={params.row.images?.[0]}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          >
            {params.row.title.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SKU: {params.row.sku || 'N/A'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.category.replace('_', ' ').toUpperCase()}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.row.currency} {params.row.price.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.stock}
          size="small"
          color={getStockColor(params.row.stock)}
          icon={<InventoryIcon />}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          size="small"
          color={getStatusColor(params.row.status)}
        />
      ),
    },
    {
      field: 'featured',
      headerName: 'Featured',
      width: 100,
      renderCell: (params) => (
        params.row.featured ? (
          <StarIcon color="primary" fontSize="small" />
        ) : null
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption">
          {new Date(params.row.created_at).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/staff/marketplace/view/${params.row.id}`)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/staff/marketplace/edit/${params.row.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => {
                setListingToDelete(params.row.id);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [listings, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: listings.length,
      active: listings.filter(l => l.status === 'active').length,
      lowStock: listings.filter(l => l.stock <= 5).length,
      featured: listings.filter(l => l.featured).length,
    };
  }, [listings]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Instead of MUI Grid, use a flexbox layout for the stats cards
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Marketplace Listings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/staff/marketplace/new')}
        >
          Add New Listing
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards - replaced Grid with flexbox */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Listings
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4" color="success.main">{stats.active}</Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
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
                  <ShoppingCartIcon color="warning" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Featured
                  </Typography>
                  <Typography variant="h4" color="primary.main">{stats.featured}</Typography>
                </Box>
                <StarIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search listings..."
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
              color="error"
              onClick={() => handleBulkAction('delete')}
            >
              Delete Selected ({selectedRows.length})
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper>
        <CustomDataTable
          rows={filteredListings}
          columns={columns}
          rowCount={filteredListings.length}
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
        <MenuItem onClick={() => handleFilterChange({ status: 'active' })}>
          Active Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ status: 'inactive' })}>
          Inactive Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ featured: true })}>
          Featured Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({})}>
          Clear Filters
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Listing</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this listing? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => listingToDelete && handleDeleteListing(listingToDelete)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplaceListingsPage;
