import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Paper, Button, Box, CardMedia, Divider, Chip, Card, CardContent, Container, Grid, Rating, Avatar, Skeleton, Backdrop, IconButton, Tooltip, Fab } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayArrow, Share, Favorite, FavoriteBorder, AccessTime, CalendarToday, LocationOn, People, Star, ArrowBack, Theaters } from '@mui/icons-material';
import axios from 'axios';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/movies/${id}/`)
      .then(response => {
        setMovie(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the movie details!', error);
        setLoading(false);
      });

    axios.get(`http://localhost:8000/showtimes/?movie_id=${id}`)
      .then(response => {
        setShowtimes(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the showtimes!', error);
      });
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading || !movie) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Skeleton variant="rectangular" width={400} height={600} sx={{ borderRadius: 4 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '3rem', mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
              <Skeleton variant="text" sx={{ mb: 4 }} />
              {[1,2,3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
              ))}
            </Box>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      {/* Backdrop Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={showTrailer}
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 4, borderRadius: 4, minWidth: 300 }}>
                <Typography variant="h5" gutterBottom textAlign="center">
                  🎬 Movie Trailer
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  Trailer integration coming soon!
                </Typography>
              </Paper>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Back Button */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mb: 3, borderRadius: 3 }}
            variant="outlined"
          >
            Back to Movies
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Paper 
            sx={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ position: 'relative', p: { xs: 3, md: 6 } }}>
              <Grid container spacing={4} alignItems="flex-start">
                {/* Movie Poster */}
                <Grid item xs={12} md={4}>
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      {movie.poster_path ? (
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: '100%', 
                            height: { xs: 400, md: 600 }, 
                            objectFit: 'cover', 
                            borderRadius: 4,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          }}
                          image={movie.poster_path}
                          alt={movie.title}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: { xs: 400, md: 600 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          }}
                        >
                          <Theaters sx={{ fontSize: 100, opacity: 0.5 }} />
                        </Box>
                      )}
                      
                      {/* Play Trailer Button */}
                      <Fab
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(255,255,255,0.9)',
                          color: 'primary.main',
                          '&:hover': {
                            background: 'white',
                            transform: 'translate(-50%, -50%) scale(1.1)',
                          }
                        }}
                        onClick={() => setShowTrailer(true)}
                      >
                        <PlayArrow sx={{ fontSize: 40 }} />
                      </Fab>
                    </Box>
                  </motion.div>
                </Grid>

                {/* Movie Information */}
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Title and Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Typography 
                        variant="h3" 
                        component="h1"
                        sx={{ 
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1
                        }}
                      >
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                          <IconButton onClick={toggleFavorite} color={isFavorite ? "error" : "default"}>
                            {isFavorite ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share movie">
                          <IconButton color="primary">
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Movie Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={4.5} precision={0.5} size="large" readOnly />
                        <Typography variant="h6" color="text.secondary">
                          4.5 (2,847 reviews)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Movie Details Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                      <Chip 
                        icon={<AccessTime />}
                        label={`${movie.duration} minutes`} 
                        sx={{ 
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Chip label="Action" variant="outlined" />
                      <Chip label="Adventure" variant="outlined" />
                      <Chip label="Sci-Fi" variant="outlined" />
                    </Box>

                    {/* Description */}
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        mb: 4,
                        fontSize: '1.2rem'
                      }}
                    >
                      {movie.description}
                    </Typography>

                    {/* Additional Movie Info */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Director
                          </Typography>
                          <Typography variant="h6">
                            J.J. Abrams
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Year
                          </Typography>
                          <Typography variant="h6">
                            2024
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Language
                          </Typography>
                          <Typography variant="h6">
                            English
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Rating
                          </Typography>
                          <Typography variant="h6">
                            PG-13
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>

        {/* Showtimes Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center" 
            sx={{ 
              mt: 6, mb: 4,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            🎟️ Available Showtimes
          </Typography>

          <Grid container spacing={3}>
            {showtimes.map((showtime, index) => {
              const availableSeats = showtime.total_theater_seats - showtime.reserved_seat_count;
              const isAlmostFull = availableSeats <= 10;
              const isSoldOut = availableSeats <= 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={showtime.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, rotateY: 2 }}
                  >
                    <Card 
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: isSoldOut 
                          ? 'linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(139,0,0,0.1) 100%)'
                          : isAlmostFull
                          ? 'linear-gradient(135deg, rgba(255,165,0,0.1) 0%, rgba(255,140,0,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${isSoldOut ? 'rgba(255,0,0,0.3)' : isAlmostFull ? 'rgba(255,165,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: isSoldOut 
                            ? 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 100%)' 
                            : isAlmostFull
                            ? 'linear-gradient(90deg, #ffa726 0%, #fb8c00 100%)'
                            : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CalendarToday color="primary" />
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {new Date(showtime.show_time).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                          {new Date(showtime.show_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {showtime.theater?.name || 'Theater Name'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <People fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {availableSeats} seats available
                          </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ mb: 3, color: 'success.main', fontWeight: 'bold' }}>
                          ${showtime.price}
                        </Typography>

                        <Box sx={{ mt: 'auto' }}>
                          {isSoldOut ? (
                            <Button
                              variant="contained"
                              fullWidth
                              disabled
                              sx={{
                                borderRadius: 2,
                                py: 1.5,
                                background: 'rgba(255,0,0,0.1)',
                                color: 'error.main'
                              }}
                            >
                              🔴 Sold Out
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              fullWidth
                              component={Link}
                              to={`/reservation/${showtime.id}`}
                              size="large"
                              sx={{
                                background: isAlmostFull 
                                  ? 'linear-gradient(45deg, #ffa726 30%, #fb8c00 90%)'
                                  : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                py: 1.5,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                                }
                              }}
                            >
                              {isAlmostFull ? '⚡ Book Fast!' : '🎟️ Reserve Seats'}
                            </Button>
                          )}
                        </Box>

                        {isAlmostFull && !isSoldOut && (
                          <Chip
                            label="Almost Full!"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              background: 'rgba(255,165,0,0.9)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      </Container>
    </>
  );
};

export default MovieDetails;
