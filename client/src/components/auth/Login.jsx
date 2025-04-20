// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Link,
  Alert,
  InputLabel,
  FormControl
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed');
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
          sx={{ 
            bgcolor: blue[600], 
            color: 'white',
            borderTopLeftRadius: 'inherit', 
            borderTopRightRadius: 'inherit',
            textAlign: 'center'
          }}
          title="Login"
          titleTypographyProps={{ variant: 'h5' }}
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              {formError && (
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                  {formError}
                </Alert>
              )}

              <FormControl fullWidth required>
                <InputLabel htmlFor="email">Email Address</InputLabel>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={onChange}
                  placeholder="Enter your email"
                  variant="outlined"
                  fullWidth
                  label="Email Address"
                  required
                />
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel htmlFor="password">Password</InputLabel>
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  variant="outlined"
                  fullWidth
                  label="Password"
                  required
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Box textAlign="center">
                <Typography variant="body1" component="span">
                  Don't have an account?{' '}
                </Typography>
                <Link 
                  component="button" 
                  variant="body1" 
                  color="primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Link>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}