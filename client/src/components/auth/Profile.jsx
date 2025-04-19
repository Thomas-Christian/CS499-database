// src/components/auth/Profile.jsx
import React from 'react';
import { 
  Box, 
  Card,
  CardHeader, 
  CardBody,
  Heading, 
  Text, 
  Stack,
  Button,
  Badge,
  Flex,
  Toaster
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    Toaster.create({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'staff':
        return 'green';
      case 'volunteer':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Flex justify="center" align="center" minH="calc(100vh - 200px)">
      <Card w={{ base: '90%', md: '600px' }} boxShadow="lg">
        <CardHeader bg="blue.600" borderTopRadius="md">
          <Heading size="lg" color="white">User Profile</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <Box>
              <Text fontWeight="bold" fontSize="lg">Name:</Text>
              <Text fontSize="lg">{user?.name}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" fontSize="lg">Email:</Text>
              <Text fontSize="lg">{user?.email}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" fontSize="lg">Role:</Text>
              <Badge colorScheme={getRoleBadgeColor(user?.role)} fontSize="1em" px={2} py={1} borderRadius="md">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </Box>
            
            <Box>
              <Text fontWeight="bold" fontSize="lg">Account Created:</Text>
              <Text fontSize="lg">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" fontSize="lg">Last Login:</Text>
              <Text fontSize="lg">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </Text>
            </Box>
            
            <Button colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Profile;