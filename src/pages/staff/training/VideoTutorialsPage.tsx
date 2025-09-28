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
  Avatar,
  Alert,
  CircularProgress,
  LinearProgress,
  Rating,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { mockTrainingData } from '../../../services/trainingService';
import type { VideoTutorial, TrainingFilter, TrainingProgress } from '../../../types/training';

const VideoTutorialsPage: React.FC = () => {
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<TrainingFilter>({});
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});

  // Load tutorials
  useEffect(() => {
    loadTutorials();
  }, [filter]);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockTrainingData.tutorials;
      setTutorials(data);
    } catch (err) {
      setError('Failed to load tutorials');
      console.error('Error loading tutorials:', err);
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

  const handlePlayTutorial = (tutorial: VideoTutorial) => {
    setSelectedTutorial(tutorial);
    setVideoDialogOpen(true);
  };

  const handleBookmark = (tutorialId: string) => {
    setBookmarkedTutorials(prev => 
      prev.includes(tutorialId) 
        ? prev.filter(id => id !== tutorialId)
        : [...prev, tutorialId]
    );
  };

  const handleProgressUpdate = (tutorialId: string, progressData: Partial<TrainingProgress>) => {
    setProgress(prev => ({
      ...prev,
      [tutorialId]: {
        ...prev[tutorialId],
        tutorial_id: tutorialId,
        user_id: 1,
        progress_percentage: 0,
        time_watched: 0,
        completed: false,
        last_watched_at: new Date().toISOString(),
        ...progressData
      }
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredTutorials = useMemo(() => {
    return tutorials.filter(tutorial => {
      if (searchTerm && !tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filter.category && tutorial.category.id !== filter.category) {
        return false;
      }
      if (filter.difficulty && tutorial.difficulty !== filter.difficulty) {
        return false;
      }
      if (filter.is_featured && !tutorial.is_featured) {
        return false;
      }
      if (filter.is_required && !tutorial.is_required) {
        return false;
      }
      return true;
    });
  }, [tutorials, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      total: tutorials.length,
      completed: Object.values(progress).filter(p => p.completed).length,
      inProgress: Object.values(progress).filter(p => p.progress_percentage > 0 && !p.completed).length,
      bookmarked: bookmarkedTutorials.length,
      totalTime: tutorials.reduce((sum, t) => sum + t.duration, 0),
      watchedTime: Object.values(progress).reduce((sum, p) => sum + p.time_watched, 0)
    };
  }, [tutorials, progress, bookmarkedTutorials]);

  const categories = useMemo(() => {
    const uniqueCategories = tutorials.reduce((acc, tutorial) => {
      if (!acc.find(cat => cat.id === tutorial.category.id)) {
        acc.push(tutorial.category);
      }
      return acc;
    }, [] as any[]);
    return uniqueCategories;
  }, [tutorials]);

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
          Video Tutorials
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadTutorials}
        >
          Refresh
        </Button>
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
                    Total Tutorials
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Completed
                  </Typography>
                  <Typography variant="h4" color="success.main">{stats.completed}</Typography>
                </Box>
                <StarIcon color="success" sx={{ fontSize: 40 }} />
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
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="warning.main">{stats.inProgress}</Typography>
                </Box>
                <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Bookmarked
                  </Typography>
                  <Typography variant="h4" color="primary.main">{stats.bookmarked}</Typography>
                </Box>
                <BookmarkIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search tutorials..."
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
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>
      </Paper>

      {/* Tutorial Grid */}
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
        {filteredTutorials.map((tutorial) => {
          const tutorialProgress = progress[tutorial.id];
          const isBookmarked = bookmarkedTutorials.includes(tutorial.id);
          
          return (
            <Card key={tutorial.id} sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={tutorial.thumbnail_url}
                alt={tutorial.title}
                sx={{ cursor: 'pointer' }}
                onClick={() => handlePlayTutorial(tutorial)}
              />
              
              {/* Video Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderRadius: '50%',
                  p: 1,
                  cursor: 'pointer'
                }}
                onClick={() => handlePlayTutorial(tutorial)}
              >
                <PlayIcon sx={{ color: 'white', fontSize: 40 }} />
              </Box>

              {/* Progress Bar */}
              {tutorialProgress && (
                <LinearProgress
                  variant="determinate"
                  value={tutorialProgress.progress_percentage}
                  sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
                />
              )}

              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1, mr: 1 }} noWrap>
                    {tutorial.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleBookmark(tutorial.id)}
                  >
                    {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {tutorial.description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={tutorial.difficulty}
                    size="small"
                    color={getDifficultyColor(tutorial.difficulty)}
                  />
                  <Chip
                    label={tutorial.category.name}
                    size="small"
                    variant="outlined"
                  />
                  {tutorial.is_required && (
                    <Chip
                      label="Required"
                      size="small"
                      color="error"
                    />
                  )}
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {tutorial.instructor.charAt(0)}
                    </Avatar>
                    <Typography variant="caption">{tutorial.instructor}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon fontSize="small" />
                    {formatDuration(tutorial.duration)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewIcon fontSize="small" color="action" />
                    <Typography variant="caption">{tutorial.views}</Typography>
                    <ThumbUpIcon fontSize="small" color="action" />
                    <Typography variant="caption">{tutorial.likes}</Typography>
                  </Box>
                  <Rating value={4.5} size="small" readOnly />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Video Player Dialog */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTutorial?.title}
          <IconButton
            onClick={() => selectedTutorial && handleBookmark(selectedTutorial.id)}
            sx={{ ml: 1 }}
          >
            {selectedTutorial && bookmarkedTutorials.includes(selectedTutorial.id) ? 
              <BookmarkIcon /> : <BookmarkBorderIcon />
            }
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTutorial && (
            <Box>
              <Box
                component="video"
                controls
                sx={{ width: '100%', mb: 2 }}
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement;
                  const progressPercentage = (video.currentTime / video.duration) * 100;
                  handleProgressUpdate(selectedTutorial.id, {
                    progress_percentage: progressPercentage,
                    time_watched: video.currentTime,
                    completed: progressPercentage >= 90
                  });
                }}
              >
                <source src={selectedTutorial.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </Box>
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                Learning Objectives
              </Typography>
              <ul>
                {selectedTutorial.learning_objectives.map((objective, index) => (
                  <li key={index}>
                    <Typography variant="body2">{objective}</Typography>
                  </li>
                ))}
              </ul>

              {selectedTutorial.resources && selectedTutorial.resources.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    {selectedTutorial.resources.map((resource) => (
                      <Button
                        key={resource.id}
                        variant="outlined"
                        startIcon={<SchoolIcon />}
                        component="a"
                        href={resource.url || '#'}
                        target="_blank"
                        disabled={!resource.url}
                      >
                        {resource.name}
                      </Button>
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange({ difficulty: 'beginner' })}>
          Beginner Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ difficulty: 'intermediate' })}>
          Intermediate Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ difficulty: 'advanced' })}>
          Advanced Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ is_featured: true })}>
          Featured Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({ is_required: true })}>
          Required Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange({})}>
          Clear Filters
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VideoTutorialsPage;
