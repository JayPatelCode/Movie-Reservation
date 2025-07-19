import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardMedia } from '@mui/material';
import axios from 'axios';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your reservations.');
          return;
        }
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        };
        const response = await axios.get('http://localhost:8000/reservations/', config);
        setReservations(response.data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to fetch reservations. Please try again.');
      }
    };

    fetchReservations();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        My Reservations
      </Typography>
      {error && <Typography color="error" align="center">{error}</Typography>}
      {reservations.length === 0 && !error ? (
        <Typography align="center">You have no reservations yet.</Typography>
      ) : (
        <Grid container spacing={4}>
          {reservations.map(reservation => (
            <Grid item xs={12} md={6} key={reservation.id}>
              <Card sx={{ display: 'flex', height: '100%' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 151 }}
                  image={`http://localhost:8000${reservation.showtime.movie.poster}`}
                  alt={reservation.showtime.movie.title}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                      {reservation.showtime.movie.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                      {new Date(reservation.showtime.show_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Seats: {
                        reservation.selected_seats.map(seat => 
                          `R${seat.row_number}S${seat.seat_number}`
                        ).join(', ')
                      }
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UserReservations;
