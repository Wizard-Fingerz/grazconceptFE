import { Paper, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridPaginationModel, GridColDef } from '@mui/x-data-grid';

interface CustomDataTableProps {
    rows: any[];
    columns: GridColDef[];  // Correct type for columns
    rowCount: number;
    pageSizeOptions?: number[];
    paginationModel: GridPaginationModel;
    isLoading?: boolean;
    isError?: boolean;
    onPaginationModelChange: (newPaginationModel: GridPaginationModel) => void;
    columnVisibilityModel?: any;
    onColumnVisibilityModelChange?: (newColumnVisibilityModel: any) => void;
}

const CustomDataTable = ({
    rows,
    columns,
    rowCount,
    pageSizeOptions = [5, 10, 1],
    paginationModel,
    isLoading = false,
    isError = false,
    onPaginationModelChange,
    columnVisibilityModel = undefined, 
    onColumnVisibilityModelChange = undefined,
}: CustomDataTableProps) => {
    return (
        <Paper sx={{ overflowX: 'auto' }}>
            {isLoading ? (
                <div style={{ margin: 16, textAlign: 'center', padding: 100 }}>
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ padding: 2, textAlign: 'center' }}
                    >
                        Loading data, please wait...
                    </Typography>
                </div>
            ) : isError ? (
                <div style={{ margin: 16, textAlign: 'center', padding: 100 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Network Error
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Please check your connection and try again.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            padding: '6px 16px',
                            marginTop: 2,
                            borderRadius: 2,
                        }}
                        onClick={() => window.location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
            ) : !rows || rows.length === 0 ? (
                <div style={{ margin: 16, textAlign: 'center', padding: 40 }}>
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ padding: 2, textAlign: 'center' }}
                    >
                        No data available.
                    </Typography>
                </div>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    paginationMode="server"
                    rowCount={rowCount}
                    paginationModel={paginationModel}
                    onPaginationModelChange={onPaginationModelChange}
                    pageSizeOptions={pageSizeOptions}
                    checkboxSelection
                    sx={{ border: 0, width: '100%' }}
                    loading={isLoading}
                    pagination
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={onColumnVisibilityModelChange}
                />
            )}
        </Paper>
    );
};

export default CustomDataTable;
