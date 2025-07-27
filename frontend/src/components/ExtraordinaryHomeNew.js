import React, { useState, useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Button, CardMedia, Container, Box, Paper, Rating, Chip, TextField, InputAdornment, IconButton, Skeleton, Fab, Zoom, Badge, Avatar, Divider, LinearProgress, SpeedDial, SpeedDialAction, Backdrop } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Search, PlayArrow, Star, Favorite, Share, Theaters, AccessTime, TrendingUp, Upcoming, LocalMovies, FilterList, KeyboardArrowUp, Explore, BookOnline, Movie, Close, WhatsHot, Schedule, Event } from '@mui/icons-material';
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
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [stats, setStats] = useState({ totalMovies: 0, totalTheaters: 5, totalBookings: 1250 });
  const { mode } = useTheme();
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Transform values for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.4], [100, 0]);
  
  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
  
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

  // Enhanced genre keyword mapping for better matching
  const genreKeywords = {
    action: ['action', 'fight', 'battle', 'combat', 'war', 'adventure', 'hero', 'superhero', 'mission', 'chase', 'explosion', 'martial', 'spy', 'agent', 'soldier', 'warrior', 'rescue', 'revenge', 'thriller'],
    comedy: ['comedy', 'funny', 'humor', 'laugh', 'comic', 'hilarious', 'parody', 'satire', 'romantic comedy', 'family', 'animated', 'kids', 'cartoon'],
    drama: ['drama', 'family', 'life', 'story', 'emotional', 'relationship', 'love', 'romance', 'biographical', 'historical', 'tragedy', 'coming of age', 'social'],
    horror: ['horror', 'scary', 'fear', 'ghost', 'monster', 'zombie', 'vampire', 'supernatural', 'thriller', 'suspense', 'dark', 'evil', 'haunted', 'demon'],
    'sci-fi': ['sci-fi', 'science fiction', 'space', 'future', 'technology', 'robot', 'alien', 'time travel', 'dystopian', 'cyberpunk', 'fantasy', 'supernatural', 'magic'],
    romance: ['romance', 'love', 'romantic', 'relationship', 'couple', 'wedding', 'marriage', 'dating', 'heart', 'passion', 'drama'],
    thriller: ['thriller', 'suspense', 'mystery', 'crime', 'detective', 'investigation', 'murder', 'conspiracy', 'psychological', 'action', 'tension']
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre.toLowerCase());
    if (genre === 'All') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => {
        // Handle different genre formats
        if (!movie.genres) {
          // If genres is null/undefined, use enhanced keyword matching
          const titleAndDesc = `${movie.title} ${movie.description || ''}`.toLowerCase();
          const genreKey = genre.toLowerCase();
          
          // Get keywords for the selected genre
          const keywords = genreKeywords[genreKey] || [genreKey];
          
          // Check if any of the keywords match
          return keywords.some(keyword => titleAndDesc.includes(keyword));
        }
        
        // If genres is a string
        if (typeof movie.genres === 'string') {
          return movie.genres.toLowerCase().includes(genre.toLowerCase());
        }
        
        // If genres is an array
        if (Array.isArray(movie.genres)) {
          return movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()));
        }
        
        return false;
      });
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
        setFeaturedMovie(response.data[0]); // Set first movie as featured
        setStats(prev => ({ ...prev, totalMovies: response.data.length }));
        setLoading(false);
        return axios.get('http://localhost:8000/movies/coming_soon/');
      })
      .then(response => {
        setComingSoonMovies(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the movies!', error);
        setComingSoonMovies([]);
        setLoading(false);
      });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    },
    hover: { 
      scale: 1.05, 
      y: -10,
      rotateY: 5,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Movie sx={{ fontSize: 60, color: 'white', mb: 2 }} />
        </motion.div>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Loading Cinema Magic...
        </Typography>
        <LinearProgress 
          sx={{ 
            width: 300, 
            mt: 2, 
            height: 6, 
            borderRadius: 3,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcf7f, #4d9de0, #9b59b6)'
            }
          }} 
        />
      </Box>
    );
  }

  return (
    <Box className="extraordinary-home" sx={{ overflow: 'hidden' }}>
      {/* Scroll Progress Bar */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          transformOrigin: '0%',
          zIndex: 9999,
          scaleX: scrollYProgress
        }}
      />

      {/* Floating Particles Background */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: -1,
          background: mode === 'dark' 
            ? 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)'
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
            }}
          />
        ))}
      </Box>

      {/* Hero Section with Parallax */}
      <motion.section 
        className="hero-section"
        style={{ 
          y: heroY,
          opacity: heroOpacity
        }}
      >
        <Box 
          sx={{
            position: 'relative',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: featuredMovie 
              ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${featuredMovie.poster_path})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            textAlign: 'center'
          }}
        >
          {/* Animated Overlay */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}
          />
          
          <Container maxWidth="lg" sx={{ zIndex: 2, position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 900,
                  mb: 3,
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                ✨ EXTRAORDINARY CINEMA ✨
              </Typography>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 4,
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                  }}
                >
                  Where Dreams Meet Reality 🎬
                </Typography>
              </motion.div>

              {/* Search Bar with Glass Morphism */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for movies, genres, or experiences..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{
                    maxWidth: 600,
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 8,
                      '& fieldset': { border: 'none' },
                      '&:hover': {
                        background: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                      },
                      '& input': { 
                        color: 'white',
                        fontSize: '1.1rem'
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(255,255,255,0.8)' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </motion.div>

              {/* Genre Filter Chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 4 }}>
                  {genres.map((genre, index) => (
                    <motion.div
                      key={genre}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Chip
                        label={genre}
                        onClick={() => handleGenreFilter(genre)}
                        sx={{
                          background: selectedGenre === genre.toLowerCase() || (genre === 'All' && selectedGenre === 'all')
                            ? 'linear-gradient(45deg, #667eea, #764ba2)'
                            : mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)',
                          color: selectedGenre === genre.toLowerCase() || (genre === 'All' && selectedGenre === 'all')
                            ? 'white'
                            : mode === 'dark' ? 'white' : '#333',
                          border: mode === 'dark' 
                            ? '1px solid rgba(255,255,255,0.3)' 
                            : '1px solid rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            color: 'white',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </motion.div>
          </Container>
        </Box>
      </motion.section>

      {/* Stats Section with Counter Animation */}
      <motion.div style={{ y: statsY }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Grid container spacing={4}>
              {[
                { icon: Movie, label: 'Movies', value: stats.totalMovies, color: '#667eea' },
                { icon: Theaters, label: 'Theaters', value: stats.totalTheaters, color: '#764ba2' },
                { icon: Event, label: 'Bookings', value: stats.totalBookings, color: '#ff6b6b' }
              ].map((stat, index) => (
                <Grid item xs={12} md={4} key={stat.label}>
                  <motion.div variants={cardVariants}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                      background: mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(20px)',
                      border: mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.1)' 
                        : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 4,
                      boxShadow: mode === 'dark' 
                        ? '0 8px 32px rgba(0,0,0,0.3)' 
                        : '0 8px 32px rgba(0,0,0,0.1)',
                      }}
                    >
                      <motion.div
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: 360,
                          color: stat.color 
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        <stat.icon sx={{ fontSize: 50, mb: 2, color: stat.color }} />
                      </motion.div>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                        {stat.value}+
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </motion.div>

      {/* Movies Grid with Advanced Animations */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              mb: 6, 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🎭 NOW SHOWING 🎭
          </Typography>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Grid container spacing={4}>
            {filteredMovies.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} key={movie.id}>
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      background: mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.1)' 
                        : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: mode === 'dark' 
                        ? '0 8px 32px rgba(0,0,0,0.3)' 
                        : '0 8px 32px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 1
                      },
                      '&:hover::before': {
                        opacity: 1
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <CardMedia
                          component="img"
                          height="400"
                          image={movie.poster_path}
                          alt={movie.title}
                          sx={{ 
                            borderRadius: '16px 16px 0 0',
                            filter: 'brightness(0.9) contrast(1.1)'
                          }}
                        />
                      </motion.div>
                      
                      {/* Hover Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          zIndex: 2,
                          '&:hover': { opacity: 1 }
                        }}
                        className="hover-overlay"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <IconButton
                            component={Link}
                            to={`/movie/${movie.id}`}
                            sx={{
                              background: 'linear-gradient(45deg, #667eea, #764ba2)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #764ba2, #667eea)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 40 }} />
                          </IconButton>
                        </motion.div>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, zIndex: 3, position: 'relative' }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 2,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {movie.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating 
                          value={movie.average_rating} 
                          precision={0.5} 
                          readOnly 
                          size="small" 
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: '#FFD700'
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({(movie.average_rating || 0).toFixed(1)}) ⭐
                        </Typography>
                      </Box>

                      {movie.genres && (
                        <Chip 
                          label={movie.genres}
                          size="small"
                          sx={{
                            mb: 2,
                            background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                            color: 'primary.main',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                          }}
                        />
                      )}

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {movie.description ? movie.description.substring(0, 120) + '...' : 'Experience the magic of cinema...'}
                      </Typography>

                      <Button
                        component={Link}
                        to={`/movie/${movie.id}`}
                        variant="contained"
                        fullWidth
                        startIcon={<Movie />}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          borderRadius: 3,
                          py: 1.5,
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #764ba2, #667eea)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                      >
                        Book Now 🎟️
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Coming Soon Section */}
      {comingSoonMovies.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              align="center" 
              sx={{ 
                mb: 6, 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🚀 COMING SOON 🚀
            </Typography>
            <MovieCarousel movies={comingSoonMovies} />
          </motion.div>
        </Container>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          '& .MuiFab-primary': {
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
            }
          }
        }}
        icon={<Explore />}
        openIcon={<Close />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        <SpeedDialAction
          icon={<BookOnline />}
          tooltipTitle="My Bookings"
          onClick={() => window.location.href = '/my-reservations'}
        />
        <SpeedDialAction
          icon={<Star />}
          tooltipTitle="Top Rated"
          onClick={() => handleGenreFilter('All')}
        />
        <SpeedDialAction
          icon={<KeyboardArrowUp />}
          tooltipTitle="Scroll to Top"
          onClick={scrollToTop}
        />
      </SpeedDial>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollToTop}>
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>

      <style jsx>{`
        .extraordinary-home .hover-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </Box>
  );
};

export default ExtraordinaryHome;
