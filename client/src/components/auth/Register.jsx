// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  TextField,
  Stack,
  Alert,
  Divider,
  Link,
  FormControl,
  InputLabel
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (error) {
      setFormError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="calc(100vh - 200px)"
    >
      <Card sx={{ width: { xs: '90%', md: '450px' }, boxShadow: 3 }}>
        <CardHeader
          title="Register"
          sx={{ 
            bgcolor: blue[600], 
            color: 'white',
            borderTopLeftRadius: 'inherit', 
            borderTopRightRadius: 'inherit',
            textAlign: 'center'
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              {formError && (
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}

              <Typography variant="subtitle1" fontWeight="bold">
                Personal Information
              </Typography>
              
              <FormControl fullWidth>
                <TextField
                  label="Name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  placeholder="Enter your full name"
                  variant="outlined"
                  fullWidth
                  required
                  margin="dense"
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="Enter your email"
                  variant="outlined"
                  fullWidth
                  required
                  margin="dense"
                />
              </FormControl>

              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                Security
              </Typography>

              <FormControl fullWidth>
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  variant="outlined"
                  fullWidth
                  required
                  margin="dense"
                  helperText="Password must be at least 8 characters"
                />
              </FormControl>

              <FormControl fullWidth>
                <TextField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  placeholder="Confirm your password"
                  variant="outlined"
                  fullWidth
                  required
                  margin="dense"
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>

              <Box textAlign="center" mt={1}>
                <Typography variant="body1" component="span">
                  Already have an account?{' '}
                </Typography>
                <Link 
                  component="button" 
                  variant="body1" 
                  color="primary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Link>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;