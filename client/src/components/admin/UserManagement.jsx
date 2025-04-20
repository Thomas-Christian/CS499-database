// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

const USERS_API='http://localhost:5000/api/users';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'volunteer' });
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const { token } = useAuth();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await axios.get(USERS_API, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users');
        showNotification('Failed to fetch users', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  const handleChange = e => setFormData(d => ({ ...d, [e.target.name]: e.target.value }));

  const openForm = user => {
    setSelectedUser(user || null);
    setFormData(user
      ? { name: user.name, email: user.email, password: '', role: user.role }
      : { name: '', email: '', password: '', role: 'volunteer' }
    );
    setFormDialogOpen(true);
  };

  const closeForm = () => {
    setFormDialogOpen(false);
  };

  const confirmDelete = user => { 
    setSelectedUser(user); 
    setDeleteDialogOpen(true); 
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const showNotification = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (selectedUser && !payload.password) delete payload.password;
      if (selectedUser) {
        await axios.put(`${USERS_API}/${selectedUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(u => u.map(x => x._id === selectedUser._id ? { ...x, ...payload } : x));
        showNotification('User updated successfully', 'success');
      } else {
        const res = await axios.post(USERS_API, payload, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(u => [...u, res.data.data]);
        showNotification('User created successfully', 'success');
      }
      closeForm();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${USERS_API}/${selectedUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.filter(x => x._id !== selectedUser._id));
      showNotification('User deleted successfully', 'success');
      closeDeleteDialog();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const getBadgeColor = role => {
    switch(role) {
      case 'admin': return 'error';
      case 'staff': return 'success';
      case 'volunteer': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">User Management</Typography>
        <Button 
          onClick={() => openForm(null)} 
          variant="contained" 
          color="primary"
        >
          Add New User
        </Button>
      </Box>

      {error && <Typography color="error.main" mb={2}>{error}</Typography>}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length ? users.map(user => (
              <TableRow key={user._id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={getBadgeColor(user.role)} 
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => openForm(user)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => confirmDelete(user)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Form Dialog */}
      <Dialog open={formDialogOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
          <IconButton
            aria-label="close"
            onClick={closeForm}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} mt={1}>
              <Typography variant="subtitle1" fontWeight="medium">Account Details</Typography>
              
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              
              <TextField
                label={selectedUser ? "New Password (optional)" : "Password"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required={!selectedUser}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Paper>
  );
};

export default UserManagement;