// src/components/auth/Profile.jsx
import React from 'react';
import { 
  Box, 
  Paper,
  Typography, 
  Stack,
  Button,
  Chip,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blue } from '@mui/material/colors';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [snackOpen, setSnackOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setSnackOpen(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const handleCloseSnack = () => {
    setSnackOpen(false);
  };

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
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="calc(100vh - 200px)"
    >
      <Card sx={{ width: { xs: '90%', md: '600px' }, boxShadow: 3 }}>
        <CardHeader
          title="User Profile"
          sx={{ 
            bgcolor: blue[600], 
            color: 'white',
            borderTopLeftRadius: 'inherit', 
            borderTopRightRadius: 'inherit'
          }}
        />
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
              <Typography variant="body1">{user?.name}</Typography>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Role:</Typography>
              <Chip 
                label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                color={getRoleBadgeColor(user?.role)}
                sx={{ mt: 0.5, fontWeight: 500 }}
              />
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Account Created:</Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Last Login:</Typography>
              <Typography variant="body1">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnack} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          You have been successfully logged out.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;