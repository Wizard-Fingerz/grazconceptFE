import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface FAQArticle {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const FLAT_ELEVATION = 0;
const FLAT_RADIUS = 2;

export const FAQManagement: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQArticle | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [faqs] = useState<FAQArticle[]>([
    {
      id: '1',
      question: 'How do I apply for a visa?',
      answer: 'You can apply for a visa through our online portal by creating an account and filling out the application form.',
      category: 'Visa',
      is_active: true,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
    {
      id: '2',
      question: 'What documents do I need?',
      answer: 'The required documents vary by visa type. Please check the specific requirements for your visa category.',
      category: 'Documents',
      is_active: true,
      created_at: '2024-01-16',
      updated_at: '2024-01-16',
    },
  ]);

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch = !search ||
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !filterCategory || faq.category === filterCategory;
      const matchesActive = !filterActive || 
        (filterActive === 'active' && faq.is_active) ||
        (filterActive === 'inactive' && !faq.is_active);
      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [faqs, search, filterCategory, filterActive]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', flex: 0.8 },
    {
      field: 'question',
      headerName: 'Question',
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.question}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      renderCell: (params) => (
        <Chip label={params.row.category} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.is_active ? 'Active' : 'Inactive'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    { field: 'created_at', headerName: 'Created', flex: 1 },
    { field: 'updated_at', headerName: 'Updated', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setSelectedFAQ(params.row);
              setDialogOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], []);

  const stats = [
    { label: 'Total FAQs', value: faqs.length, icon: <HelpIcon />, color: theme.palette.primary.main },
    { label: 'Active', value: faqs.filter((f) => f.is_active).length, icon: <HelpIcon />, color: theme.palette.success.main },
    { label: 'Categories', value: new Set(faqs.map((f) => f.category)).size, icon: <HelpIcon />, color: theme.palette.info.main },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            FAQ Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage frequently asked questions and knowledge base articles
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedFAQ(null);
            setDialogOpen(true);
          }}>
            Add FAQ
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            elevation={FLAT_ELEVATION}
            sx={{
              flex: '1 1 200px',
              minWidth: 178,
              maxWidth: { xs: '100%', sm: 230, md: 275 },
              borderRadius: FLAT_RADIUS,
              px: 2.4,
              py: 2.6,
              boxShadow: 0,
              border: `1px solid ${theme.palette.grey[100]}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              background: 'linear-gradient(108deg, #f4f7fa 0%, #fdfdff 95%)',
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                mb: 1.4,
                bgcolor: stat.color,
                color: '#fff',
                fontSize: 24,
                boxShadow: '0 1px 8px 0 rgba(0,0,0,0.02)',
              }}
              variant="rounded"
            >
              {stat.icon}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              select
              size="small"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Categories</option>
              {Array.from(new Set(faqs.map((f) => f.category))).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: FLAT_RADIUS, boxShadow: FLAT_ELEVATION }}>
        <CardContent>
          <CustomDataTable
            rows={filteredFAQs}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            isLoading={false} rowCount={filteredFAQs.length}          />
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFAQ ? 'Edit FAQ' : 'Add New FAQ'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Question"
              defaultValue={selectedFAQ?.question}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Answer"
              defaultValue={selectedFAQ?.answer}
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Category"
              defaultValue={selectedFAQ?.category}
            />
            <FormControlLabel
              control={<Switch defaultChecked={selectedFAQ?.is_active ?? true} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            {selectedFAQ ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQManagement;

