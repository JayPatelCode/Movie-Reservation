import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  CardMedia, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null); // For editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    poster_path: '',
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
          fetchMovies(token);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/login'); // Redirect to login on error
      }
    };
    checkAdminStatus();
  }, [navigate]);

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
      setError('Failed to fetch movies.');
    }
  };

  const handleOpenDialog = (movie = null) => {
    setCurrentMovie(movie);
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        duration: movie.duration,
        poster_path: movie.poster_path,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        duration: '',
        poster_path: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentMovie(null);
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
      if (currentMovie) {
        // Update existing movie
        await axios.put(`http://localhost:8000/movies/${currentMovie.id}/`, formData, config);
      } else {
        // Create new movie
        await axios.post('http://localhost:8000/movies/', formData, config);
      }
      fetchMovies(token);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving movie:', err);
      setError('Failed to save movie. Please check your input.');
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
      await axios.delete(`http://localhost:8000/movies/${id}/`, config);
      fetchMovies(token);
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Failed to delete movie.');
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
            Movie Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add New Movie</Button>
        </Box>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table sx={{ minWidth: 650 }} aria-label="movie management table">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Poster</TableCell>
                <TableCell sx={{ color: 'white' }}>Title</TableCell>
                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                <TableCell align="right" sx={{ color: 'white' }}>Duration (min)</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map((movie) => (
                <TableRow
                  key={movie.id}
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    {movie.poster_path && (
                      <CardMedia
                        component="img"
                        sx={{ width: 50, height: 75, objectFit: 'cover' }}
                        image={movie.poster_path}
                        alt={movie.title}
                      />
                    )}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {movie.title}
                  </TableCell>
                  <TableCell>{movie.description.substring(0, 100)}...</TableCell>
                  <TableCell align="right">{movie.duration}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(movie)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(movie.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{currentMovie ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Movie Title"
              type="text"
              fullWidth
              variant="standard"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="standard"
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="duration"
              label="Duration (minutes)"
              type="number"
              fullWidth
              variant="standard"
              value={formData.duration}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="poster_path"
              label="Poster URL (TMDb)"
              type="url"
              fullWidth
              variant="standard"
              value={formData.poster_path}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{currentMovie ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default MovieManagement;
