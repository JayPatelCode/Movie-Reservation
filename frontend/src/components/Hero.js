
import React from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import { Link } from 'react-router-dom';


const Hero = ({ movies, onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '600px', // Increased height for a more cinematic feel
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: movies.length > 0 ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${movies[0].poster_path})` : 'none',
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {movies.length > 0 && (
        <Box sx={{ textAlign: 'center', p: 3, zIndex: 1 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            {movies[0].title}
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 3, maxWidth: '700px', margin: '0 auto 24px', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            {movies[0].description.substring(0, 150)}...
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to={`/movie/${movies[0].id}`}
            sx={{
              fontSize: '1.2rem',
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(254, 107, 139, 0.4)',
              },
            }}
          >
            Book Tickets Now
          </Button>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', width: '100%', maxWidth: 500, mx: 'auto' }}>
            <TextField
              variant="outlined"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSearch(searchTerm);
                }
              }}
              fullWidth
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                  color: 'black',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(0,0,0,0.6)',
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                ml: 1,
                height: '56px', // Match TextField height
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                },
              }}
              onClick={() => onSearch(searchTerm)}
            >
              Search
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Hero;
