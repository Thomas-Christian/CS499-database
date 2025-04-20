// AnimalManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Divider,
  Collapse,
  Alert,
  Snackbar
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

const AnimalManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    animal_id: '',
    animal_type: 'Dog',
    breed: '',
    color: '',
    date_of_birth: '',
    outcome_type: 'Available',
    outcome_subtype: '',
    sex_upon_outcome: 'Intact Male',
    location_lat: '',
    location_long: '',
    age_upon_outcome: '',
    age_upon_outcome_in_weeks: ''
  });

  // Form dialog and delete confirmation states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Snackbar for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const { token, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const cancelRef = useRef();

  // Fetch animals
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/animals', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        });
        setAnimals(res.data.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch animals');
        showNotification('Failed to fetch animals', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, [token]);

  // Handle text and select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };
  
  // Handle numeric input changes
  const handleNumberChange = (name, value) => {
    setFormData(d => ({ ...d, [name]: value }));
  };

  // Auto-calc age on DOB change
  useEffect(() => {
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const now = new Date();
      const weeks = Math.floor((now - dob) / (1000*60*60*24*7));
      if (!isNaN(weeks) && weeks >= 0) {
        let ageString = '';
        if (weeks < 4) ageString = `${weeks} week${weeks!==1?'s':''}`;
        else if (weeks<52) {
          const m = Math.floor(weeks/4.33);
          ageString = `${m} month${m!==1?'s':''}`;
        } else {
          const y = Math.floor(weeks/52);
          const rm = Math.floor((weeks%52)/4.33);
          ageString = `${y} year${y!==1?'s':''}` + (rm>0?` ${rm} month${rm!==1?'s':''}`:'');
        }
        setFormData(d => ({
          ...d,
          age_upon_outcome: ageString,
          age_upon_outcome_in_weeks: weeks
        }));
      }
    }
  }, [formData.date_of_birth]);

  // Open "Add" form
  const handleAddAnimal = () => {
    const newId = `A${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
    setSelectedAnimal(null);
    setFormData({
      name: '',
      animal_id: newId,
      animal_type: 'Dog',
      breed: '',
      color: '',
      date_of_birth: '',
      outcome_type: 'Available',
      outcome_subtype: '',
      sex_upon_outcome: 'Intact Male',
      location_lat: '',
      location_long: '',
      age_upon_outcome: '',
      age_upon_outcome_in_weeks: ''
    });
    setFormDialogOpen(true);
  };

  // Open "Edit" form
  const handleEditAnimal = (a) => {
    setSelectedAnimal(a);
    const formattedDob = a.date_of_birth
      ? new Date(a.date_of_birth).toISOString().split('T')[0]
      : '';
    setFormData({
      name: a.name||'',
      animal_id: a.animal_id||'',
      animal_type: a.animal_type||'Dog',
      breed: a.breed||'',
      color: a.color||'',
      date_of_birth: formattedDob,
      outcome_type: a.outcome_type||'Available',
      outcome_subtype: a.outcome_subtype||'',
      sex_upon_outcome: a.sex_upon_outcome||'Intact Male',
      location_lat: a.location_lat||'',
      location_long: a.location_long||'',
      age_upon_outcome: a.age_upon_outcome||'',
      age_upon_outcome_in_weeks: a.age_upon_outcome_in_weeks||''
    });
    setFormDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteClick = (a) => {
    setSelectedAnimal(a);
    setDeleteDialogOpen(true);
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        datetime: new Date().toISOString(),
        monthyear: new Date().toLocaleString('en-US',{month:'long',year:'numeric'})
      };
      if (selectedAnimal) {
        await axios.put(
          `http://localhost:5000/api/animals/${selectedAnimal._id}`,
          payload,
          { headers:{Authorization:`Bearer ${token}`}}
        );
        setAnimals(arr =>
          arr.map(x => x._id===selectedAnimal._id?{...x,...payload}:x)
        );
        showNotification("Animal updated successfully", "success");
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/animals',
          payload,
          { headers:{Authorization:`Bearer ${token}`}}
        );
        setAnimals(arr => [res.data.data, ...arr]);
        showNotification("Animal created successfully", "success");
      }
      setFormDialogOpen(false);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message||'Failed to save', "error");
    }
  };

  // Delete
  const handleDeleteAnimal = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/animals/${selectedAnimal._id}`,
        { headers:{Authorization:`Bearer ${token}`}}
      );
      setAnimals(arr => arr.filter(x => x._id!==selectedAnimal._id));
      showNotification("Animal deleted successfully", "success");
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message||'Failed to delete', "error");
    }
  };

  // Get color for outcome chip
  const getChipColor = (outcome) => {
    switch(outcome){
      case 'Adoption': return 'success';
      case 'Transfer': return 'primary';
      case 'Return to Owner': return 'secondary';
      case 'Euthanasia': return 'error';
      case 'Died': return 'default';
      case 'Available': return 'info';
      default: return 'default';
    }
  };

  // Handle snackbar state
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Animal Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddAnimal}
        >
          Add New Animal
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Outcome</TableCell>
                <TableCell width="150px">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {animals.length > 0 ? (
                animals.map(a => (
                  <TableRow key={a._id} hover>
                    <TableCell>{a.animal_id}</TableCell>
                    <TableCell>{a.name||'Unknown'}</TableCell>
                    <TableCell>{a.animal_type}</TableCell>
                    <TableCell>{a.breed}</TableCell>
                    <TableCell>{a.age_upon_outcome}</TableCell>
                    <TableCell>{a.sex_upon_outcome}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.outcome_type}
                        color={getChipColor(a.outcome_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" color="primary" onClick={()=>handleEditAnimal(a)}>
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button size="small" variant="outlined" color="error" onClick={()=>handleDeleteClick(a)}>
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No animals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAnimal ? 'Edit Animal' : 'Add New Animal'}
          <IconButton
            aria-label="close"
            onClick={() => setFormDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <form id="animalForm" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Animal Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Animal ID"
                  name="animal_id"
                  value={formData.animal_id}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{
                    readOnly: !!selectedAnimal,
                  }}
                  helperText={selectedAnimal
                    ? 'Cannot edit ID'
                    : 'Auto-generated for new animals'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="Optional"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="animal_type"
                    value={formData.animal_type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="Dog">Dog</MenuItem>
                    <MenuItem value="Cat">Cat</MenuItem>
                    <MenuItem value="Bird">Bird</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Auto-calculates age"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Age"
                  name="age_upon_outcome"
                  value={formData.age_upon_outcome}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="Auto-calculated"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Age in Weeks"
                  name="age_upon_outcome_in_weeks"
                  type="number"
                  value={formData.age_upon_outcome_in_weeks}
                  onChange={(e) => handleNumberChange('age_upon_outcome_in_weeks', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Sex</InputLabel>
                  <Select
                    name="sex_upon_outcome"
                    value={formData.sex_upon_outcome}
                    onChange={handleChange}
                    label="Sex"
                  >
                    <MenuItem value="Intact Male">Intact Male</MenuItem>
                    <MenuItem value="Intact Female">Intact Female</MenuItem>
                    <MenuItem value="Neutered Male">Neutered Male</MenuItem>
                    <MenuItem value="Spayed Female">Spayed Female</MenuItem>
                    <MenuItem value="Unknown">Unknown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Outcome</InputLabel>
                  <Select
                    name="outcome_type"
                    value={formData.outcome_type}
                    onChange={handleChange}
                    label="Outcome"
                  >
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Adoption">Adoption</MenuItem>
                    <MenuItem value="Transfer">Transfer</MenuItem>
                    <MenuItem value="Return to Owner">Return to Owner</MenuItem>
                    <MenuItem value="Euthanasia">Euthanasia</MenuItem>
                    <MenuItem value="Died">Died</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Outcome Subtype"
                  name="outcome_subtype"
                  value={formData.outcome_subtype}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="Optional"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Latitude"
                  name="location_lat"
                  type="number"
                  value={formData.location_lat}
                  onChange={(e) => handleNumberChange('location_lat', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    inputProps: { step: 0.000001 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Longitude"
                  name="location_long"
                  type="number"
                  value={formData.location_long}
                  onChange={(e) => handleNumberChange('location_long', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    inputProps: { step: 0.000001 }
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {selectedAnimal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Animal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedAnimal?.name || selectedAnimal?.animal_id}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button ref={cancelRef} onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteAnimal} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AnimalManagement;