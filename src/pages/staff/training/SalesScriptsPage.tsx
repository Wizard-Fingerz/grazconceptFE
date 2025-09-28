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
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  RecordVoiceOver as ScriptIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mockTrainingData } from '../../../services/trainingService';
import type { SalesScript, TrainingFilter, ScriptCategory } from '../../../types/training';

const SalesScriptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<SalesScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrainingFilter>({});
  const [selectedScript, setSelectedScript] = useState<SalesScript | null>(null);
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  // const [practiceMode, setPracticeMode] = useState(false);

  // Load scripts
  useEffect(() => {
    loadScripts();
  }, [filter]);

  const loadScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockTrainingData.scripts;
      setScripts(data);
    } catch (err) {
      setError('Failed to load scripts');
      console.error('Error loading scripts:', err);
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

  const handleViewScript = (script: SalesScript) => {
    setSelectedScript(script);
    setScriptDialogOpen(true);
  };

  const handlePracticeScript = (script: SalesScript) => {
    setSelectedScript(script);
    setPracticeDialogOpen(true);
  };

  const handleUseScript = async (script: SalesScript) => {
    try {
      // await trainingApi.useScript(script.id, {});
      
      // Update usage count
      setScripts(prev => prev.map(s => 
        s.id === script.id 
          ? { ...s, usage_count: s.usage_count + 1 }
          : s
      ));
    } catch (err) {
      setError('Failed to use script');
    }
  };

  const handleDeleteScript = async (id: string) => {
    try {
      // await trainingApi.deleteScript(id);
      setScripts(prev => prev.filter(script => script.id !== id));
    } catch (err) {
      setError('Failed to delete script');
    }
  };

  const getCategoryIcon = (category: ScriptCategory) => {
    switch (category) {
      case 'cold_calling': return <PhoneIcon />;
      case 'follow_up': return <EmailIcon />;
      case 'objection_handling': return <PsychologyIcon />;
      case 'closing': return <CheckCircleIcon />;
      case 'customer_service': return <ChatIcon />;
      case 'product_demo': return <AssessmentIcon />;
      case 'consultation': return <ChatIcon />;
      case 'renewal': return <TrendingUpIcon />;
      case 'upselling': return <TrendingUpIcon />;
      case 'crisis_management': return <WarningIcon />;
      default: return <ScriptIcon />;
    }
  };

  const getCategoryColor = (category: ScriptCategory) => {
    switch (category) {
      case 'cold_calling': return 'primary';
      case 'follow_up': return 'secondary';
      case 'objection_handling': return 'warning';
      case 'closing': return 'success';
      case 'customer_service': return 'info';
      case 'product_demo': return 'primary';
      case 'consultation': return 'secondary';
      case 'renewal': return 'success';
      case 'upselling': return 'warning';
      case 'crisis_management': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      if (searchTerm && !script.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !script.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !script.scenario.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter.category && script.category !== filter.category) {
        return false;
      }
      if (filter.difficulty && script.difficulty !== filter.difficulty) {
        return false;
      }
      return true;
    });
  }, [scripts, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      total: scripts.length,
      active: scripts.filter(s => s.is_active).length,
      totalUsage: scripts.reduce((sum, s) => sum + s.usage_count, 0),
      averageSuccessRate: scripts.length > 0 ? 
        scripts.reduce((sum, s) => sum + s.success_rate, 0) / scripts.length : 0
    };
  }, [scripts]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(scripts.map(s => s.category))];
    return uniqueCategories;
  }, [scripts]);

  const scriptCategories: ScriptCategory[] = [
    'cold_calling', 'follow_up', 'objection_handling', 'closing', 'customer_service',
    'product_demo', 'consultation', 'renewal', 'upselling', 'crisis_management'
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
          Sales Scripts
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadScripts}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/staff/training/scripts/new')}
          >
            New Script
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
                    Total Scripts
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <ScriptIcon color="primary" sx={{ fontSize: 40 }} />
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
                  <ScriptIcon color="success" sx={{ fontSize: 40 }} />
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
                    Total Usage
                  </Typography>
                  <Typography variant="h4" color="info.main">{stats.totalUsage}</Typography>
                </Box>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
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
                    Avg Success Rate
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {(stats.averageSuccessRate * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <StarIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search scripts..."
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filter.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value as ScriptCategory || undefined })}
            >
              <MenuItem value="">All Categories</MenuItem>
              {scriptCategories.map(category => (
                <MenuItem key={category} value={category}>
                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={filter.difficulty || ''}
              onChange={(e) => handleFilterChange({ difficulty: e.target.value || undefined })}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
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

      {/* Scripts Grid */}
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
        {filteredScripts.map((script) => (
          <Card key={script.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: `${getCategoryColor(script.category)}.main`,
                    mr: 2
                  }}
                >
                  {getCategoryIcon(script.category)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap>
                    {script.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {script.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {script.description}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                "{script.scenario}"
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={script.difficulty}
                  size="small"
                  color={getDifficultyColor(script.difficulty)}
                />
                <Chip
                  label={`${(script.success_rate * 100).toFixed(0)}% success`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${script.estimated_duration}min`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Used {script.usage_count} times
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {script.key_points.length} key points
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {script.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {script.tags.length > 3 && (
                  <Chip label={`+${script.tags.length - 3}`} size="small" variant="outlined" />
                )}
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleViewScript(script)}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<PlayIcon />}
                onClick={() => handlePracticeScript(script)}
              >
                Practice
              </Button>
              <Button
                size="small"
                startIcon={<ScriptIcon />}
                onClick={() => handleUseScript(script)}
              >
                Use
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeleteScript(script.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Script Details Dialog */}
      <Dialog
        open={scriptDialogOpen}
        onClose={() => setScriptDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedScript?.title}
          <Chip
            label={selectedScript?.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            size="small"
            sx={{ ml: 2 }}
            color={selectedScript ? getCategoryColor(selectedScript.category) : 'default'}
          />
        </DialogTitle>
        <DialogContent>
          {selectedScript && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedScript.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                Scenario
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {selectedScript.scenario}
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Script Content
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                >
                  {selectedScript.script_content}
                </Typography>
              </Paper>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Key Points</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    {selectedScript.key_points.map((point, index) => (
                      <li key={index}>
                        <Typography variant="body2">{point}</Typography>
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Objection Handling</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {selectedScript.objections.map((objection, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                        Objection: {objection.objection}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Response: {objection.response}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tips: {objection.tips.join(', ')}
                      </Typography>
                      {index < selectedScript.objections.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Follow-up Actions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul>
                    {selectedScript.follow_up_actions.map((action, index) => (
                      <li key={index}>
                        <Typography variant="body2">{action}</Typography>
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScriptDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={() => {
              setScriptDialogOpen(false);
              selectedScript && handlePracticeScript(selectedScript);
            }}
          >
            Practice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Practice Dialog */}
      <Dialog
        open={practiceDialogOpen}
        onClose={() => setPracticeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Practice Mode: {selectedScript?.title}</DialogTitle>
        <DialogContent>
          {selectedScript && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Practice the script below. Take your time and focus on delivery.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                >
                  {selectedScript.script_content}
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Key Points to Remember:
              </Typography>
              <ul>
                {selectedScript.key_points.map((point, index) => (
                  <li key={index}>
                    <Typography variant="body2">{point}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPracticeDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPracticeDialogOpen(false);
              selectedScript && handleUseScript(selectedScript);
            }}
          >
            Mark as Used
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

export default SalesScriptsPage;

