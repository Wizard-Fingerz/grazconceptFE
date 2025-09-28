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
  CardActions,
  Avatar,
  Badge,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  Description as DocumentIcon,
  Receipt as ReceiptIcon,
  Description as ReportIcon,
  Slideshow as PresentationIcon,
  RecordVoiceOver as ScriptIcon,
  Checklist as ChecklistIcon,
  Description as FormIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockTrainingData } from '../../../services/trainingService';
import type { Template, TrainingFilter, TemplateType } from '../../../types/training';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrainingFilter>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [useDialogOpen, setUseDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockTrainingData.templates;
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
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

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateVariables({});
    setUseDialogOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      // await trainingApi.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const handleGenerateTemplate = () => {
    if (!selectedTemplate) return;

    // Generate the template with variables filled in
    let generatedContent = selectedTemplate.content;
    
    selectedTemplate.variables.forEach(variable => {
      const value = templateVariables[variable.name] || variable.default_value || `{{${variable.name}}}`;
      generatedContent = generatedContent.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
    });

    // Copy to clipboard
    navigator.clipboard.writeText(generatedContent);
    setUseDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateVariables({});
  };

  const getTemplateIcon = (type: TemplateType) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'document': return <DocumentIcon />;
      case 'proposal': return <ArticleIcon />;
      case 'contract': return <DescriptionIcon />;
      case 'invoice': return <ReceiptIcon />;
      case 'report': return <ReportIcon />;
      case 'presentation': return <PresentationIcon />;
      case 'script': return <ScriptIcon />;
      case 'checklist': return <ChecklistIcon />;
      case 'form': return <FormIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getTemplateColor = (type: TemplateType) => {
    switch (type) {
      case 'email': return 'primary';
      case 'document': return 'secondary';
      case 'proposal': return 'success';
      case 'contract': return 'warning';
      case 'invoice': return 'error';
      case 'report': return 'info';
      case 'presentation': return 'primary';
      case 'script': return 'secondary';
      case 'checklist': return 'success';
      case 'form': return 'warning';
      default: return 'default';
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter.type && template.type !== filter.type) {
        return false;
      }
      if (filter.category && template.category !== filter.category) {
        return false;
      }
      if (typeof filter.public_only === 'boolean' && template.is_public !== filter.public_only) {
        return false;
      }
      return true;
    });
  }, [templates, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      total: templates.length,
      public: templates.filter(t => t.is_public).length,
      private: templates.filter(t => !t.is_public).length,
      totalUsage: templates.reduce((sum, t) => sum + t.usage_count, 0)
    };
  }, [templates]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(templates.map(t => t.category))];
    return uniqueCategories;
  }, [templates]);

  const templateTypes: TemplateType[] = [
    'email', 'document', 'proposal', 'contract', 'invoice', 
    'report', 'presentation', 'script', 'checklist', 'form'
  ];

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
          Templates
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTemplates}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/staff/training/templates/new')}
          >
            New Template
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
                    Total Templates
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
                    Public
                  </Typography>
                  <Typography variant="h4" color="success.main">{stats.public}</Typography>
                </Box>
                <Badge badgeContent={stats.public} color="success">
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
                    Private
                  </Typography>
                  <Typography variant="h4" color="warning.main">{stats.private}</Typography>
                </Box>
                <DescriptionIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Total Usage
                  </Typography>
                  <Typography variant="h4" color="primary.main">{stats.totalUsage}</Typography>
                </Box>
                <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search templates..."
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
            <InputLabel>Type</InputLabel>
            <Select
              value={filter.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value as TemplateType || undefined })}
            >
              <MenuItem value="">All Types</MenuItem>
              {templateTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
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

      {/* Templates Grid */}
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
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getTemplateColor(template.type)}.main`,
                    mr: 2
                  }}
                >
                  {getTemplateIcon(template.type)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {template.description}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={template.category}
                  size="small"
                  variant="outlined"
                />
                {template.is_public ? (
                  <Chip label="Public" size="small" color="success" />
                ) : (
                  <Chip label="Private" size="small" color="warning" />
                )}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Used {template.usage_count} times
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.variables.length} variables
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {template.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {template.tags.length > 3 && (
                  <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleViewTemplate(template)}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<CopyIcon />}
                onClick={() => handleUseTemplate(template)}
              >
                Use
              </Button>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // Handle download
                  const blob = new Blob([template.content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${template.name}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeleteTemplate(template.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Template Preview Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name}
          <Chip
            label={selectedTemplate?.type}
            size="small"
            sx={{ ml: 2 }}
            color={selectedTemplate ? getTemplateColor(selectedTemplate.type) : 'default'}
          />
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedTemplate.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                Template Content:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                >
                  {selectedTemplate.content}
                </Typography>
              </Paper>

              {selectedTemplate.variables.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Variables:
                  </Typography>
                  <Stack spacing={1}>
                    {selectedTemplate.variables.map((variable) => (
                      <Box key={variable.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={variable.name} size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {variable.type} {variable.required && '(required)'}
                        </Typography>
                        {variable.description && (
                          <Typography variant="caption" color="text.secondary">
                            - {variable.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setTemplateDialogOpen(false);
              selectedTemplate && handleUseTemplate(selectedTemplate);
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Use Template Dialog */}
      <Dialog
        open={useDialogOpen}
        onClose={() => setUseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fill in the variables below to generate your template:
              </Typography>
              
              <Stack spacing={2}>
                {selectedTemplate.variables.map((variable) => (
                  <TextField
                    key={variable.name}
                    label={`${variable.name} ${variable.required ? '*' : ''}`}
                    value={templateVariables[variable.name] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [variable.name]: e.target.value
                    }))}
                    required={variable.required}
                    helperText={variable.description}
                    fullWidth
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateTemplate}
            disabled={selectedTemplate?.variables.some(v => v.required && !templateVariables[v.name])}
          >
            Generate & Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
          <MenuItem onClick={() => handleFilterChange({ public_only: true })}>
            Public Only
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange({ public_only: false })}>
            Private Only
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange({})}>
            Clear Filters
          </MenuItem>
      </Menu>
    </Box>
  );
};

export default TemplatesPage;
