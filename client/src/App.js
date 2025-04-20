// src/App.js
import React from 'react';
import { Box, Stack } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Auth Components
import { AuthProvider } from './context/AuthContext';
import { AnimalProvider } from './context/AnimalContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import PrivateRoute from './components/routing/PrivateRoute';

// Dashboard Components
import Header from './components/Header';
import DataTable from './components/DataTable';
import PieChart from './components/PieChart';
import MapComponent from './components/MapComponent';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import AuditLogs from './components/admin/AuditLogs';

// Staff Components
import AnimalManagement from './components/staff/AnimalManagement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AnimalProvider> {/* Add AnimalProvider here */}
          <BrowserRouter>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 2.5 }}>
              <Stack spacing={2.5} sx={{ maxWidth: '1400px', mx: 'auto' }}>
                <Header />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                      <Stack spacing={2.5}>
                        <DataTable />
                        <Box 
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            height: { xs: 'auto', md: '70vh' },
                            gap: 2.5
                          }}
                        >
                          <Box sx={{ flex: '1', height: { xs: '400px', md: '100%' } }}>
                            <PieChart /> 
                          </Box>
                          <Box sx={{ flex: '1', height: { xs: '400px', md: '100%' } }}>
                            <MapComponent />
                          </Box>
                        </Box>
                      </Stack>
                    } />
                  
                   {/* Protected Routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  
                  {/* Staff and Admin Routes */}
                  <Route element={<PrivateRoute requiredRoles={['admin', 'staff']} />}>
                    <Route path="/animals/manage" element={<AnimalManagement />} />
                  </Route>
                  
                  {/* Admin Only Routes */}
                  <Route element={<PrivateRoute requiredRoles={['admin']} />}>
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/audit" element={<AuditLogs />} />
                  </Route>
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Stack>
            </Box>
          </BrowserRouter>
        </AnimalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;