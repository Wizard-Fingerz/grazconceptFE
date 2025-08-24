import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, Chip, IconButton, InputAdornment, MenuItem, Paper, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import UploadIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomDataTable from '../../../components/CustomTable/mui';
import type { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import userServices from '../../../services/user';

type DocumentStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

interface ClientDocumentRow {
  id: string;
  name: string;        // file name
  client: string;
  type: number;        // type id
  typeTerm: string;    // type term for display
  status: DocumentStatus;
  uploadedAt: string;  // ISO date
}

interface ClientOption {
  id: number | string;
  name: string;
}

interface DocumentTypeOption {
  id: number;
  term: string;
}

const statusColors: Record<DocumentStatus, 'default' | 'success' | 'warning' | 'info' | 'error' | 'primary' | 'secondary'> = {
  Pending: 'info',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

export const DocumentsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<ClientDocumentRow[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DocumentStatus | ''>('');
  const [docType, setDocType] = useState<number | ''>('');

  // For upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | number>('');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadDocType, setUploadDocType] = useState<number | ''>('');
  const [uploading, setUploading] = useState(false);

  // For client list
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // For document type list
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [documentTypesLoading, setDocumentTypesLoading] = useState(false);

  // For documents loading
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    let mounted = true;
    setClientsLoading(true);
    userServices.getAllClient()
      .then((data: any) => {
        if (!mounted) return;
        // Try to map to id and name
        let clientList: ClientOption[] = [];
        if (Array.isArray(data)) {
          clientList = data.map((c: any) => ({
            id: c.id,
            name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || String(c.id),
          }));
        } else if (data && Array.isArray(data.results)) {
          clientList = data.results.map((c: any) => ({
            id: c.id,
            name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || String(c.id),
          }));
        }
        setClients(clientList);
      })
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false));
    return () => { mounted = false; };
  }, []);

  // Fetch document types on mount
  useEffect(() => {
    let mounted = true;
    setDocumentTypesLoading(true);
    userServices.getAllDocumentType()
      .then((data: any) => {
        if (!mounted) return;
        // Try to extract document type objects from API response
        let types: DocumentTypeOption[] = [];
        if (Array.isArray(data)) {
          types = data.map((d: any) => {
            let idNum: number | undefined = undefined;
            if (typeof d.id === 'number') idNum = d.id;
            else if (typeof d.value === 'number') idNum = d.value;
            else if (typeof d.term === 'number') idNum = d.term;
            else if (!isNaN(Number(d.id))) idNum = Number(d.id);
            else if (!isNaN(Number(d.value))) idNum = Number(d.value);
            else if (!isNaN(Number(d.term))) idNum = Number(d.term);
            return {
              id: idNum!,
              term: d.term ?? String(d.term ?? d),
            };
          });
        } else if (data && Array.isArray(data.results)) {
          types = data.results.map((d: any) => {
            let idNum: number | undefined = undefined;
            if (typeof d.id === 'number') idNum = d.id;
            else if (typeof d.value === 'number') idNum = d.value;
            else if (typeof d.term === 'number') idNum = d.term;
            else if (!isNaN(Number(d.id))) idNum = Number(d.id);
            else if (!isNaN(Number(d.value))) idNum = Number(d.value);
            else if (!isNaN(Number(d.term))) idNum = Number(d.term);
            return {
              id: idNum!,
              term: d.term ?? String(d.term ?? d),
            };
          });
        }
        // Filter out types with no id or term, and ensure id is a number
        setDocumentTypes(types.filter(t => typeof t.id === 'number' && t.term));
      })
      .catch(() => setDocumentTypes([]))
      .finally(() => setDocumentTypesLoading(false));
    return () => { mounted = false; };
  }, []);

  // Fetch all client documents from backend
  const fetchDocuments = React.useCallback(() => {
    setDocumentsLoading(true);
    userServices.getAllClientsDocument()
      .then((data: any) => {
        // Try to normalize the data to ClientDocumentRow[]
        let docs: ClientDocumentRow[] = [];
        let items: any[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.results)) {
          items = data.results;
        }
        docs = items.map((doc: any) => {
          // Try to get type id and term
          let typeId: number | undefined = undefined;
          let typeTerm: string = '';

          // Try to extract type id
          if (typeof doc.type === 'number') typeId = doc.type;
          else if (typeof doc.document_type === 'number') typeId = doc.document_type;
          else if (typeof doc.type_id === 'number') typeId = doc.type_id;
          else if (!isNaN(Number(doc.type))) typeId = Number(doc.type);
          else if (!isNaN(Number(doc.document_type))) typeId = Number(doc.document_type);
          else if (!isNaN(Number(doc.type_id))) typeId = Number(doc.type_id);

          // Try to extract type term robustly
          // Accept both snake_case and camelCase
          typeTerm =
            doc.typeTerm ||
            doc.type_term ||
            doc.type_name ||
            doc.type ||
            doc.document_type ||
            'Unknown';

          // If we have documentTypes loaded, try to match id to term if typeTerm is not a string or is 'Unknown'
          if (
            typeId !== undefined &&
            (!typeTerm || typeTerm === 'Unknown' || typeof typeTerm !== 'string')
          ) {
            const found = documentTypes.find(dt => dt.id === typeId);
            if (found) typeTerm = found.term;
          }

          // Defensive: if still not a string, fallback
          if (typeof typeTerm !== 'string') {
            typeTerm = String(typeTerm ?? 'Unknown');
          }

          // --- FIX: Ensure client name is always extracted correctly ---
          // Priority: client_name, client_obj.name, client_obj.first_name + last_name, client, fallback 'Unknown'
          let clientName = '';
          if (doc.client_name && typeof doc.client_name === 'string') {
            clientName = doc.client_name;
          } else if (doc.client_obj && typeof doc.client_obj === 'object') {
            if (doc.client_obj.name && typeof doc.client_obj.name === 'string') {
              clientName = doc.client_obj.name;
            } else if (
              (doc.client_obj.first_name && typeof doc.client_obj.first_name === 'string') ||
              (doc.client_obj.last_name && typeof doc.client_obj.last_name === 'string')
            ) {
              clientName = `${doc.client_obj.first_name || ''} ${doc.client_obj.last_name || ''}`.trim();
            }
          } else if (doc.client && typeof doc.client === 'string') {
            clientName = doc.client;
          } else {
            clientName = 'Unknown';
          }

          return {
            id: String(doc.id),
            name: doc.name || doc.file_name || doc.filename || doc.file || 'Document',
            client: clientName,
            type: typeId !== undefined ? typeId : -1,
            typeTerm,
            status: (doc.status || 'Pending') as DocumentStatus,
            uploadedAt: doc.uploaded_at
              ? doc.uploaded_at.slice(0, 10)
              : doc.created_at
              ? doc.created_at.slice(0, 10)
              : '',
          };
        });
        setRows(docs);
      })
      .catch(() => setRows([]))
      .finally(() => setDocumentsLoading(false));
  }, [documentTypes]);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchTerm = !term || r.name.toLowerCase().includes(term) || r.client.toLowerCase().includes(term);
      const matchStatus = !status || r.status === status;
      // For filtering, match by type id
      let matchType = true;
      if (docType !== '') {
        matchType = r.type === docType;
      }
      return matchTerm && matchStatus && matchType;
    });
  }, [rows, search, status, docType]);

  const pagedRows = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return filtered.slice(start, end);
  }, [filtered, paginationModel]);

  // Remove valueGetter and just use the value from the row directly for typeTerm
  const columns: GridColDef[] = useMemo(() => [
    { field: 'name', headerName: 'Document', flex: 1.2 },
    { field: 'client', headerName: 'Client', flex: 1 },
    { 
      field: 'typeTerm', 
      headerName: 'Type', 
      flex: 0.8,
      // Remove valueGetter, just use row.typeTerm
    },
    { field: 'uploadedAt', headerName: 'Uploaded', flex: 0.8 },
    {
      field: 'status', headerName: 'Status', flex: 0.8, sortable: false,
      renderCell: (p: GridRenderCellParams<ClientDocumentRow, any>) => (
        <Chip label={p.row.status} color={statusColors[p.row.status as DocumentStatus]} size="small" />
      )
    },
    {
      field: 'actions', headerName: 'Actions', flex: 0.8, align: 'right', headerAlign: 'right', sortable: false,
      renderCell: () => (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
          <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
          <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      )
    },
  ], []);

  // Open upload dialog
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
    setSelectedClient('');
    setUploadFiles(null);
    setUploadDocType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // When files are selected in dialog
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(e.target.files);
  };

  // Confirm upload: submit to backend and refresh list
  const handleUploadConfirm = async () => {
    if (!uploadFiles || !selectedClient || uploadDocType === '') return;
    setUploading(true);
    try {
      // Prepare FormData for each file
      const uploadPromises: Promise<any>[] = [];
      for (let i = 0; i < uploadFiles.length; i++) {
        const f = uploadFiles[i];
        const formData = new FormData();
        formData.append('file', f);
        formData.append('client', String(selectedClient));
        formData.append('type', String(uploadDocType)); // send type id as number (but FormData is always string)
        // You may need to adjust the field names above to match your backend API
        uploadPromises.push(userServices.uploadClientDocument(formData));
      }
      await Promise.all(uploadPromises);
      // After upload, refresh the documents list
      fetchDocuments();
      setUploadDialogOpen(false);
      setUploadFiles(null);
      setSelectedClient('');
      setUploadDocType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      // Optionally show error
      // eslint-disable-next-line no-console
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  // Cancel upload dialog
  const handleUploadCancel = () => {
    setUploadDialogOpen(false);
    setUploadFiles(null);
    setSelectedClient('');
    setUploadDocType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Client Documents</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by document or client"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            )}}
          />
          <TextField
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as DocumentStatus | '')}
            sx={{ minWidth: 160 }}
            SelectProps={{ displayEmpty: true, renderValue: (v) => (v as string) || 'Status' }}
          >
            <MenuItem value="">Status</MenuItem>
            {(['Pending','Submitted','Approved','Rejected'] as DocumentStatus[]).map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={docType}
            onChange={(e) => {
              const val = e.target.value;
              setDocType(val === '' ? '' : Number(val));
            }}
            sx={{ minWidth: 200 }}
            placeholder="Type (e.g., Passport)"
            disabled={documentTypesLoading}
            SelectProps={{
              displayEmpty: true,
              renderValue: (v) => {
                if (v === '') return 'Type';
                const found = documentTypes.find(dt => dt.id === v);
                return found ? found.term : 'Type';
              },
            }}
          >
            <MenuItem value="">Type</MenuItem>
            {documentTypesLoading && (
              <MenuItem value="" disabled>
                <CircularProgress size={18} sx={{ mr: 1 }} /> Loading...
              </MenuItem>
            )}
            {documentTypes.map(type => (
              <MenuItem key={type.id} value={type.id}>{type.term}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={handleUploadClick}>
            Upload Document
          </Button>
        </Stack>
      </Paper>

      <CustomDataTable
        rows={pagedRows}
        columns={columns}
        rowCount={filtered.length}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25]}
        isLoading={documentsLoading}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Select Client"
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              fullWidth
              required
              disabled={clientsLoading}
              helperText={clientsLoading ? 'Loading clients...' : ''}
            >
              <MenuItem value="" disabled>
                {clientsLoading ? <CircularProgress size={18} /> : 'Select a client'}
              </MenuItem>
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Document Type"
              value={uploadDocType}
              onChange={e => {
                const val = e.target.value;
                setUploadDocType(val === '' ? '' : Number(val));
              }}
              fullWidth
              required
              disabled={documentTypesLoading}
            >
              <MenuItem value="" disabled>
                {documentTypesLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                Select document type
              </MenuItem>
              {documentTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>{type.term}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={!selectedClient || uploadDocType === '' || uploading}
            >
              {uploadFiles && uploadFiles.length > 0
                ? `${uploadFiles.length} file${uploadFiles.length > 1 ? 's' : ''} selected`
                : 'Choose File(s)'}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFilesSelected}
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadCancel} disabled={uploading}>Cancel</Button>
          <Button
            onClick={handleUploadConfirm}
            variant="contained"
            disabled={!selectedClient || !uploadFiles || uploadFiles.length === 0 || uploadDocType === '' || uploading}
          >
            {uploading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
