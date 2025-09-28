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
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  MenuBook as PlaybookIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockTrainingData } from '../../../services/trainingService';
import type { AgentPlaybook, TrainingFilter, PlaybookCategory } from '../../../types/training';

const AgentPlaybookPage: React.FC = () => {
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState<AgentPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrainingFilter>({});
  const [selectedPlaybook, setSelectedPlaybook] = useState<AgentPlaybook | null>(null);
  const [playbookDialogOpen, setPlaybookDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load playbooks
  useEffect(() => {
    loadPlaybooks();
  }, [filter]);

  const loadPlaybooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockTrainingData.playbooks;
      setPlaybooks(data);
    } catch (err) {
      setError('Failed to load playbooks');
      console.error('Error loading playbooks:', err);
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

  const handleViewPlaybook = (playbook: AgentPlaybook) => {
    setSelectedPlaybook(playbook);
    setPlaybookDialogOpen(true);
  };

  const handleDeletePlaybook = async (id: string) => {
    try {
      // await trainingApi.deletePlaybook(id);
      setPlaybooks(prev => prev.filter(playbook => playbook.id !== id));
    } catch (err) {
      setError('Failed to delete playbook');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: PlaybookCategory) => {
    switch (category) {
      case 'onboarding': return <CheckCircleIcon />;
      case 'procedures': return <DescriptionIcon />;
      case 'policies': return <WarningIcon />;
      case 'best_practices': return <StarIcon />;
      case 'troubleshooting': return <PsychologyIcon />;
      case 'compliance': return <AssessmentIcon />;
      case 'product_knowledge': return <PlaybookIcon />;
      case 'customer_service': return <TrendingUpIcon />;
      case 'sales_techniques': return <TrendingUpIcon />;
      case 'emergency_protocols': return <WarningIcon />;
      default: return <PlaybookIcon />;
    }
  };

  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter(playbook => {
      if (searchTerm && !playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !playbook.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter.category && playbook.category !== filter.category) {
        return false;
      }
      if (filter.active !== undefined && playbook.is_active !== filter.active) {
        return false;
      }
      return true;
    });
  }, [playbooks, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      total: playbooks.length,
      active: playbooks.filter(p => p.is_active).length,
      critical: playbooks.filter(p => p.priority === 'critical').length,
      totalSections: playbooks.reduce((sum, p) => sum + p.sections.length, 0)
    };
  }, [playbooks]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(playbooks.map(p => p.category))];
    return uniqueCategories;
  }, [playbooks]);

  const playbookCategories: PlaybookCategory[] = [
    'onboarding', 'procedures', 'policies', 'best_practices', 'troubleshooting',
    'compliance', 'product_knowledge', 'customer_service', 'sales_techniques', 'emergency_protocols'
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
          Agent Playbook
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPlaybooks}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/staff/training/playbook/new')}
          >
            New Playbook
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
                    Total Playbooks
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <PlaybookIcon color="primary" sx={{ fontSize: 40 }} />
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
                  <PlaybookIcon color="success" sx={{ fontSize: 40 }} />
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
                    Critical
                  </Typography>
                  <Typography variant="h4" color="error.main">{stats.critical}</Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
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
                    Total Sections
                  </Typography>
                  <Typography variant="h4" color="primary.main">{stats.totalSections}</Typography>
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
            placeholder="Search playbooks..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={filter.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {playbookCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            <Tab key={category} label={category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
          ))}
        </Tabs>
      </Paper>

      {/* Playbooks Grid */}
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
        {filteredPlaybooks.map((playbook) => (
          <Card key={playbook.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    mr: 2
                  }}
                >
                  {getCategoryIcon(playbook.category)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {playbook.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    v{playbook.version}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {playbook.description}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={playbook.category.replace('_', ' ')}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={playbook.priority}
                  size="small"
                  color={getPriorityColor(playbook.priority)}
                />
                {playbook.is_active ? (
                  <Chip label="Active" size="small" color="success" />
                ) : (
                  <Chip label="Inactive" size="small" color="error" />
                )}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {playbook.sections.length} sections
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {playbook.target_roles.length} roles
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {playbook.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {playbook.tags.length > 3 && (
                  <Chip label={`+${playbook.tags.length - 3}`} size="small" variant="outlined" />
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleViewPlaybook(playbook)}
              >
                View
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeletePlaybook(playbook.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Playbook Preview Dialog */}
      <Dialog
        open={playbookDialogOpen}
        onClose={() => setPlaybookDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlaybook?.title}
          <Chip
            label={selectedPlaybook?.priority}
            size="small"
            sx={{ ml: 2 }}
            color={selectedPlaybook ? getPriorityColor(selectedPlaybook.priority) : 'default'}
          />
        </DialogTitle>
        <DialogContent>
          {selectedPlaybook && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedPlaybook.description}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{selectedPlaybook.category.replace('_', ' ')}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Version</Typography>
                  <Typography variant="body2">{selectedPlaybook.version}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Typography variant="body2">{selectedPlaybook.priority}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{selectedPlaybook.is_active ? 'Active' : 'Inactive'}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Sections:
              </Typography>
              <Stack spacing={1}>
                {selectedPlaybook.sections.map((section, index) => (
                  <Accordion key={section.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        {index + 1}. {section.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {section.content}
                      </Typography>
                      {section.subsections && section.subsections.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Subsections:
                          </Typography>
                          {section.subsections.map((subsection) => (
                            <Box key={subsection.id} sx={{ ml: 2, mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {subsection.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {subsection.content}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>

              {selectedPlaybook.tags.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedPlaybook.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlaybookDialogOpen(false)}>Close</Button>
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

export default AgentPlaybookPage;
