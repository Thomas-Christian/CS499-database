// src/components/FilterDropdown.jsx
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Button,
  Stack,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FilterDropdown({ compact = false }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the current filter from the URL query params
  const params = new URLSearchParams(location.search);
  const currentFilter = params.get('filter') || '';
  
  const handleChange = (e) => {
    const filterValue = e.target.value;
    
    // Update the URL with the selected filter
    if (filterValue) {
      navigate(`?filter=${filterValue}`);
    } else {
      navigate('/');
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

  // If in compact mode, just render the filter dropdown without the paper container
  if (compact) {
    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="filter-label">Filter by Training Type</InputLabel>
              <Select
                labelId="filter-label"
                id="filter-select"
                value={currentFilter}
                onChange={handleChange}
                label="Filter by Training Type"
              >
                <MenuItem value="">All Animals</MenuItem>
                <MenuItem value="Water">Water Rescue</MenuItem>
                <MenuItem value="Mountain/Wilderness">Mountain/Wilderness</MenuItem>
                <MenuItem value="Disaster/Tracking">Disaster/Tracking</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isAuthenticated && user && (
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={1}
                justifyContent="flex-end"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Logged in as:</Typography>
                  <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                  <Chip 
                    label={user.role}
                    color={getRoleBadgeColor(user.role)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Stack>
            )}
          </Grid>
        </Grid>

        {currentFilter && (
          <Box mt={2}>
            <Alert 
              severity="info" 
              action={
                <Button color="inherit" size="small" onClick={() => navigate('/')}>
                  Clear
                </Button>
              }
            >
              <Typography variant="body2">
                <strong>Active Filter:</strong> {currentFilter}
              </Typography>
            </Alert>
          </Box>
        )}
      </Box>
    );
  }

  // Standard non-compact rendering with Paper container (original behavior)
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      <Grid
        container
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
      >
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="filter-label">Filter by Training Type</InputLabel>
            <Select
              labelId="filter-label"
              id="filter-select"
              value={currentFilter}
              onChange={handleChange}
              label="Filter by Training Type"
            >
              <MenuItem value="">All Animals</MenuItem>
              <MenuItem value="Water">Water Rescue</MenuItem>
              <MenuItem value="Mountain/Wilderness">Mountain/Wilderness</MenuItem>
              <MenuItem value="Disaster/Tracking">Disaster/Tracking</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {isAuthenticated && (
          <Grid item xs={12} md={6}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={1}
            >
              {user && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1">Logged in as:</Typography>
                  <Typography variant="body1" fontWeight="bold">{user.name}</Typography>
                  <Chip 
                    label={user.role}
                    color={getRoleBadgeColor(user.role)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              )}
            </Stack>
          </Grid>
        )}
      </Grid>

      {currentFilter && (
        <Box mt={2} p={1} sx={{ bgcolor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="body2" color="primary.main" display="flex" alignItems="center">
            <strong>Active Filter:</strong>&nbsp;{currentFilter}
            <Button 
              size="small" 
              color="primary" 
              onClick={() => navigate('/')}
              sx={{ ml: 1 }}
            >
              Clear
            </Button>
          </Typography>
        </Box>
      )}
    </Box>
  );
}