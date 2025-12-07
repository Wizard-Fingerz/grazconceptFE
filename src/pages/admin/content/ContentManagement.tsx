import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Article as ArticleIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';

interface ContentItem {
  id: string;
  title: string;
  type: 'banner' | 'article' | 'campaign';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const ContentManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Study Abroad Banner',
      type: 'banner',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-03-10',
    },
    {
      id: '2',
      title: 'Travel Tips Article',
      type: 'article',
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-03-15',
    },
    {
      id: '3',
      title: 'Summer Campaign',
      type: 'campaign',
      status: 'inactive',
      createdAt: '2024-01-20',
      updatedAt: '2024-02-28',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <ImageIcon />;
      case 'article':
        return <ArticleIcon />;
      case 'campaign':
        return <CampaignIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage banners, articles, and marketing campaigns
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Add Content
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<ImageIcon />} label="Banners" />
        <Tab icon={<ArticleIcon />} label="Articles" />
        <Tab icon={<CampaignIcon />} label="Campaigns" />
      </Tabs>

      {/* Content Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contentItems
                  .filter((item) => {
                    if (tabValue === 0) return item.type === 'banner';
                    if (tabValue === 1) return item.type === 'article';
                    if (tabValue === 2) return item.type === 'campaign';
                    return true;
                  })
                  .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getTypeIcon(item.type)}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={item.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.createdAt}</TableCell>
                      <TableCell>{item.updatedAt}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Content</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Title" variant="outlined" />
            <TextField fullWidth label="Description" multiline rows={4} variant="outlined" />
            <TextField fullWidth type="file" label="Upload Image" variant="outlined" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManagement;

