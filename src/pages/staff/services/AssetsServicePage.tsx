import React, { useMemo, useState } from 'react';
import { Box, MenuItem, Paper, Stack, TextField, Typography, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface AssetRow {
  id: string;
  category: string; // Car, Phone, TV, Gadget
  name: string;
  price: number;
  stock: number;
}

const mock: AssetRow[] = [
  { id: 'as1', category: 'Car', name: 'Toyota Camry', price: 12000000, stock: 3 },
  { id: 'as2', category: 'Phone', name: 'iPhone 15', price: 850000, stock: 10 },
];

export const AssetsServicePage: React.FC = () => {
  const [rows] = useState<AssetRow[]>(mock);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => (
      (!term || r.name.toLowerCase().includes(term)) &&
      (!category || r.category.toLowerCase().includes(category.toLowerCase()))
    ));
  }, [rows, search, category]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'category', headerName: 'Category', flex: 0.8 },
    { field: 'name', headerName: 'Item', flex: 1 },
    { field: 'price', headerName: 'Price (₦)', flex: 0.8, valueGetter: (_v, row: AssetRow) => row.price.toLocaleString() },
    { field: 'stock', headerName: 'Stock', flex: 0.6 },
  ], []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Service: Asset Sales</Typography>
        <Button variant="contained">Add Item</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth placeholder="Search by item" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <TextField placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 160 }} />
        </Stack>
      </Paper>

      <CustomDataTable
        rows={pagedRows}
        columns={columns}
        rowCount={filtered.length}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default AssetsServicePage;


