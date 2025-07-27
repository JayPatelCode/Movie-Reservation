import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, CardMedia, Container, Box, Paper, Rating, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Hero from './Hero';
import QuickView from './QuickView';
import { motion } from 'framer-motion';
import MovieCarousel from './MovieCarousel';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleOpen = (movie) => {
    setSelectedMovie(movie);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMovie(null);
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  };

  useEffect(() => {
    console.log('Fetching movies from API...');
    axios.get('http://localhost:8000/movies/')
      .then(response => {
        console.log('Movies fetched successfully:', response.data);
        setMovies(response.data);
        setFilteredMovies(response.data);
        setLoading(false);
        return axios.get('http://localhost:8000/movies/coming_soon/');
      })
      .then(response => {
        setComingSoonMovies(response.data);
        return axios.get('http://localhost:8000/movies/trending/');
      })
      .then(response => {
        setTrendingMovies(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the movies!', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading movies...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Hero movies={movies} onSearch={handleSearch} />

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Now Showing ({movies.length})
        </Typography>
        <Grid container spacing={4}>
          {filteredMovies.map((movie, index) => (
            <Grid item xs={12} sm={6} md={4} key={movie.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 24px 0 rgba(254, 107, 139, 0.25)',
                  },
                  borderRadius: 2,
                }}>
                  {movie.poster_path && (
                    <CardMedia
                      component="img"
                      height="400"
                      image={movie.poster_path}
                      alt={movie.title}
                      sx={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {movie.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={movie.vote_average / 2} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({movie.vote_average})
                      </Typography>
                    </Box>
                    <Chip label={movie.genre} size="small" sx={{ mb: 1, bgcolor: 'primary.main', color: 'white' }} />
                    <Typography variant="body2" color="text.secondary">
                      {movie.description.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" component={Link} to={`/movie/${movie.id}`} fullWidth>
                      Book Tickets
                    </Button>
                    <Button variant="outlined" onClick={() => handleOpen(movie)} fullWidth sx={{ ml: 1 }}>
                      Quick View
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Coming Soon
        </Typography>
        <Grid container spacing={4}>
          {comingSoonMovies.map((movie, index) => (
            <Grid item xs={12} sm={6} md={4} key={movie.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 24px 0 rgba(254, 107, 139, 0.25)',
                  },
                  borderRadius: 2,
                }}>
                  {movie.poster_path && (
                    <CardMedia
                      component="img"
                      height="400"
                      image={movie.poster_path}
                      alt={movie.title}
                      sx={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {movie.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={movie.vote_average / 2} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({movie.vote_average})
                      </Typography>
                    </Box>
                    <Chip label={movie.genre} size="small" sx={{ mb: 1, bgcolor: 'primary.main', color: 'white' }} />
                    <Typography variant="body2" color="text.secondary">
                      {movie.description.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
      <MovieCarousel movies={trendingMovies} title="Trending Movies" />
    </Container>
  );
};

export default Home;
