// src/components/routing/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Stack, 
  Alert,
  AlertTitle
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  // Check if still loading authentication state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography variant="body1">Loading...</Typography>
        </Stack>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        p={3}
      >
        <Alert 
          severity="error" 
          variant="filled"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '200px',
            width: '100%',
            maxWidth: '500px'
          }}
        >
          <AlertTitle sx={{ fontSize: '1.25rem', mt: 2, mb: 1 }}>
            Access Denied
          </AlertTitle>
          <Typography variant="body1">
            You don't have sufficient permissions to access this page.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // If authenticated and has required role, render the protected content
  return <Outlet />;
};

export default PrivateRoute;