import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi } from '../../../services/marketplaceService';
import type { MarketplaceListing, MarketplaceCategory } from '../../../types/marketplace';

const AddListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<Partial<MarketplaceListing>>({
    title: '',
    description: '',
    category: 'electronics',
    subcategory: '',
    price: 0,
    currency: 'NGN',
    images: [],
    status: 'draft',
    stock: 0,
    sku: '',
    tags: [],
    featured: false,
    condition: 'new',
    location: '',
    specifications: {},
    variants: []
  });

  const categories: { value: MarketplaceCategory; label: string }[] = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'books_media', label: 'Books & Media' },
    { value: 'sports_outdoors', label: 'Sports & Outdoors' },
    { value: 'health_beauty', label: 'Health & Beauty' },
    { value: 'toys_games', label: 'Toys & Games' },
    { value: 'food_beverages', label: 'Food & Beverages' },
    { value: 'services', label: 'Services' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'business_equipment', label: 'Business Equipment' }
  ];

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (₦)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleInputChange = (field: keyof MarketplaceListing, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleAddSpecification = () => {
    const key = prompt('Enter specification key:');
    const value = prompt('Enter specification value:');
    if (key && value) {
      handleInputChange('specifications', {
        ...formData.specifications,
        [key]: value
      });
    }
  };

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    handleInputChange('specifications', newSpecs);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setLoading(true);
      const uploadPromises = Array.from(files).map(file => 
        marketplaceApi.uploadImage(file)
      );
      const uploadedImages = await Promise.all(uploadPromises);
      
      handleInputChange('images', [
        ...(formData.images || []),
        ...uploadedImages.map(img => img.url)
      ]);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    handleInputChange('images', newImages);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        setError('Please fill in all required fields');
        return;
      }

      // await marketplaceApi.createListing(formData as any);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/staff/marketplace/listings');
      }, 2000);
    } catch (err) {
      setError('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Listing created successfully! Redirecting to listings...
        </Alert>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/staff/marketplace/listings')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Add New Listing
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Replace deprecated Grid with Box and Stack for layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
            
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Product Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your product"
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description *"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product in detail"
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}
              >
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="e.g., Smartphones, Laptops"
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU (optional)"
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Lagos, Nigeria"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Pricing & Inventory */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Pricing & Inventory</Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Price *"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: formData.currency + ' '
                }}
                sx={{ flex: 1 }}
              />
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Stock Quantity"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                sx={{ flex: 1 }}
              />
            </Box>
          </Paper>

          {/* Images */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Product Images</Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  disabled={loading}
                >
                  Upload Images
                </Button>
              </label>
            </Box>

            {formData.images && formData.images.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                {formData.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: { xs: '48%', sm: '30%', md: '22%' },
                      minWidth: 120,
                      position: 'relative'
                    }}
                  >
                    <Card>
                      <CardContent sx={{ p: 1, position: 'relative' }}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Product ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{ position: 'absolute', top: 5, right: 5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Tags */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Tags</Typography>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} startIcon={<AddIcon />}>
                Add
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {formData.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Stack>
          </Paper>

          {/* Specifications */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Specifications</Typography>
            
            <Button onClick={handleAddSpecification} startIcon={<AddIcon />} sx={{ mb: 2 }}>
              Add Specification
            </Button>

            {formData.specifications && Object.keys(formData.specifications).length > 0 && (
              <Stack spacing={1}>
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 100 }}>
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {value}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSpecification(key)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {statuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                >
                  {conditions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                }
                label="Featured Listing"
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Actions</Typography>
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={20} /> : 'Create Listing'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/staff/marketplace/listings')}
                fullWidth
              >
                Cancel
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AddListingPage;
