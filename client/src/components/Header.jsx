// src/components/Header.jsx
import React from 'react';
import { 
  Flex, 
  Heading, 
  Button, 
  Menu, 
  HStack,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get role badge color
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
    <Flex 
      as="header" 
      align="center" 
      justify="space-between" 
      py={5}
      px={8}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      wrap="wrap"
    >
      <Heading 
        as={RouterLink}
        to="/"
        fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
        color="blue.600"
        mr={4}
      >
        Animal Shelter Dashboard
      </Heading>

      <HStack spacing={4}>
        {isAuthenticated ? (
          <>
            {/* Main Navigation - Only show on non-mobile */}
            {!isMobile && (
              <HStack spacing={3}>
                <Button
                  as={RouterLink}
                  to="/"
                  variant="ghost"
                  colorScheme="blue"
                >
                  Dashboard
                </Button>
                
                {/* Staff and Admin Navigation */}
                {hasRole(['admin', 'staff']) && (
                  <Button
                    as={RouterLink}
                    to="/animals/manage"
                    variant="ghost"
                    colorScheme="blue"
                  >
                    Manage Animals
                  </Button>
                )}
                
                {/* Admin Only Navigation */}
                {hasRole('admin') && (
                  <>
                    <Button
                      as={RouterLink}
                      to="/admin/users"
                      variant="ghost"
                      colorScheme="blue"
                    >
                      Users
                    </Button>
                    <Button
                      as={RouterLink}
                      to="/admin/audit"
                      variant="ghost"
                      colorScheme="blue"
                    >
                      Audit Logs
                    </Button>
                  </>
                )}
              </HStack>
            )}
            
            {/* User Menu */}
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button> 
                  {isMobile ? 'Menu' : user?.name}
                  {user?.role && (
                    <Badge ml={2} colorScheme={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  )}
                </Button>
              </Menu.Trigger>

              <Menu.Content>
                {/* Mobile Navigation Items */}
                {isMobile && (
                  <>
                    <Menu.Item as={RouterLink} to="/">
                      Dashboard
                    </Menu.Item>
                    
                    {/* Staff and Admin Navigation */}
                    {hasRole(['admin', 'staff']) && (
                      <Menu.Item as={RouterLink} to="/animals/manage">
                        Manage Animals
                      </Menu.Item>
                    )}
                    
                    {/* Admin Only Navigation */}
                    {hasRole('admin') && (
                      <>
                        <Menu.Item as={RouterLink} to="/admin/users">
                          Users
                        </Menu.Item>
                        <Menu.Item as={RouterLink} to="/admin/audit">
                          Audit Logs
                        </Menu.Item>
                      </>
                    )}
                  </>
                )}
                
                {/* Common Menu Items */}
                <Menu.Item as={RouterLink} to="/profile">
                  Profile
                </Menu.Item>
                <Menu.Item onClick={handleLogout} color="red.500">
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </>
        ) : (
          // Not authenticated - show login/register buttons
          <HStack spacing={3}>
            <Button
              as={RouterLink}
              to="/login"
              colorScheme="blue"
              variant="outline"
            >
              Login
            </Button>
            <Button
              as={RouterLink}
              to="/register"
              colorScheme="blue"
            >
              Register
            </Button>
          </HStack>
        )}
      </HStack>
    </Flex>
  );
};

export default Header;