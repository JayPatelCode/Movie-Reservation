import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Paper, Button, Box, Grid, Chip, Container, Card, CardContent, Divider, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { EventSeat, ArrowBack, Payment, ConfirmationNumber, AccessTime, LocationOn, AttachMoney, Person, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

const Reservation = () => {
  const { id } = useParams(); // showtime_id
  console.log('🎬 Reservation component loaded with showtime ID:', id); // Debug log
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [theater, setTheater] = useState(null);
  const [allSeats, setAllSeats] = useState([]);
  const [reservedSeatIds, setReservedSeatIds] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [currentStep] = useState(0);

  const steps = ['Select Seats', 'Review & Pay', 'Confirmation'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        } : {};

        const showtimeResponse = await axios.get(`http://localhost:8000/showtimes/${id}/`);
        const currentShowtime = showtimeResponse.data;
        console.log('🎪 Fetched showtime data:', currentShowtime); // Debug log
        console.log('📽️ Movie in this showtime:', currentShowtime.movie); // Debug log
        setShowtime(currentShowtime);

        const theaterResponse = await axios.get(`http://localhost:8000/theaters/${currentShowtime.theater.id}/`);
        const currentTheater = theaterResponse.data;
        setTheater(currentTheater);

        // Fetch all seats for this theater
        const allSeatsResponse = await axios.get(`http://localhost:8000/seats/?theater=${currentTheater.id}`);
        setAllSeats(allSeatsResponse.data);

        // Fetch all reserved seat IDs for this showtime
        try {
          const reservedSeatsResponse = await axios.get(`http://localhost:8000/showtimes/${id}/reserved_seats/`, config);
          setReservedSeatIds(reservedSeatsResponse.data);
        } catch (err) {
          console.warn('Could not fetch reserved seats:', err);
          setReservedSeatIds([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data for reservation:', err);
        setError('Failed to load reservation details.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSeatClick = (seatId) => {
    if (reservedSeatIds.includes(seatId)) {
      return; // Cannot select already reserved seats
    }
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter(sId => sId !== seatId));
    } else {
      if (selectedSeatIds.length < 8) { // Max 8 seats per booking
        setSelectedSeatIds([...selectedSeatIds, seatId]);
      }
    }
  };

  const handleConfirmClick = () => {
    if (selectedSeatIds.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    setConfirmDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };
      await axios.post('http://localhost:8000/reservations/', {
        showtime_pk: id,
        seat_ids: selectedSeatIds,
      }, config);
      setConfirmDialog(false);
      navigate('/my-reservations');
    } catch (err) {
      console.error('Reservation failed!', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Reservation failed. Please try again.');
      }
      setConfirmDialog(false);
    }
  };

  const renderSeat = (seat, rowIndex, seatIndex) => {
    const isReserved = reservedSeatIds.includes(seat.id);
    const isSelected = selectedSeatIds.includes(seat.id);
    const isVIP = rowIndex < 3; // First 3 rows are VIP
    const isCenter = seatIndex > theater.seats_per_row * 0.25 && seatIndex < theater.seats_per_row * 0.75;

    let seatStatus = 'available';
    if (isReserved) seatStatus = 'reserved';
    else if (isSelected) seatStatus = 'selected';
    else if (isVIP) seatStatus = 'vip';

    const getSeatColor = () => {
      switch (seatStatus) {
        case 'reserved': return '#ff4444';
        case 'selected': return '#ff9500';
        case 'vip': return '#9c27b0';
        default: return '#4caf50';
      }
    };

    return (
      <motion.div
        key={seat.id}
        whileHover={!isReserved ? { scale: 1.2, rotateX: 15 } : {}}
        whileTap={!isReserved ? { scale: 0.9 } : {}}
        animate={isSelected ? { scale: 1.1, rotateY: 10 } : {}}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Box
          sx={{
            width: { xs: 32, md: 42 },
            height: { xs: 32, md: 42 },
            margin: { xs: 0.3, md: 0.5 },
            cursor: isReserved ? 'not-allowed' : 'pointer',
            position: 'relative',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
          onClick={() => handleSeatClick(seat.id)}
        >
          {/* Seat Base */}
          <Box
            sx={{
              width: '100%',
              height: '80%',
              background: `linear-gradient(145deg, ${getSeatColor()}, ${getSeatColor()}dd)`,
              borderRadius: '6px 6px 4px 4px',
              border: `2px solid ${getSeatColor()}aa`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: isSelected 
                ? `0 8px 25px ${getSeatColor()}66, inset 0 1px 0 rgba(255,255,255,0.2)` 
                : `0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '20%',
                right: '20%',
                height: '8px',
                background: `linear-gradient(to bottom, ${getSeatColor()}, ${getSeatColor()}bb)`,
                borderRadius: '4px 4px 0 0',
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.2)`,
              },
              '&::after': isVIP ? {
                content: '"👑"',
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
              } : {},
            }}
          >
            {/* Seat Number */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.6rem', md: '0.75rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                userSelect: 'none'
              }}
            >
              {seat.seat_number}
            </Typography>
            
            {/* Selection Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle sx={{ fontSize: 16, color: '#ff9500' }} />
              </motion.div>
            )}
          </Box>
        </Box>
      </motion.div>
    );
  };

  const renderTheaterSeats = () => {
    if (!theater || !allSeats.length) return null;

    const seatMap = {};
    allSeats.forEach(seat => {
      if (!seatMap[seat.row_number]) {
        seatMap[seat.row_number] = {};
      }
      seatMap[seat.row_number][seat.seat_number] = seat;
    });

    const rows = [];
    for (let r = 1; r <= theater.rows; r++) {
      const seatsInRow = [];
      for (let s = 1; s <= theater.seats_per_row; s++) {
        const seat = seatMap[r] ? seatMap[r][s] : null;
        if (!seat) continue;
        seatsInRow.push(renderSeat(seat, r - 1, s - 1));
      }
      
      rows.push(
        <motion.div
          key={`row-${r}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: r * 0.05 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: { xs: 0.5, md: 1 },
            px: 2
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                mr: { xs: 1, md: 2 }, 
                minWidth: { xs: 20, md: 30 },
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', md: '0.8rem' }
              }}
            >
              {String.fromCharCode(64 + r)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0 }}>
              {seatsInRow}
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                ml: { xs: 1, md: 2 }, 
                minWidth: { xs: 20, md: 30 },
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', md: '0.8rem' }
              }}
            >
              {String.fromCharCode(64 + r)}
            </Typography>
          </Box>
        </motion.div>
      );
    }

    return (
      <Box sx={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
        borderRadius: 4,
        p: { xs: 2, md: 4 },
        perspective: '1000px',
        position: 'relative',
        '&::before': {
          content: '"SCREEN"',
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 40px',
          borderRadius: '0 0 20px 20px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          letterSpacing: '3px'
        }
      }}>
        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          {rows}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={300} height={40} sx={{ mx: 'auto', mt: 2 }} />
          </Box>
          <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
        </motion.div>
      </Container>
    );
  }

  if (!showtime || !theater) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error loading reservation details
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error || 'Please try again later.'}
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const totalPrice = showtime.price * selectedSeatIds.length;
  const selectedSeatsText = selectedSeatIds.map(id => {
    const seat = allSeats.find(s => s.id === id);
    return seat ? `${String.fromCharCode(64 + seat.row_number)}${seat.seat_number}` : '';
  }).join(', ');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Button
          component={Link}
          to={`/movie/${showtime.movie.id}`}
          startIcon={<ArrowBack />}
          sx={{ mb: 3, borderRadius: 3 }}
          variant="outlined"
        >
          Back to Movie Details
        </Button>

        <Paper 
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                🎬 {showtime.movie.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Chip 
                  icon={<AccessTime />}
                  label={new Date(showtime.show_time).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                  sx={{ background: 'rgba(102, 126, 234, 0.1)' }}
                />
                <Chip 
                  icon={<AccessTime />}
                  label={new Date(showtime.show_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  sx={{ background: 'rgba(118, 75, 162, 0.1)' }}
                />
                <Chip 
                  icon={<LocationOn />}
                  label={theater.name}
                  sx={{ background: 'rgba(254, 107, 139, 0.1)' }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ticket Price
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${showtime.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per seat
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Stepper */}
          <Stepper activeStep={currentStep} sx={{ mt: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </motion.div>

      {/* Seat Selection */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
              <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
                🎭 Select Your Seats
              </Typography>
              
              {/* Legend */}
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Chip 
                  icon={<EventSeat />} 
                  label="Available" 
                  sx={{ bgcolor: '#4caf50', color: 'white' }} 
                />
                <Chip 
                  icon={<EventSeat />} 
                  label="Selected" 
                  sx={{ bgcolor: '#ff9500', color: 'white' }} 
                />
                <Chip 
                  icon={<EventSeat />} 
                  label="Reserved" 
                  sx={{ bgcolor: '#ff4444', color: 'white' }} 
                />
                <Chip 
                  icon={<EventSeat />} 
                  label="VIP (👑)" 
                  sx={{ bgcolor: '#9c27b0', color: 'white' }} 
                />
              </Box>

              {renderTheaterSeats()}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                position: 'sticky',
                top: 100,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                🎟️ Booking Summary
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Selected Seats ({selectedSeatIds.length})
                </Typography>
                <Typography variant="h6">
                  {selectedSeatsText || 'None selected'}
                </Typography>
              </Box>

              {selectedSeatIds.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Seats ({selectedSeatIds.length})</Typography>
                    <Typography>${(showtime.price * selectedSeatIds.length).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Booking Fee</Typography>
                    <Typography>$2.50</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      ${(totalPrice + 2.5).toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}

              {error && (
                <Typography color="error" sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={selectedSeatIds.length === 0}
                onClick={handleConfirmClick}
                startIcon={<Payment />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                {selectedSeatIds.length === 0 
                  ? 'Select Seats to Continue'
                  : `Proceed to Payment (${selectedSeatIds.length} seats)`
                }
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                💡 Maximum 8 seats per booking
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog} 
        onClose={() => setConfirmDialog(false)}
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
          <ConfirmationNumber sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" component="div">
            Confirm Your Booking
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {showtime.movie.title}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {new Date(showtime.show_time).toLocaleString()}
            </Typography>
            <Typography color="text.secondary">
              {theater.name}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Seats: {selectedSeatsText}
            </Typography>
            <Typography variant="h6" color="primary">
              Total: ${(totalPrice + 2.5).toFixed(2)}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            By proceeding, you agree to our terms and conditions. Your seats will be reserved for 10 minutes.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialog(false)}
            sx={{ borderRadius: 3 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
              }
            }}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reservation;
