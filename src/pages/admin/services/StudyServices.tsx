import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  Stack,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

// Custom responsive Statistics Cards Grid replacement
const StatisticsCardsRow: React.FC<{ stats: { total: number; active: number; totalApplications: number; countries: number }; theme: any; }> = ({ stats, theme }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 3,
      mb: 4,
      width: '100%',
      justifyContent: { xs: 'center', sm: 'flex-start' }
    }}
  >
    <Card sx={{ borderRadius: 2, boxShadow: 2, flex: 1, minWidth: 220 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {stats.total}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Total Programs
        </Typography>
      </CardContent>
    </Card>
    <Card sx={{ borderRadius: 2, boxShadow: 2, flex: 1, minWidth: 220 }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
          {stats.active}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Active Programs
        </Typography>
      </CardContent>
    </Card>
    <Card sx={{ borderRadius: 2, boxShadow: 2, flex: 1, minWidth: 220 }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
          {stats.totalApplications}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Applications
        </Typography>
      </CardContent>
    </Card>
    <Card sx={{ borderRadius: 2, boxShadow: 2, flex: 1, minWidth: 220 }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {stats.countries}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Countries
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

interface StudyProgram {
  id: string;
  institution: string;
  country: string;
  program: string;
  degree: string;
  intake: string;
  status: 'Active' | 'Inactive' | 'Pending';
  applications: number;
  lastUpdated: string;
}

export const StudyServices: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [, setSelectedProgram] = useState<StudyProgram | null>(null);

  // Mock data
  const [programs] = useState<StudyProgram[]>([
    {
      id: 'STU001',
      institution: 'University of Toronto',
      country: 'Canada',
      program: 'Computer Science',
      degree: 'MSc',
      intake: 'Fall 2025',
      status: 'Active',
      applications: 45,
      lastUpdated: '2024-03-20',
    },
    {
      id: 'STU002',
      institution: 'Oxford University',
      country: 'UK',
      program: 'Mathematics',
      degree: 'MSc',
      intake: 'Fall 2025',
      status: 'Active',
      applications: 32,
      lastUpdated: '2024-03-19',
    },
    {
      id: 'STU003',
      institution: 'MIT',
      country: 'USA',
      program: 'Engineering',
      degree: 'PhD',
      intake: 'Spring 2025',
      status: 'Active',
      applications: 28,
      lastUpdated: '2024-03-18',
    },
    {
      id: 'STU004',
      institution: 'University of Melbourne',
      country: 'Australia',
      program: 'Business Administration',
      degree: 'MBA',
      intake: 'Fall 2025',
      status: 'Pending',
      applications: 0,
      lastUpdated: '2024-03-15',
    },
  ]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, program: StudyProgram) => {
    setAnchorEl(event.currentTarget);
    setSelectedProgram(program);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProgram(null);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return programs.filter(
      (program) =>
        (!term ||
          program.institution.toLowerCase().includes(term) ||
          program.program.toLowerCase().includes(term) ||
          program.id.toLowerCase().includes(term)) &&
        (!countryFilter || program.country.toLowerCase().includes(countryFilter.toLowerCase())) &&
        (!statusFilter || program.status === statusFilter) &&
        (!degreeFilter || program.degree === degreeFilter)
    );
  }, [programs, searchTerm, countryFilter, statusFilter, degreeFilter]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = programs.length;
    const active = programs.filter((p) => p.status === 'Active').length;
    const totalApplications = programs.reduce((sum, p) => sum + p.applications, 0);
    const countries = new Set(programs.map((p) => p.country)).size;
    return { total, active, totalApplications, countries };
  }, [programs]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'institution',
        headerName: 'Institution',
        flex: 1.5,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              <SchoolIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.institution}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'country',
        headerName: 'Country',
        flex: 0.8,
      },
      {
        field: 'program',
        headerName: 'Program',
        flex: 1.2,
      },
      {
        field: 'degree',
        headerName: 'Degree',
        flex: 0.8,
      },
      {
        field: 'intake',
        headerName: 'Intake',
        flex: 0.8,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.8,
        renderCell: (params) => (
          <Chip label={params.row.status} color={getStatusColor(params.row.status) as any} size="small" />
        ),
      },
      {
        field: 'applications',
        headerName: 'Applications',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.applications}
          </Typography>
        ),
      },
      {
        field: 'lastUpdated',
        headerName: 'Last Updated',
        flex: 1,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.5,
        sortable: false,
        renderCell: (params) => (
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Study Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage study abroad programs and institutions
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Program
          </Button>
        </Stack>
      </Box>

      {/* Statistics Cards: replaced Grid with flex row */}
      <StatisticsCardsRow stats={stats} theme={theme} />

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search by institution, program, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />
            <TextField
              placeholder="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Degree</InputLabel>
              <Select value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)} label="Degree">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="BSc">BSc</MenuItem>
                <MenuItem value="MSc">MSc</MenuItem>
                <MenuItem value="MBA">MBA</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<FilterIcon />}>
              More Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <CustomDataTable
            rows={pagedRows}
            columns={columns}
            rowCount={filtered.length}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Program
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Program
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudyServices;

