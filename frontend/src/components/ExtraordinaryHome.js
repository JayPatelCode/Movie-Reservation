import React, { useState, useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Button, CardMedia, Container, Box, Paper, Rating, Chip, TextField, InputAdornment, IconButton, Skeleton, Fab, Zoom, Badge, Avatar, Divider, Backdrop, SpeedDial, SpeedDialAction, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, PlayArrow, Star, Favorite, Share, Theaters, AccessTime, TrendingUp, Upcoming, LocalMovies, FilterList, KeyboardArrowUp, Explore, BookOnline, Movie, Close } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import MovieCarousel from './MovieCarousel';
import './ExtraordinaryHome.css';

const ExtraordinaryHome = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [stats, setStats] = useState({ totalMovies: 0, totalTheaters: 0, totalBookings: 0 });
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const { mode } = useTheme();
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const progressBar = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (searchTerm) {
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.genres && movie.genres.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'all') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => 
        movie.genres && movie.genres.toLowerCase().includes(genre.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/movies/')
      .then(response => {
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
    <div className="extraordinary-home">
      <header className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your Ultimate Movie Destination
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Discover, book, and enjoy the latest blockbusters in a snap.
          </motion.p>
        </div>
      </header>

      <Container maxWidth="lg" sx={{ mt: -10 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
            Now Showing
          </Typography>
          <Grid container spacing={4}>
            {filteredMovies.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} key={movie.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="movie-card">
                    <CardMedia
                      component="img"
                      height="400"
                      image={movie.poster_path}
                      alt={movie.title}
                      className="movie-card-media"
                    />
                    <CardContent className="movie-card-content">
                      <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={movie.average_rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({(movie.average_rating || 0).toFixed(1)})
                        </Typography>
                      </Box>
                      <Chip label={movie.genre} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {movie.description.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button variant="contained" component={Link} to={`/movie/${movie.id}`} fullWidth>
                        Book Tickets
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Coming Soon
        </Typography>
        <MovieCarousel movies={comingSoonMovies} />
      </Container>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Trending Movies
        </Typography>
        <MovieCarousel movies={trendingMovies} />
      </Container>
    </div>
  );
};

export default ExtraordinaryHome;