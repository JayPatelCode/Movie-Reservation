import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Grid, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { AccountCircle, Email, Phone, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your profile.');
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            'Authorization': `JWT ${token}`,
          },
        };
        // Assuming there's an endpoint like /api/user/profile or similar
        // You might need to adjust this URL based on your Django backend
        const response = await axios.get('http://localhost:8000/auth/users/me/', config); 
        setUserData(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile. Please try again.');
        setOpenSnackbar(true);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) { // If we were just editing, now we are saving
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `JWT ${token}`,
        },
      };
      await axios.patch('http://localhost:8000/auth/users/me/', formData, config);
      setUserData({ ...userData, ...formData });
      setError('Profile updated successfully!');
      setOpenSnackbar(true);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile. Please try again.');
      setOpenSnackbar(true);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.dark', color: 'white' }}>
          <Typography variant="h6">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AccountCircle sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              User Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal information.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={isEditing ? formData.first_name : userData?.first_name || ''}
                InputProps={{ readOnly: !isEditing, startAdornment: <Person sx={{ mr: 1 }} /> }}
                variant="outlined"
                onChange={handleChange('first_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={isEditing ? formData.last_name : userData?.last_name || ''}
                InputProps={{ readOnly: !isEditing, startAdornment: <Person sx={{ mr: 1 }} /> }}
                variant="outlined"
                onChange={handleChange('last_name')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={isEditing ? formData.email : userData?.email || ''}
                InputProps={{ readOnly: !isEditing, startAdornment: <Email sx={{ mr: 1 }} /> }}
                variant="outlined"
                onChange={handleChange('email')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={userData?.username || ''}
                InputProps={{ readOnly: true, startAdornment: <AccountCircle sx={{ mr: 1 }} /> }}
                variant="outlined"
              />
            </Grid>
            {/* Add more fields as needed, e.g., phone number, address */}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleEditToggle}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                },
                py: 1.5,
                px: 4,
                borderRadius: 3
              }}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Box>
        </Paper>
      </motion.div>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
