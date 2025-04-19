// src/components/routing/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Center, Spinner, Text, VStack, Alert} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  // Check if still loading authentication state
  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return (
      <Center h="100vh" p={4}>
        <Alert.Root
          status="error"
          variant="solid"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <Alert.Title mt={4} mb={1} fontSize="lg">
            Access Denied
          </Alert.Title>
          <Alert.Description>
            You don't have sufficient permissions to access this page.
          </Alert.Description>
        </Alert.Root>
      </Center>
    );
  }

  // If authenticated and has required role, render the protected content
  return <Outlet />;
};

export default PrivateRoute;