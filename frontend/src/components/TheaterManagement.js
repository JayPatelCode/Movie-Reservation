import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TheaterManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTheater, setCurrentTheater] = useState(null); // For editing
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rows: '',
    seats_per_row: '',
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
          fetchTheaters(token);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/login'); // Redirect to login on error
      }
    };
    checkAdminStatus();
  }, [navigate]);

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
      setError('Failed to fetch theaters.');
    }
  };

  const handleOpenDialog = (theater = null) => {
    setCurrentTheater(theater);
    if (theater) {
      setFormData({
        name: theater.name,
        address: theater.address,
        rows: theater.rows,
        seats_per_row: theater.seats_per_row,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        rows: '',
        seats_per_row: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTheater(null);
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
      if (currentTheater) {
        // Update existing theater
        await axios.put(`http://localhost:8000/theaters/${currentTheater.id}/`, formData, config);
      } else {
        // Create new theater
        await axios.post('http://localhost:8000/theaters/', formData, config);
      }
      fetchTheaters(token);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving theater:', err);
      setError('Failed to save theater. Please check your input.');
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
      await axios.delete(`http://localhost:8000/theaters/${id}/`, config);
      fetchTheaters(token);
    } catch (err) {
      console.error('Error deleting theater:', err);
      setError('Failed to delete theater.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Theater Management
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button variant="outlined" component={Link} to="/admin">
            Back to Admin Dashboard
          </Button>
          <Button variant="contained" onClick={() => handleOpenDialog()}>Add New Theater</Button>
        </Box>

        {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Rows</TableCell>
                <TableCell align="right">Seats per Row</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {theaters.map((theater) => (
                <TableRow
                  key={theater.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {theater.name}
                  </TableCell>
                  <TableCell>{theater.address}</TableCell>
                  <TableCell align="right">{theater.rows}</TableCell>
                  <TableCell align="right">{theater.seats_per_row}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => handleOpenDialog(theater)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(theater.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{currentTheater ? 'Edit Theater' : 'Add New Theater'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Theater Name"
              type="text"
              fullWidth
              variant="standard"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="address"
              label="Address"
              type="text"
              fullWidth
              variant="standard"
              value={formData.address}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="rows"
              label="Number of Rows"
              type="number"
              fullWidth
              variant="standard"
              value={formData.rows}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="seats_per_row"
              label="Seats per Row"
              type="number"
              fullWidth
              variant="standard"
              value={formData.seats_per_row}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{currentTheater ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TheaterManagement;
