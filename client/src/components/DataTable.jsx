// src/components/DataTable.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Stack,
  CircularProgress,
  Button,
  Typography,
  Pagination,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Snackbar
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DataTable = () => {
  var ANIMAL_API='http://localhost:5000/api/animals';
  var PUBLIC_ANIMAL_API='http://localhost:5000/api/public/animals';

  // Define the number of items per page
  const itemsPerPage = 7;
  
  // State variables
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  
  // Get auth context
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the current filter from the URL query params
  const params = new URLSearchParams(location.search);
  const currentFilter = params.get('filter') || '';

  const handleFilterChange = (e) => {
    const filterValue = e.target.value;
    
    // Update the URL with the selected filter
    if (filterValue) {
      navigate(`?filter=${filterValue}`);
    } else {
      navigate('/');
    }
  };

  const clearFilter = () => {
    navigate('/');
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

  // Fetch animals based on authentication status and filter
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        let endpoint;
        let config = {};
        
        // Determine the endpoint based on currentFilter and authentication
        if (isAuthenticated) {
          // Authenticated users use the protected API
          endpoint = currentFilter 
            ? `${ANIMAL_API}/filter/${currentFilter}`
            : `${ANIMAL_API}`;
          
          config = {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              page,
              limit: itemsPerPage
            }
          };
        } else {
          // Unauthenticated users use the public API
          endpoint = currentFilter 
            ? `${PUBLIC_ANIMAL_API}/filter/${currentFilter}`
            : `${PUBLIC_ANIMAL_API}`;
          
          config = {
            params: {
              page,
              limit: itemsPerPage
            }
          };
        }
        
        const res = await axios.get(endpoint, config);
        
        // Update state with the fetched data
        setAnimals(res.data.data);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch animals. Please try again later.');
        showNotification('Failed to fetch animals. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [currentFilter, page, isAuthenticated, token, ANIMAL_API, PUBLIC_ANIMAL_API]);

  // Get outcome badge color
  const getOutcomeBadgeColor = (outcome) => {
    switch (outcome) {
      case 'Adoption':
        return 'success';
      case 'Transfer':
        return 'primary';
      case 'Return to Owner':
        return 'secondary';
      case 'Euthanasia':
        return 'error';
      case 'Died':
        return 'default';
      default:
        return 'info';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'staff':
        return 'success';
      case 'volunteer':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading && page === 1) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress size={40} thickness={4} color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} sx={{ bgcolor: '#fff1f0', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      <Stack spacing={3} width="100%">
        {/* Header with title and filter */}
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4">Animals</Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="filter-label">Filter by Training Type</InputLabel>
              <Select
                labelId="filter-label"
                id="filter-select"
                value={currentFilter}
                onChange={handleFilterChange}
                label="Filter by Training Type"
                startAdornment={<FilterAltIcon sx={{ mr: 1, ml: -0.5, color: 'action.active' }} />}
              >
                <MenuItem value="">All Animals</MenuItem>
                <MenuItem value="Water Rescue">Water Rescue</MenuItem>
                <MenuItem value="Mountain%2FWilderness">Mountain/Wilderness</MenuItem>
                <MenuItem value="Disaster-Tracking">Disaster-Tracking</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {isAuthenticated && user && (
              <Box display="flex" alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} gap={1}>
                <Typography variant="body2">Logged in as:</Typography>
                <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                <Chip 
                  label={user.role}
                  color={getRoleBadgeColor(user.role)}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
        
        {/* Active filter indicator */}
        {currentFilter && (
          <Alert 
            severity="info" 
            sx={{ mt: 1 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={clearFilter}
              >
                Clear
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Active Filter:</strong> {currentFilter}
            </Typography>
          </Alert>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Outcome</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.length > 0 ? (
                animals.map((animal) => (
                  <TableRow
                    key={animal.animal_id || animal._id}
                    onClick={() => setSelectedAnimal(animal)}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{animal.animal_id}</TableCell>
                    <TableCell>{animal.name || 'Unknown'}</TableCell>
                    <TableCell>{animal.animal_type}</TableCell>
                    <TableCell>{animal.breed}</TableCell>
                    <TableCell>{animal.color}</TableCell>
                    <TableCell>{animal.age_upon_outcome}</TableCell>
                    <TableCell>{animal.sex_upon_outcome}</TableCell>
                    <TableCell>
                      <Chip 
                        label={animal.outcome_type}
                        color={getOutcomeBadgeColor(animal.outcome_type)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                    No animals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography variant="body2">
            Showing {animals.length} of {totalItems} animals
          </Typography>
          
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
      </Stack>

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

export default DataTable;