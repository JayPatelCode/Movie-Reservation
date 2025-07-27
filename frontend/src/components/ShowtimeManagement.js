import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ShowtimeManagement = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentShowtime, setCurrentShowtime] = useState(null); // For editing
  const [formData, setFormData] = useState({
    movie: '',
    theater: '',
    show_time: '',
    price: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/is_admin/', {
          headers: {
            'Authorization': `JWT ${token}`,
          },
        });
        if (!response.data.is_admin) {
          navigate('/'); // Redirect to home if not admin
        } else {
          fetchShowtimes(token);
          fetchMovies(token);
          fetchTheaters(token);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/login'); // Redirect to login on error
      }
    };
    checkAdminStatus();
  }, [navigate]);

  const fetchShowtimes = async (token) => {
    try {
      const config = {
        headers: {
          'Authorization': `JWT ${token}`,
        },
      };
      const response = await axios.get('http://localhost:8000/showtimes/', config);
      setShowtimes(response.data);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError('Failed to fetch showtimes.');
    }
  };

  const fetchMovies = async (token) => {
    try {
      const config = {
        headers: {
          'Authorization': `JWT ${token}`,
        },
      };
      const response = await axios.get('http://localhost:8000/movies/', config);
      setMovies(response.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchTheaters = async (token) => {
    try {
      const config = {
        headers: {
          'Authorization': `JWT ${token}`,
        },
      };
      const response = await axios.get('http://localhost:8000/theaters/', config);
      setTheaters(response.data);
    } catch (err) {
      console.error('Error fetching theaters:', err);
    }
  };

  const handleOpenDialog = (showtime = null) => {
    setCurrentShowtime(showtime);
    if (showtime) {
      setFormData({
        movie: showtime.movie.id,
        theater: showtime.theater.id,
        show_time: new Date(showtime.show_time).toISOString().slice(0, 16), // Format for datetime-local input
        price: showtime.price,
      });
    } else {
      setFormData({
        movie: '',
        theater: '',
        show_time: '',
        price: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentShowtime(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const config = {
      headers: {
        'Authorization': `JWT ${token}`,
      },
    };
    try {
      const payload = {
        ...formData,
        movie: formData.movie, // Ensure movie ID is sent
        theater: formData.theater, // Ensure theater ID is sent
      };

      if (currentShowtime) {
        // Update existing showtime
        await axios.put(`http://localhost:8000/showtimes/${currentShowtime.id}/`, payload, config);
      } else {
        // Create new showtime
        await axios.post('http://localhost:8000/showtimes/', payload, config);
      }
      fetchShowtimes(token);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving showtime:', err);
      setError('Failed to save showtime. Please check your input.');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const config = {
      headers: {
        'Authorization': `JWT ${token}`,
      },
    };
    try {
      await axios.delete(`http://localhost:8000/showtimes/${id}/`, config);
      fetchShowtimes(token);
    } catch (err) {
      console.error('Error deleting showtime:', err);
      setError('Failed to delete showtime.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton component={Link} to="/admin" color="primary" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom>
            Showtime Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Showtime</Button>
        </Box>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table sx={{ minWidth: 650 }} aria-label="showtime management table">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Movie</TableCell>
                <TableCell sx={{ color: 'white' }}>Theater</TableCell>
                <TableCell sx={{ color: 'white' }}>Show Time</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Price</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showtimes.map((showtime) => (
                <TableRow
                  key={showtime.id}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{showtime.movie.title}</TableCell>
                  <TableCell>{showtime.theater.name}</TableCell>
                  <TableCell>{new Date(showtime.show_time).toLocaleString()}</TableCell>
                  <TableCell align="right">${showtime.price}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(showtime)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(showtime.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{currentShowtime ? 'Edit Showtime' : 'Add New Showtime'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel id="movie-select-label">Movie</InputLabel>
              <Select
                labelId="movie-select-label"
                id="movie-select"
                name="movie"
                value={formData.movie}
                label="Movie"
                onChange={handleChange}
              >
                {movies.map((movie) => (
                  <MenuItem key={movie.id} value={movie.id}>
                    {movie.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="theater-select-label">Theater</InputLabel>
              <Select
                labelId="theater-select-label"
                id="theater-select"
                name="theater"
                value={formData.theater}
                label="Theater"
                onChange={handleChange}
              >
                {theaters.map((theater) => (
                  <MenuItem key={theater.id} value={theater.id}>
                    {theater.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              name="show_time"
              label="Show Time"
              type="datetime-local"
              fullWidth
              variant="standard"
              value={formData.show_time}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="dense"
              name="price"
              label="Price"
              type="number"
              fullWidth
              variant="standard"
              value={formData.price}
              onChange={handleChange}
              inputProps={{
                step: "0.01",
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{currentShowtime ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ShowtimeManagement;
