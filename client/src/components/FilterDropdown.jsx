// src/components/FilterDropdown.jsx
import React from 'react';
import {
  Field,
  NativeSelect,
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Stack
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FilterDropdown() {
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

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      boxShadow="sm"
    >
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" wrap="wrap" gap={4}>
        <Field.Root>
          <Field.Label fontWeight="medium">Filter by Training Type:</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field onChange={handleChange} value={currentFilter}>
              <option value="">All Animals</option>
              <option value="Water">Water Rescue</option>
              <option value="Mountain/Wilderness">Mountain/Wilderness</option>
              <option value="Disaster/Tracking">Disaster/Tracking</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        
        {isAuthenticated && (
          <Stack direction={{ base: 'column', md: 'row' }} align="center" spacing={4}>
            {user && (
              <Flex align="center" gap={2}>
                <Text>Logged in as:</Text>
                <Text fontWeight="bold">{user.name}</Text>
                <Badge 
                  colorScheme={user.role === 'admin' ? 'red' : user.role === 'staff' ? 'green' : 'blue'}
                  borderRadius="md"
                  px={2}
                  py={1}
                >
                  {user.role}
                </Badge>
              </Flex>
            )}
          </Stack>
        )}
      </Flex>

      {currentFilter && (
        <Box mt={4} p={2} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="blue.600">
            <strong>Active Filter:</strong> {currentFilter}
            <Button 
              size="xs" 
              variant="link" 
              colorScheme="blue" 
              ml={2}
              onClick={() => navigate('/')}
            >
              Clear
            </Button>
          </Text>
        </Box>
      )}
    </Box>
  );
};