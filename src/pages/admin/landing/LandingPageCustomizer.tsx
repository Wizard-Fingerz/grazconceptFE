import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  useTheme,
  Alert,
  Snackbar,
  // Grid, <-- REMOVED DEPRECATED
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Slider,
  LinearProgress,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  VideoLibrary as VideoIcon,
  ViewCarousel as CarouselIcon,
  CallToAction as CTAIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getLandingPageConfig,
  saveLandingPageConfig,
  updateLandingPageConfig,
  publishLandingPageConfig,
  createLandingPageSection,
  updateLandingPageSection,
  deleteLandingPageSection,
  reorderLandingPageSections,
  // getLandingPagePreviewUrl, // Don't import this anymore - see below
  type LandingPageConfig,
  type LandingSection,
} from '../../../services/landingPageService';
import { toast } from 'react-toastify';

// --- Patch: Provide getLandingPagePreviewUrl on client without process usage ---

function getLandingPagePreviewUrl(): string {
  // Construct preview URL using window.location, fallback to '/' if not available.
  if (typeof window !== 'undefined') {
    // Use current origin + '/landing', or just '/landing' as fallback.
    return `${window.location.origin}/landing`;
  }
  // SSR fallback
  return '/landing';
}

// Section types
type SectionType =
  | 'hero'
  | 'banner'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'content'
  | 'gallery'
  | 'stats'
  | 'services'
  | 'pricing'
  | 'faq'
  | 'contact';

// Section Item Component
const SectionItem: React.FC<{
  section: LandingSection;
  onEdit: (section: LandingSection) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}> = ({
  section,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const getSectionIcon = (type: SectionType): React.ReactElement => {
    const iconMap: Record<SectionType, React.ReactElement> = {
      hero: <ImageIcon />,
      banner: <CarouselIcon />,
      features: <TextIcon />,
      testimonials: <TextIcon />,
      cta: <CTAIcon />,
      content: <TextIcon />,
      gallery: <VideoIcon />,
      stats: <TextIcon />,
      services: <TextIcon />,
      pricing: <TextIcon />,
      faq: <TextIcon />,
      contact: <TextIcon />,
    };
    return iconMap[type] ?? <TextIcon />;
  };

  const getSectionColor = (type: SectionType) => {
    const colorMap: Record<
      SectionType,
      'primary' | 'info' | 'success' | 'warning' | 'error' | 'default'
    > = {
      hero: 'primary',
      banner: 'info',
      features: 'success',
      testimonials: 'warning',
      cta: 'error',
      content: 'default',
      gallery: 'info',
      stats: 'primary',
      services: 'success',
      pricing: 'warning',
      faq: 'info',
      contact: 'default',
    };
    return colorMap[type] || 'default';
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: section.visible ? 'divider' : 'error.light',
        opacity: section.visible ? 1 : 0.6,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onMoveUp(section.id)}
              disabled={!canMoveUp}
              sx={{ opacity: canMoveUp ? 1 : 0.3 }}
            >
              <ArrowUpIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onMoveDown(section.id)}
              disabled={!canMoveDown}
              sx={{ opacity: canMoveDown ? 1 : 0.3 }}
            >
              <ArrowDownIcon />
            </IconButton>
          </Stack>
          <Chip
            icon={getSectionIcon(section.type as SectionType)}
            label={((section.type as SectionType).toUpperCase() as string)}
            color={getSectionColor(section.type as SectionType)}
            size="small"
          />
          <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
            {section.title}
          </Typography>
          <Chip
            label={`Order: ${section.order}`}
            size="small"
            variant="outlined"
            sx={{ minWidth: 70 }}
          />
          <IconButton
            size="small"
            onClick={() => onToggleVisibility(section.id)}
            color={section.visible ? 'default' : 'error'}
          >
            {section.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onEdit(section)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(section.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

// REPLACEMENT FOR DEPRECATED GRID: Define simple utility components for grid layouts using Box and flex display.
const ResponsiveGridContainer: React.FC<{ spacing?: number, children: React.ReactNode, sx?: any }> = ({ spacing = 3, children, sx }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: (theme) => theme.spacing(spacing),
      ...(sx || {}),
    }}
  >
    {children}
  </Box>
);

const ResponsiveGridItem: React.FC<{ xs?: number, sm?: number, md?: number, key?: any, children: React.ReactNode, sx?: any }> = ({
  xs = 12,
  sm,
  md,
  key,
  children,
  sx,
}) => {
  // Convert xs, sm, md to percentage widths
  let width = '100%';
  // Only minimal logic; apps can add more breakpoints.
  if (md) width = `${(md / 12) * 100}%`;
  else if (sm) width = `${(sm / 12) * 100}%`;
  else if (xs) width = `${(xs / 12) * 100}%`;
  return (
    <Box key={key} sx={{ flex: `0 0 ${width}`, maxWidth: width, ...sx }}>
      {children}
    </Box>
  );
};


export const LandingPageCustomizer: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<LandingSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [config, setConfig] = useState<LandingPageConfig>({
    sections: [],
    colorScheme: {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      background: '#ffffff',
      text: '#000000',
      accent: theme.palette.info.main,
      headerBg: '#ffffff',
      footerBg: '#1a1a1a',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingSize: 2.5,
      bodySize: 1,
    },
    layout: 'boxed',
    headerStyle: 'sticky',
    footerStyle: 'standard',
    animations: true,
    parallax: false,
    status: 'draft',
  });

  // Load configuration from API on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const loadedConfig = await getLandingPageConfig('draft');
        setConfig(loadedConfig);
        setHasUnsavedChanges(false);
      } catch (error: any) {
        console.error('Failed to load landing page config:', error);
        // Use default config if API fails
        toast.error('Failed to load configuration. Using default settings.');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [config]);

  const sortedSections = useMemo(() => {
    return [...config.sections].sort((a, b) => a.order - b.order);
  }, [config.sections]);

  const handleMoveUp = async (id: string) => {
    const index = config.sections.findIndex((s) => s.id === id);
    if (index <= 0) return;

    const newSections = [...config.sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
    }));

    setConfig((prev) => ({
      ...prev,
      sections: reorderedSections,
    }));

    try {
      await reorderLandingPageSections(reorderedSections.map((s) => s.id));
    } catch (error: any) {
      console.error('Failed to reorder sections:', error);
      toast.error('Failed to save section order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = config.sections.findIndex((s) => s.id === id);
    if (index < 0 || index >= config.sections.length - 1) return;

    const newSections = [...config.sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
    }));

    setConfig((prev) => ({
      ...prev,
      sections: reorderedSections,
    }));

    try {
      await reorderLandingPageSections(reorderedSections.map((s) => s.id));
    } catch (error: any) {
      console.error('Failed to reorder sections:', error);
      toast.error('Failed to save section order');
    }
  };

  const handleAddSection = async (type: SectionType) => {
    try {
      const newSection: Omit<LandingSection, 'id' | 'created_at' | 'updated_at'> =
        {
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
          visible: true,
          order: config.sections.length + 1,
          config: getDefaultConfigForType(type),
        };

      const createdSection = await createLandingPageSection(newSection);
      setConfig((prev) => ({
        ...prev,
        sections: [...prev.sections, createdSection],
      }));
      setSnackbar({
        open: true,
        message: 'Section added successfully',
        severity: 'success',
      });
      toast.success('Section added successfully');
    } catch (error: any) {
      console.error('Failed to add section:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add section',
        severity: 'error',
      });
      toast.error('Failed to add section. Please try again.');
    }
  };

  const getDefaultConfigForType = (type: SectionType): Record<string, any> => {
    const defaults: Record<SectionType, Record<string, any>> = {
      hero: {
        title: 'Welcome',
        subtitle: 'Subtitle text',
        description: '',
        backgroundImage: '',
        backgroundVideo: '',
        overlay: true,
        overlayOpacity: 0.5,
        ctaPrimaryText: 'Get Started',
        ctaPrimaryLink: '/register',
        ctaSecondaryText: '',
        ctaSecondaryLink: '',
        alignment: 'center',
        height: 'fullscreen',
      },
      banner: {
        images: [],
        autoplay: true,
        interval: 5000,
        indicators: true,
        arrows: true,
      },
      features: {
        title: 'Features',
        subtitle: '',
        items: [],
        columns: 3,
        layout: 'grid',
      },
      testimonials: {
        title: 'Testimonials',
        subtitle: '',
        testimonials: [],
        autoplay: true,
        interval: 5000,
      },
      cta: {
        text: 'Call to Action',
        description: '',
        buttonText: 'Click Here',
        buttonLink: '/',
        buttonStyle: 'contained',
        background: 'solid',
      },
      content: {
        title: 'Content Title',
        content: 'Content text here',
        image: '',
        imagePosition: 'left',
      },
      gallery: {
        title: 'Gallery',
        images: [],
        columns: 3,
        lightbox: true,
      },
      stats: {
        title: 'Statistics',
        stats: [],
      },
      services: {
        title: 'Our Services',
        subtitle: '',
        services: [],
        columns: 3,
      },
      pricing: {
        title: 'Pricing Plans',
        subtitle: '',
        plans: [],
        columns: 3,
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: '',
        questions: [],
      },
      contact: {
        title: 'Contact Us',
        subtitle: '',
        formFields: ['name', 'email', 'message'],
        showMap: true,
      },
    };
    return defaults[type] || {};
  };

  const handleEditSection = (section: LandingSection) => {
    setSelectedSection(JSON.parse(JSON.stringify(section))); // Deep copy
    setEditDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!selectedSection) return;

    try {
      await updateLandingPageSection(selectedSection.id, selectedSection);
      setConfig((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === selectedSection.id ? selectedSection : s
        ),
      }));
      setEditDialogOpen(false);
      setSelectedSection(null);
      setSnackbar({
        open: true,
        message: 'Section updated successfully',
        severity: 'success',
      });
      toast.success('Section updated successfully');
    } catch (error: any) {
      console.error('Failed to update section:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update section',
        severity: 'error',
      });
      toast.error('Failed to update section. Please try again.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteLandingPageSection(id);
      setConfig((prev) => ({
        ...prev,
        sections: prev.sections
          .filter((s) => s.id !== id)
          .map((section, index) => ({
            ...section,
            order: index + 1,
          })),
      }));
      setSnackbar({
        open: true,
        message: 'Section deleted successfully',
        severity: 'success',
      });
      toast.success('Section deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete section:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete section',
        severity: 'error',
      });
      toast.error('Failed to delete section. Please try again.');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const section = config.sections.find((s) => s.id === id);
    if (!section) return;

    const updatedSection = { ...section, visible: !section.visible };

    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? updatedSection : s
      ),
    }));

    try {
      await updateLandingPageSection(id, { visible: updatedSection.visible });
      toast.success('Section visibility updated');
    } catch (error: any) {
      console.error('Failed to update visibility:', error);
      // Revert on error
      setConfig((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? section : s
        ),
      }));
      toast.error('Failed to update visibility');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (config.id) {
        await updateLandingPageConfig(config.id, config);
      } else {
        const saved = await saveLandingPageConfig(config);
        setConfig(saved);
      }
      setHasUnsavedChanges(false);
      setSnackbar({
        open: true,
        message: 'Configuration saved successfully',
        severity: 'success',
      });
      toast.success('Configuration saved as draft');
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save configuration',
        severity: 'error',
      });
      toast.error('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const published = await publishLandingPageConfig(config);
      setConfig(published);
      setHasUnsavedChanges(false);
      setSnackbar({
        open: true,
        message: 'Landing page published successfully',
        severity: 'success',
      });
      toast.success('Landing page published! Changes are now live.');
    } catch (error: any) {
      console.error('Failed to publish configuration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to publish configuration',
        severity: 'error',
      });
      toast.error('Failed to publish. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const loadedConfig = await getLandingPageConfig('draft');
      setConfig(loadedConfig);
      setHasUnsavedChanges(false);
      toast.success('Configuration refreshed');
    } catch (error: any) {
      console.error('Failed to refresh:', error);
      toast.error('Failed to refresh configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Landing Page Content Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage content, texts, and settings for your landing page. Changes are synced to the live landing page.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(getLandingPagePreviewUrl(), '_blank')}
          >
            View Live Page
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            color="success"
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : 'Publish to Live'}
          </Button>
        </Stack>
      </Box>

      {hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to save your work!
        </Alert>
      )}

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'center' }}
          >
            Loading configuration...
          </Typography>
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<SettingsIcon />} label="Sections" />
        <Tab icon={<PaletteIcon />} label="Colors & Theme" />
        <Tab icon={<SettingsIcon />} label="Layout & Design" />
        <Tab icon={<TextIcon />} label="Typography" />
      </Tabs>

      {/* Content */}
      {tabValue === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
          }}
        >
          {/* Left: Sections List */}
          <Box sx={{ flex: { xs: '1', lg: '2' } }}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Page Sections ({sortedSections.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use arrows to reorder • Click to edit
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {sortedSections.map((section, index) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    onEdit={handleEditSection}
                    onDelete={handleDeleteSection}
                    onToggleVisibility={handleToggleVisibility}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedSections.length - 1}
                  />
                ))}
                {sortedSections.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No sections added yet. Add a section to get started.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Right: Add Sections */}
          <Box sx={{ flex: { xs: '1', lg: '1' }, minWidth: 280 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                position: 'sticky',
                top: 20,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Add Section
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  {[
                    {
                      type: 'hero',
                      label: 'Hero Section',
                      icon: <ImageIcon />,
                      desc: 'Main banner with CTA',
                    },
                    {
                      type: 'banner',
                      label: 'Banner/Carousel',
                      icon: <CarouselIcon />,
                      desc: 'Image carousel',
                    },
                    {
                      type: 'features',
                      label: 'Features',
                      icon: <TextIcon />,
                      desc: 'Service highlights',
                    },
                    {
                      type: 'services',
                      label: 'Services',
                      icon: <TextIcon />,
                      desc: 'Service showcase',
                    },
                    {
                      type: 'stats',
                      label: 'Statistics',
                      icon: <TextIcon />,
                      desc: 'Numbers & metrics',
                    },
                    {
                      type: 'testimonials',
                      label: 'Testimonials',
                      icon: <TextIcon />,
                      desc: 'Customer reviews',
                    },
                    {
                      type: 'gallery',
                      label: 'Gallery',
                      icon: <VideoIcon />,
                      desc: 'Image gallery',
                    },
                    {
                      type: 'pricing',
                      label: 'Pricing',
                      icon: <TextIcon />,
                      desc: 'Pricing plans',
                    },
                    {
                      type: 'faq',
                      label: 'FAQ',
                      icon: <TextIcon />,
                      desc: 'Frequently asked questions',
                    },
                    {
                      type: 'cta',
                      label: 'Call to Action',
                      icon: <CTAIcon />,
                      desc: 'CTA section',
                    },
                    {
                      type: 'content',
                      label: 'Content Block',
                      icon: <TextIcon />,
                      desc: 'Rich content',
                    },
                    {
                      type: 'contact',
                      label: 'Contact Form',
                      icon: <TextIcon />,
                      desc: 'Contact section',
                    },
                  ].map((item) => (
                    <Button
                      key={item.type}
                      variant="outlined"
                      startIcon={item.icon}
                      fullWidth
                      onClick={() => handleAddSection(item.type as SectionType)}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        py: 1.5,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        height: 'auto',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Color Scheme Tab -- replaced Grid with ResponsiveGridContainer/Item */}
      {tabValue === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Color Scheme
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveGridContainer spacing={3}>
              {Object.entries(config.colorScheme || {}).map(([key, value]) => (
                <ResponsiveGridItem xs={12} sm={6} md={4} key={key}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </InputLabel>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 40,
                          bgcolor: value,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                        component="input"
                        type="color"
                        value={value}
                        onChange={(
                          e: React.ChangeEvent<HTMLInputElement>
                        ) =>
                          setConfig((prev) => ({
                            ...prev,
                            colorScheme: {
                              ...(prev.colorScheme || {}),
                              [key]: e.target.value,
                            },
                          }))
                        }
                      />
                      <TextField
                        fullWidth
                        value={value}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            colorScheme: {
                              ...(prev.colorScheme || {}),
                              [key]: e.target.value,
                            },
                          }))
                        }
                        placeholder="#000000"
                        size="small"
                      />
                    </Box>
                  </FormControl>
                </ResponsiveGridItem>
              ))}
            </ResponsiveGridContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Layout & Design Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Page Layout</InputLabel>
                <Select
                  value={config.layout}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      layout: e.target.value as any,
                    }))
                  }
                  label="Page Layout"
                >
                  <MenuItem value="wide">Wide (1200px max)</MenuItem>
                  <MenuItem value="boxed">Boxed (1400px max)</MenuItem>
                  <MenuItem value="fullwidth">Full Width</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Header Style</InputLabel>
                <Select
                  value={config.headerStyle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      headerStyle: e.target.value as any,
                    }))
                  }
                  label="Header Style"
                >
                  <MenuItem value="transparent">Transparent</MenuItem>
                  <MenuItem value="solid">Solid Background</MenuItem>
                  <MenuItem value="sticky">Sticky Header</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Footer Style</InputLabel>
                <Select
                  value={config.footerStyle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      footerStyle: e.target.value as any,
                    }))
                  }
                  label="Footer Style"
                >
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="extended">Extended</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.animations}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        animations: e.target.checked,
                      }))
                    }
                  />
                }
                label="Enable Animations"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.parallax}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        parallax: e.target.checked,
                      }))
                    }
                  />
                }
                label="Enable Parallax Effects"
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Typography Tab -- replaced inner Grid with ResponsiveGridContainer/Item */}
      {tabValue === 3 && (
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Typography Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveGridContainer spacing={3}>
              <ResponsiveGridItem xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Heading Font</InputLabel>
                  <Select
                    value={config.typography?.headingFont || 'Inter'}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        typography: {
                          ...(prev.typography || {}),
                          headingFont: e.target.value,
                        },
                      }))
                    }
                    label="Heading Font"
                  >
                    <MenuItem value="Inter">Inter</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Poppins">Poppins</MenuItem>
                    <MenuItem value="Montserrat">Montserrat</MenuItem>
                    <MenuItem value="Open Sans">Open Sans</MenuItem>
                  </Select>
                </FormControl>
              </ResponsiveGridItem>
              <ResponsiveGridItem xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Body Font</InputLabel>
                  <Select
                    value={config.typography?.bodyFont || 'Inter'}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        typography: {
                          ...(prev.typography || {}),
                          bodyFont: e.target.value,
                        },
                      }))
                    }
                    label="Body Font"
                  >
                    <MenuItem value="Inter">Inter</MenuItem>
                    <MenuItem value="Roboto">Roboto</MenuItem>
                    <MenuItem value="Poppins">Poppins</MenuItem>
                    <MenuItem value="Montserrat">Montserrat</MenuItem>
                    <MenuItem value="Open Sans">Open Sans</MenuItem>
                  </Select>
                </FormControl>
              </ResponsiveGridItem>
              <ResponsiveGridItem xs={12} md={6}>
                <Typography gutterBottom>
                  Heading Size: {config.typography?.headingSize || 2.5}rem
                </Typography>
                <Slider
                  value={config.typography?.headingSize || 2.5}
                  onChange={(_, value) =>
                    setConfig((prev) => ({
                      ...prev,
                      typography: {
                        ...(prev.typography || {}),
                        headingSize: value as number,
                      },
                    }))
                  }
                  min={1.5}
                  max={4}
                  step={0.1}
                  marks
                />
              </ResponsiveGridItem>
              <ResponsiveGridItem xs={12} md={6}>
                <Typography gutterBottom>
                  Body Size: {config.typography?.bodySize || 1}rem
                </Typography>
                <Slider
                  value={config.typography?.bodySize || 1}
                  onChange={(_, value) =>
                    setConfig((prev) => ({
                      ...prev,
                      typography: {
                        ...(prev.typography || {}),
                        bodySize: value as number,
                      },
                    }))
                  }
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  marks
                />
              </ResponsiveGridItem>
            </ResponsiveGridContainer>
          </CardContent>
        </Card>
      )}

      {/* Edit Section Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <EditIcon />
            <Typography variant="h6">
              Edit Section: {selectedSection?.title}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedSection && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Section Title"
                value={selectedSection.title}
                onChange={(e) =>
                  setSelectedSection({
                    ...selectedSection,
                    title: e.target.value,
                  })
                }
              />

              {selectedSection.type === 'hero' && (
                <>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>
                        Content
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Hero Title"
                          value={selectedSection.config.title || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                title: e.target.value,
                              },
                            })
                          }
                        />
                        <TextField
                          fullWidth
                          label="Hero Subtitle"
                          value={selectedSection.config.subtitle || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                subtitle: e.target.value,
                              },
                            })
                          }
                        />
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={selectedSection.config.description || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                description: e.target.value,
                              },
                            })
                          }
                        />
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>
                        Call to Action
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Primary CTA Text"
                          value={selectedSection.config.ctaPrimaryText || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                ctaPrimaryText: e.target.value,
                              },
                            })
                          }
                        />
                        <TextField
                          fullWidth
                          label="Primary CTA Link"
                          value={selectedSection.config.ctaPrimaryLink || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                ctaPrimaryLink: e.target.value,
                              },
                            })
                          }
                        />
                        <TextField
                          fullWidth
                          label="Secondary CTA Text"
                          value={selectedSection.config.ctaSecondaryText || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                ctaSecondaryText: e.target.value,
                              },
                            })
                          }
                        />
                        <TextField
                          fullWidth
                          label="Secondary CTA Link"
                          value={selectedSection.config.ctaSecondaryLink || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                ctaSecondaryLink: e.target.value,
                              },
                            })
                          }
                        />
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>
                        Background & Media
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Button variant="outlined" startIcon={<UploadIcon />} component="label">
                          Upload Background Image
                          <input type="file" hidden accept="image/*" />
                        </Button>
                        <TextField
                          fullWidth
                          label="Background Image URL"
                          value={selectedSection.config.backgroundImage || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              config: {
                                ...selectedSection.config,
                                backgroundImage: e.target.value,
                              },
                            })
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedSection.config.overlay || false}
                              onChange={(e) =>
                                setSelectedSection({
                                  ...selectedSection,
                                  config: {
                                    ...selectedSection.config,
                                    overlay: e.target.checked,
                                  },
                                })
                              }
                            />
                          }
                          label="Enable Overlay"
                        />
                        {selectedSection.config.overlay && (
                          <Box>
                            <Typography gutterBottom>
                              Overlay Opacity:{' '}
                              {(
                                (selectedSection.config.overlayOpacity || 0.5) *
                                100
                              ).toFixed(0)}
                              %
                            </Typography>
                            <Slider
                              value={
                                selectedSection.config.overlayOpacity || 0.5
                              }
                              onChange={(_, value) =>
                                setSelectedSection({
                                  ...selectedSection,
                                  config: {
                                    ...selectedSection.config,
                                    overlayOpacity: value as number,
                                  },
                                })
                              }
                              min={0}
                              max={1}
                              step={0.1}
                            />
                          </Box>
                        )}
                        <FormControl fullWidth>
                          <InputLabel>Alignment</InputLabel>
                          <Select
                            value={selectedSection.config.alignment || 'center'}
                            onChange={(e) =>
                              setSelectedSection({
                                ...selectedSection,
                                config: {
                                  ...selectedSection.config,
                                  alignment: e.target.value,
                                },
                              })
                            }
                            label="Alignment"
                          >
                            <MenuItem value="left">Left</MenuItem>
                            <MenuItem value="center">Center</MenuItem>
                            <MenuItem value="right">Right</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth>
                          <InputLabel>Height</InputLabel>
                          <Select
                            value={
                              selectedSection.config.height || 'fullscreen'
                            }
                            onChange={(e) =>
                              setSelectedSection({
                                ...selectedSection,
                                config: {
                                  ...selectedSection.config,
                                  height: e.target.value,
                                },
                              })
                            }
                            label="Height"
                          >
                            <MenuItem value="auto">Auto</MenuItem>
                            <MenuItem value="small">Small</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="large">Large</MenuItem>
                            <MenuItem value="fullscreen">
                              Fullscreen
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}

              {selectedSection.type === 'features' && (
                <>
                  <TextField
                    fullWidth
                    label="Section Title"
                    value={selectedSection.config.title || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Subtitle"
                    value={selectedSection.config.subtitle || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          subtitle: e.target.value,
                        },
                      })
                    }
                  />
                  <FormControl fullWidth>
                    <InputLabel>Columns</InputLabel>
                    <Select
                      value={selectedSection.config.columns || 3}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          config: {
                            ...selectedSection.config,
                            columns: e.target.value,
                          },
                        })
                      }
                      label="Columns"
                    >
                      <MenuItem value={2}>2 Columns</MenuItem>
                      <MenuItem value={3}>3 Columns</MenuItem>
                      <MenuItem value={4}>4 Columns</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" startIcon={<AddIcon />}>
                    Add Feature Item
                  </Button>
                </>
              )}

              {selectedSection.type === 'cta' && (
                <>
                  <TextField
                    fullWidth
                    label="CTA Text"
                    value={selectedSection.config.text || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          text: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={2}
                    value={selectedSection.config.description || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          description: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Button Text"
                    value={selectedSection.config.buttonText || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          buttonText: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    label="Button Link"
                    value={selectedSection.config.buttonLink || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          buttonLink: e.target.value,
                        },
                      })
                    }
                  />
                  <FormControl fullWidth>
                    <InputLabel>Button Style</InputLabel>
                    <Select
                      value={selectedSection.config.buttonStyle || 'contained'}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          config: {
                            ...selectedSection.config,
                            buttonStyle: e.target.value,
                          },
                        })
                      }
                      label="Button Style"
                    >
                      <MenuItem value="contained">Contained</MenuItem>
                      <MenuItem value="outlined">Outlined</MenuItem>
                      <MenuItem value="text">Text</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Background</InputLabel>
                    <Select
                      value={selectedSection.config.background || 'solid'}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          config: {
                            ...selectedSection.config,
                            background: e.target.value,
                          },
                        })
                      }
                      label="Background"
                    >
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="gradient">Gradient</MenuItem>
                      <MenuItem value="image">Image</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {selectedSection.type === 'stats' && (
                <>
                  <TextField
                    fullWidth
                    label="Section Title"
                    value={selectedSection.config.title || ''}
                    onChange={(e) =>
                      setSelectedSection({
                        ...selectedSection,
                        config: {
                          ...selectedSection.config,
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <Button variant="outlined" startIcon={<AddIcon />}>
                    Add Statistic
                  </Button>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSection}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog (replace Grid with flex layouts) */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Landing Page Preview</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(getLandingPagePreviewUrl(), '_blank')}
            >
              Open in New Tab
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              minHeight: 600,
              bgcolor: 'grey.50',
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                This is a content preview. The actual landing page is hosted
                separately.
                <Link
                  href={getLandingPagePreviewUrl()}
                  target="_blank"
                  sx={{ ml: 1 }}
                >
                  View live page <OpenInNewIcon fontSize="small" />
                </Link>
              </Typography>
            </Alert>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Content Preview
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {sortedSections
              .filter((s) => s.visible)
              .map((section) => (
                <Paper
                  key={section.id}
                  sx={{
                    p: 3,
                    mb: 2,
                    bgcolor: 'white',
                    border: '1px dashed',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {section.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Type: {section.type} | Order: {section.order}
                  </Typography>
                  {section.type === 'hero' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {section.config.title || 'Hero Title'}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {section.config.subtitle || 'Hero Subtitle'}
                      </Typography>
                      {section.config.description && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {section.config.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        {section.config.ctaPrimaryText && (
                          <Button
                            variant="contained"
                            href={section.config.ctaPrimaryLink}
                            target="_blank"
                          >
                            {section.config.ctaPrimaryText}
                          </Button>
                        )}
                        {section.config.ctaSecondaryText && (
                          <Button
                            variant="outlined"
                            href={section.config.ctaSecondaryLink}
                            target="_blank"
                          >
                            {section.config.ctaSecondaryText}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  )}
                  {section.type === 'features' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {section.config.title || 'Features'}
                      </Typography>
                      {section.config.subtitle && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {section.config.subtitle}
                        </Typography>
                      )}
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: (theme) => theme.spacing(2)
                      }}>
                        {section.config.items?.map((item: any, idx: number) => (
                          <Box
                            key={idx}
                            sx={{
                              flex: {
                                xs: '0 0 100%',
                                sm: '0 0 50%',
                                md: '0 0 25%',
                              },
                              maxWidth: {
                                xs: '100%',
                                sm: '50%',
                                md: '25%',
                              },
                            }}
                          >
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h6">{item.title}</Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.description}
                              </Typography>
                              {item.link && (
                                <Button
                                  size="small"
                                  href={item.link}
                                  sx={{ mt: 1 }}
                                >
                                  Learn More
                                </Button>
                              )}
                            </Paper>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {section.type === 'cta' && (
                    <Box
                      sx={{
                        mt: 2,
                        textAlign: 'center',
                        p: 4,
                        bgcolor: 'primary.light',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {section.config.text || 'Call to Action'}
                      </Typography>
                      {section.config.description && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {section.config.description}
                        </Typography>
                      )}
                      {section.config.buttonText && (
                        <Button
                          variant="contained"
                          size="large"
                          href={section.config.buttonLink}
                          target="_blank"
                        >
                          {section.config.buttonText}
                        </Button>
                      )}
                    </Box>
                  )}
                  {section.type === 'stats' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h5" sx={{ mb: 2 }}>
                        {section.config.title || 'Statistics'}
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: (theme) => theme.spacing(2)
                      }}>
                        {section.config.stats?.map(
                          (stat: any, idx: number) => (
                            <Box
                              key={idx}
                              sx={{
                                flex: {
                                  xs: '0 0 100%',
                                  sm: '0 0 50%',
                                  md: '0 0 25%',
                                },
                                maxWidth: {
                                  xs: '100%',
                                  sm: '50%',
                                  md: '25%',
                                },
                              }}
                            >
                              <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography
                                  variant="h4"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'primary.main',
                                  }}
                                >
                                  {stat.value}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {stat.label}
                                </Typography>
                              </Paper>
                            </Box>
                          ),
                        )}
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            {sortedSections.filter((s) => s.visible).length === 0 && (
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ py: 4 }}
              >
                No visible sections to preview
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPageCustomizer;
