// src/App.js
import React from 'react';

import { Box, Flex, VStack } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import PrivateRoute from './components/routing/PrivateRoute';

// Dashboard Components
import Header from './components/Header';
import FilterDropdown from './components/FilterDropdown';
import DataTable from './components/DataTable';
import PieChart from './components/PieChart';
import MapComponent from './components/MapComponent';

// Admin Components (to be created)
import UserManagement from './components/admin/UserManagement';
import AuditLogs from './components/admin/AuditLogs';

// Staff Components (to be created)
import AnimalManagement from './components/staff/AnimalManagement';

import { Provider } from './components/ui/provider'

function App() {
 
  return (

    <Provider> 
      <AuthProvider>
        <BrowserRouter> 
          <Box bg="gray.50" minH="100vh" p={5}>
            <VStack spacing={5} align="stretch" maxW="1400px" mx="auto">
              <Header />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes - All Authenticated Users */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={
                    <VStack spacing={5} align="stretch">
                      <FilterDropdown />
                      <DataTable />
                      <Flex 
                        direction={{ base: 'column', md: 'row' }} 
                        h={{ base: 'auto', md: '70vh' }}
                        gap={5}
                      >
                        <Box flex="1" h={{ base: '400px', md: '100%' }}>
                          <PieChart /> 
                        </Box>
                        <Box flex="1" h={{ base: '400px', md: '100%' }}>
                          <MapComponent />
                        </Box>
                      </Flex>
                    </VStack>
                  } />
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
            </VStack>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </Provider>

  );
}

export default App;