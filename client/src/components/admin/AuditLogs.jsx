// src/components/admin/AuditLogs.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Button,
  TextField,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  MenuItem,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert as MuiAlert,
  InputLabel,
  Select,
  FormControl} from '@mui/material';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({ actionType: '', targetModel: '', startDate: '', endDate: '' });
  const [activeFilters, setActiveFilters] = useState({ actionType: '', targetModel: '', startDate: '', endDate: '' });
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const { token } = useAuth();
  const cancelRef = useRef();



  useEffect(() => {

    const fetchLogs = async (currentPage = page, currentFilters = activeFilters) => {
      try {
        setLoading(true);
        const params = { 
          page: currentPage, 
          limit: 20, 
          ...currentFilters 
        };
        
        // Remove any empty filter values
        Object.keys(params).forEach(key => !params[key] && delete params[key]);
        
        const res = await axios.get('http://localhost:5000/api/audit', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setError(null);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to fetch audit logs');
        showNotification('Failed to fetch audit logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();

  }, [token, page, activeFilters]);

  const handleFilterChange = e => { 
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const applyFilters = () => {
    setActiveFilters(filters);
    setPage(1);
    showNotification('Filters applied', 'success');
  };
  
  const clearFilters = () => { 
    const emptyFilters = { actionType: '', targetModel: '', startDate: '', endDate: '' };
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setPage(1); 
    showNotification('Filters cleared', 'info'); 
  };
  
  const viewLogDetails = log => { 
    setSelectedLog(log); 
    setDetailsDialogOpen(true); 
  };
  
  const getActionBadgeColor = action => {
    switch(action) {
      case 'CREATE': return 'success';
      case 'READ': return 'primary';
      case 'UPDATE': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };
  
  const formatTs = ts => ts ? new Date(ts).toLocaleString() : 'N/A';

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const showNotification = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  if (loading && page === 1 && !logs.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size="xl" />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Audit Logs</Typography>
        <Button 
          endIcon={isFiltersOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} 
          variant="outlined" 
          onClick={toggleFilters}
        >
          Filters
        </Button>
      </Box>

      <Collapse in={isFiltersOpen}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="medium" mb={2}>
            Filter Options
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={3}>
              <FormControl sx={{ minWidth: 100 }}variant="outlined" size="small">
                <InputLabel id="action-filter-label">Action</InputLabel>
                <Select
                  labelId="action-filter-label"
                  name="actionType"
                  value={filters.actionType}
                  onChange={handleFilterChange}
                  autoWidth
                  label="Action Type"
                  
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="CREATE">Create</MenuItem>
                  <MenuItem value="READ">Read</MenuItem>
                  <MenuItem value="UPDATE">Update</MenuItem>
                  <MenuItem value="DELETE">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl sx={{ minWidth: 100 }} variant="outlined" size="small">
                <InputLabel id="model-filter-label">Model</InputLabel>
                <Select
                  labelId="model-filter-label"
                  value={filters.targetModel}
                  onChange={handleFilterChange}
                  label="Model"
                  fullWidth
                  notched
                  
                >
                  <MenuItem value="">All Models</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Animal">Animal</MenuItem>
                  <MenuItem value="Auth">Auth</MenuItem>
                  <MenuItem value="AuditLog">AuditLog</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                size="small"
                fullWidth
                slotProps={{
                  inputLabel: {shrink: true}
                }}
                

              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                size="small"
                fullWidth
                slotProps={{
                  inputLabel: {shrink: true}
                }}
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end">
            <Button variant="text" onClick={clearFilters} sx={{ mr: 1 }}>
              Clear
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SearchIcon />}
              onClick={applyFilters}
            >
              Apply
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {/* Status indicators */}
      {Object.values(activeFilters).some(val => val) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Active filters:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {activeFilters.actionType && (
              <Chip 
                label={`Action Type: ${activeFilters.actionType}`} 
                size="small" 
                onDelete={() => {
                  setFilters(prev => ({ ...prev, actionType: '' }));
                  setActiveFilters(prev => ({ ...prev, actionType: '' }));
                }} 
              />
            )}
            {activeFilters.targetModel && (
              <Chip 
                label={`Model: ${activeFilters.targetModel}`} 
                size="small" 
                onDelete={() => {
                  setFilters(prev => ({ ...prev, targetModel: '' }));
                  setActiveFilters(prev => ({ ...prev, targetModel: '' }));
                }} 
              />
            )}
            {activeFilters.startDate && (
              <Chip 
                label={`From: ${activeFilters.startDate}`} 
                size="small" 
                onDelete={() => {
                  setFilters(prev => ({ ...prev, startDate: '' }));
                  setActiveFilters(prev => ({ ...prev, startDate: '' }));
                }} 
              />
            )}
            {activeFilters.endDate && (
              <Chip 
                label={`To: ${activeFilters.endDate}`} 
                size="small" 
                onDelete={() => {
                  setFilters(prev => ({ ...prev, endDate: '' }));
                  setActiveFilters(prev => ({ ...prev, endDate: '' }));
                }} 
              />
            )}
          </Box>
        </Box>
      )}

      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>IP</TableCell>
              <TableCell width="100px">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length ? logs.map(log => (
              <TableRow key={log._id} hover>
                <TableCell>{formatTs(log.timestamp)}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.actionType} 
                    color={getActionBadgeColor(log.actionType)} 
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.user?.name || 'System'}</TableCell>
                <TableCell>{log.targetModel}</TableCell>
                <TableCell>{log.ip || 'N/A'}</TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => viewLogDetails(log)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? 'Loading...' : 'No logs found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
          size="small"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={closeDetailsDialog}
        maxWidth="md"
      >
        <DialogTitle>
          Audit Log Details
          <IconButton
            aria-label="close"
            onClick={closeDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
            ref={cancelRef}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Stack spacing={2}>
              <Typography><strong>Timestamp:</strong> {formatTs(selectedLog.timestamp)}</Typography>
              <Typography><strong>Action:</strong> {selectedLog.action}</Typography>
              <Typography><strong>Action Type:</strong> {selectedLog.actionType}</Typography>
              <Typography><strong>User:</strong> {selectedLog.user?.name || 'System'}</Typography>
              <Typography><strong>Model:</strong> {selectedLog.targetModel}</Typography>
              <Typography><strong>Target ID:</strong> {selectedLog.targetId || 'N/A'}</Typography>
              <Typography><strong>IP:</strong> {selectedLog.ip || 'N/A'}</Typography>
              {selectedLog.details && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Paper>
  );
};

export default AuditLogs;