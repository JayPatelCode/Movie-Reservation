import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardMedia, Chip, Button, Skeleton, Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';
import { AccessTime, LocationOn, EventSeat, ConfirmationNumber, Movie, CalendarToday, QrCode, Close, GetApp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your reservations.');
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            'Authorization': `JWT ${token}`,
          },
        };
        const response = await axios.get('http://localhost:8000/reservations/', config);
        setReservations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('Failed to fetch reservations. Please try again.');
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          My Reservations
        </Typography>
        <Grid container spacing={4}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
          <ConfirmationNumber sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} /> My Bookings
        </Typography>
      </motion.div>

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'error.dark', color: 'white', textAlign: 'center' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {reservations.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Movie sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Reservations Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              It looks like you haven't booked any movies yet. Start exploring our showtimes!
            </Typography>
            <Button variant="contained" component={Link} to="/" size="large">
              Browse Movies
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Grid container spacing={4}>
          {reservations.map((reservation, index) => {
            const showtimeDate = new Date(reservation.showtime.show_time);
            const isPastBooking = showtimeDate < new Date();

            return (
              <Grid item xs={12} md={6} key={reservation.id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      background: isPastBooking 
                        ? 'linear-gradient(135deg, rgba(255,0,0,0.05) 0%, rgba(139,0,0,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      border: `1px solid ${isPastBooking ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: { xs: '100%', sm: 160 },
                        height: { xs: 200, sm: 'auto' },
                        objectFit: 'cover',
                      }}
                      image={reservation.showtime.movie.poster_path}
                      alt={reservation.showtime.movie.title}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                        <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {reservation.showtime.movie.title}
                        </Typography>
                        <Chip 
                          label={isPastBooking ? "Past Booking" : "Upcoming"}
                          size="small"
                          color={isPastBooking ? "error" : "success"}
                          sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            {showtimeDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            {showtimeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            {reservation.showtime.theater.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EventSeat fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            Seats: {reservation.seat_numbers?.join(', ') || 'N/A'}
                          </Typography>
                        </Box>
                        
                        {/* Booking Reference */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ConfirmationNumber fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            Ref: {reservation.booking_reference || 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            component={Link} 
                            to={`/movie/${reservation.showtime.movie.id}`}
                            startIcon={<Movie />}
                          >
                            Movie Details
                          </Button>
                          
                          {reservation.qr_code_url && (
                            <Button 
                              variant="outlined" 
                              size="small" 
                              startIcon={<QrCode />}
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setQrDialogOpen(true);
                              }}
                            >
                              QR Code
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}
      
      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <QrCode sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
              Your Ticket QR Code
            </Typography>
            <IconButton onClick={() => setQrDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          {selectedReservation && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedReservation.showtime.movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(selectedReservation.showtime.show_time).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedReservation.showtime.theater.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Booking Ref: {selectedReservation.booking_reference}
                </Typography>
              </Box>
              
              {selectedReservation.qr_code_url && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '2px dashed #ccc'
                }}>
                  <img 
                    src={selectedReservation.qr_code_url} 
                    alt="QR Code" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Present this QR code at the theater entrance
              </Typography>
              
              {selectedReservation.qr_code_url && (
                <Button 
                  variant="outlined"
                  startIcon={<GetApp />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedReservation.qr_code_url;
                    link.download = `ticket-${selectedReservation.booking_reference}.png`;
                    link.click();
                  }}
                >
                  Download QR Code
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserReservations;
