import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TheaterIcon from '@mui/icons-material/TheaterComedy';
import MovieIcon from '@mui/icons-material/Movie';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalSeatsBooked, setTotalSeatsBooked] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatusAndFetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const adminResponse = await axios.get('http://localhost:8000/is_admin/', {
          headers: {
            'Authorization': `JWT ${token}`,
          },
        });
        if (!adminResponse.data.is_admin) {
          navigate('/'); // Redirect to home if not admin
        } else {
          setIsAdmin(true);
          // Fetch total seats booked
          const seatsResponse = await axios.get('http://localhost:8000/total_seats_booked/', {
            headers: {
              'Authorization': `JWT ${token}`,
            },
          });
          setTotalSeatsBooked(seatsResponse.data.total_seats_booked);
          // Fetch total revenue
          const revenueResponse = await axios.get('http://localhost:8000/total_revenue/', {
            headers: {
              'Authorization': `JWT ${token}`,
            },
          });
          setTotalRevenue(revenueResponse.data.total_revenue);
        }
      } catch (error) {
        console.error('Error checking admin status or fetching data:', error);
        navigate('/login'); // Redirect to login on error
      }
    };
    checkAdminStatusAndFetchData();
  }, [navigate]);

  if (!isAdmin) {
    return <Typography>Loading...</Typography>; // Or a more elaborate loading state
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, boxShadow: 2 }}>
              <EventSeatIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="div" gutterBottom>
                Total Seats Booked
              </Typography>
              <Typography variant="h4" color="primary">
                {totalSeatsBooked}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, boxShadow: 2 }}>
              <AttachMoneyIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="div" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalRevenue.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mt: 4, mb: 3 }}>
          Management Sections
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 3, 
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
                cursor: 'pointer'
              }}
              component={Link} to="/admin/theaters"
            >
              <TheaterIcon color="action" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" component="div">
                Manage Theaters
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 3, 
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
                cursor: 'pointer'
              }}
              component={Link} to="/admin/movies"
            >
              <MovieIcon color="action" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" component="div">
                Manage Movies
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 3, 
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
                cursor: 'pointer'
              }}
              component={Link} to="/admin/showtimes"
            >
              <AttachMoneyIcon color="action" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" component="div">
                Manage Showtimes
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
