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
  CardMedia,
  CardActions,
  Avatar,
  Badge,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as ExcelIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockTrainingData } from '../../../services/trainingService';
import type { DigitalCatalog, TrainingFilter } from '../../../types/training';

const DigitalCatalogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<DigitalCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrainingFilter>({});
  const [selectedCatalog, setSelectedCatalog] = useState<DigitalCatalog | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Load catalogs
  useEffect(() => {
    loadCatalogs();
    // eslint-disable-next-line
  }, [filter]);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, use mock data. Replace with actual API call
      const data = mockTrainingData.catalogs;
      setCatalogs(data);
    } catch (err) {
      setError('Failed to load catalogs');
      // eslint-disable-next-line no-console
      console.error('Error loading catalogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilter(prev => ({ ...prev, search: value || undefined }));
  };

  const handleFilterChange = (newFilter: Partial<TrainingFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setFilterMenuAnchor(null);
  };

  const handlePreviewCatalog = (catalog: DigitalCatalog) => {
    setSelectedCatalog(catalog);
    setPreviewDialogOpen(true);
  };

  const handleDownloadCatalog = async (catalog: DigitalCatalog) => {
    try {
      setDownloading(catalog.id);
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Create download link
      const link = document.createElement('a');
      link.href = catalog.file_url;
      link.download = `${catalog.title}.${catalog.file_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Update download count
      setCatalogs(prev => prev.map(c =>
        c.id === catalog.id
          ? { ...c, download_count: c.download_count + 1 }
          : c
      ));
    } catch (err) {
      setError('Failed to download catalog');
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteCatalog = async (id: string) => {
    try {
      // await trainingApi.deleteCatalog(id);
      setCatalogs(prev => prev.filter(catalog => catalog.id !== id));
    } catch (err) {
      setError('Failed to delete catalog');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <PdfIcon />;
      case 'doc':
      case 'docx': return <DocIcon />;
      case 'ppt':
      case 'pptx': return <PptIcon />;
      case 'xls':
      case 'xlsx': return <ExcelIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getFileColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return 'error';
      case 'doc':
      case 'docx': return 'primary';
      case 'ppt':
      case 'pptx': return 'warning';
      case 'xls':
      case 'xlsx': return 'success';
      default: return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(catalogs.map(c => c.category))];
    return uniqueCategories;
  }, [catalogs]);

  const fileTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

  // Tab filtering logic
  const filteredCatalogs = useMemo(() => {
    let filtered = catalogs;
    if (activeTab > 0 && categories[activeTab - 1]) {
      filtered = filtered.filter(c => c.category === categories[activeTab - 1]);
    }
    filtered = filtered.filter(catalog => {
      if (searchTerm && !catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !catalog.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter.type && catalog.file_type !== filter.type) {
        return false;
      }
      if (filter.category && catalog.category !== filter.category) {
        return false;
      }
      if (filter.target_audience && catalog.target_audience !== filter.target_audience) {
        return false;
      }
      if (typeof filter.active === 'boolean' && catalog.is_active !== filter.active) {
        return false;
      }
      if (filter.active === false && catalog.is_active) {
        return false;
      }
      return true;
    });
    return filtered;
  }, [catalogs, searchTerm, filter, activeTab, categories]);

  const stats = useMemo(() => {
    return {
      total: catalogs.length,
      active: catalogs.filter(c => c.is_active).length,
      totalDownloads: catalogs.reduce((sum, c) => sum + c.download_count, 0),
      totalSize: catalogs.reduce((sum, c) => sum + c.file_size, 0)
    };
  }, [catalogs]);

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
          Digital Catalogs
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCatalogs}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/staff/training/catalogs/new')}
          >
            Upload Catalog
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
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
                    Total Catalogs
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
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
                <Badge badgeContent={stats.active} color="success">
                  <DescriptionIcon color="success" sx={{ fontSize: 40 }} />
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
                    Total Downloads
                  </Typography>
                  <Typography variant="h4" color="info.main">{stats.totalDownloads}</Typography>
                </Box>
                <CloudDownloadIcon color="info" sx={{ fontSize: 40 }} />
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
                    Total Size
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {formatFileSize(stats.totalSize)}
                  </Typography>
                </Box>
                <DescriptionIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search catalogs..."
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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>File Type</InputLabel>
            <Select
              value={filter.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
              label="File Type"
            >
              <MenuItem value="">All Types</MenuItem>
              {fileTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Audience</InputLabel>
            <Select
              value={filter.target_audience || ''}
              onChange={(e) =>
                handleFilterChange({
                  target_audience: e.target.value || undefined,
                })}
              label="Audience"
            >
              <MenuItem value="">All Audiences</MenuItem>
              <MenuItem value="agents">Agents</MenuItem>
              <MenuItem value="customers">Customers</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            More Filters
          </Button>
        </Stack>
      </Paper>

      {/* Category Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" />
          {categories.map((category) => (
            <Tab key={category} label={category} />
          ))}
        </Tabs>
      </Paper>

      {/* Catalogs Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        }}
      >
        {filteredCatalogs.map((catalog) => (
          <Card key={catalog.id}>
            <CardMedia
              component="img"
              height="200"
              image={catalog.thumbnail_url || '/images/catalog-placeholder.jpg'}
              alt={catalog.title}
              sx={{ cursor: 'pointer' }}
              onClick={() => handlePreviewCatalog(catalog)}
            />

            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getFileColor(catalog.file_type)}.main`,
                    mr: 2
                  }}
                >
                  {getFileIcon(catalog.file_type)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {catalog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {catalog.file_type.toUpperCase()} • v{catalog.version}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {catalog.description}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={catalog.category}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={catalog.target_audience}
                  size="small"
                  color={catalog.target_audience === 'both' ? 'primary' : 'secondary'}
                />
                {catalog.is_active ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Inactive" size="small" color="error" />
                )}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(catalog.file_size)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {catalog.pages && `${catalog.pages} pages`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudDownloadIcon fontSize="small" color="action" />
                  <Typography variant="caption">{catalog.download_count}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon fontSize="small" color="action" />
                  <Typography variant="caption">{catalog.language}</Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {catalog.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {catalog.tags.length > 3 && (
                  <Chip label={`+${catalog.tags.length - 3}`} size="small" variant="outlined" />
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handlePreviewCatalog(catalog)}
              >
                Preview
              </Button>
              <Button
                size="small"
                startIcon={downloading === catalog.id ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={() => handleDownloadCatalog(catalog)}
                disabled={downloading === catalog.id}
              >
                {downloading === catalog.id ? 'Downloading...' : 'Download'}
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeleteCatalog(catalog.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCatalog?.title}
          <Chip
            label={selectedCatalog?.file_type.toUpperCase()}
            size="small"
            sx={{ ml: 2 }}
            color={selectedCatalog ? getFileColor(selectedCatalog.file_type) : 'default'}
          />
        </DialogTitle>
        <DialogContent>
          {selectedCatalog && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedCatalog.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getFileColor(selectedCatalog.file_type)}.main`,
                  }}
                >
                  {getFileIcon(selectedCatalog.file_type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCatalog.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCatalog.file_type.toUpperCase()} • {formatFileSize(selectedCatalog.file_size)} • v{selectedCatalog.version}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{selectedCatalog.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Target Audience</Typography>
                  <Typography variant="body2">{selectedCatalog.target_audience}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Language</Typography>
                  <Typography variant="body2">{selectedCatalog.language}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Downloads</Typography>
                  <Typography variant="body2">{selectedCatalog.download_count}</Typography>
                </Box>
              </Box>

              {selectedCatalog.tags.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedCatalog.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              setPreviewDialogOpen(false);
              selectedCatalog && handleDownloadCatalog(selectedCatalog);
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange({ active: true })}>
          Active Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ active: false })}>
          Inactive Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({})}>
          Clear Filters
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DigitalCatalogsPage;
