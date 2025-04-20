// src/components/Header.jsx
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Stack, 
  Chip, 
  useMediaQuery,
  Box,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleMenuClose();
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

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 1,
        boxShadow: 2
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: 4 }}>
        <Typography
          variant="h5"
          component={RouterLink}
          to="/"
          color="primary"
          sx={{ 
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' },
            mr: 2
          }}
        >
          Shelter Dashboard
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {isAuthenticated ? (
            <>
              {/* Main Navigation - Only show on non-mobile */}
              {!isMobile && (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/"
                    color="primary"
                    variant="text"
                  >
                    Dashboard
                  </Button>
                  
                  {/* Staff and Admin Navigation */}
                  {hasRole(['admin', 'staff']) && (
                    <Button
                      component={RouterLink}
                      to="/animals/manage"
                      color="primary"
                      variant="text"
                    >
                      Manage Animals
                    </Button>
                  )}
                  
                  {/* Admin Only Navigation */}
                  {hasRole('admin') && (
                    <>
                      <Button
                        component={RouterLink}
                        to="/admin/users"
                        color="primary"
                        variant="text"
                      >
                        Users
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/admin/audit"
                        color="primary"
                        variant="text"
                      >
                        Audit Logs
                      </Button>
                    </>
                  )}
                </Stack>
              )}
              
              {/* User Menu */}
              <Box>
                <Button 
                  onClick={handleMenuOpen}
                  variant="contained"
                  color="primary"
                  
                  endIcon={user?.role && (
                    <Chip
                      variant='text'
                      label={user.role.toUpperCase()}
                      size="small"
                      color={getRoleBadgeColor(user.role)}
                      sx={{ 
                        '& .MuiChip-label': {
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  )}
                >
                  {isMobile ? 'Menu' : 'Current User:'}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {/* Mobile Navigation Items */}
                  {isMobile && (
                    <>
                      <MenuItem 
                        component={RouterLink} 
                        to="/"
                        onClick={handleMenuClose}
                      >
                        Dashboard
                      </MenuItem>
                      
                      {/* Staff and Admin Navigation */}
                      {hasRole(['admin', 'staff']) && (
                        <MenuItem 
                          component={RouterLink} 
                          to="/animals/manage"
                          onClick={handleMenuClose}
                        >
                          Manage Animals
                        </MenuItem>
                      )}
                      
                      {/* Admin Only Navigation */}
                      {hasRole('admin') && (
                        <>
                          <MenuItem 
                            component={RouterLink} 
                            to="/admin/users"
                            onClick={handleMenuClose}
                          >
                            Users
                          </MenuItem>
                          <MenuItem 
                            component={RouterLink} 
                            to="/admin/audit"
                            onClick={handleMenuClose}
                          >
                            Audit Logs
                          </MenuItem>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Common Menu Items */}
                  <MenuItem 
                    component={RouterLink} 
                    to="/profile"
                    onClick={handleMenuClose}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ color: 'error.main' }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            // Not authenticated - show login/register buttons
            <Stack direction="row" spacing={1.5}>
              <Button
                component={RouterLink}
                to="/login"
                color="primary"
                variant="outlined"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                color="primary"
                variant="contained"
              >
                Register
              </Button>
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;