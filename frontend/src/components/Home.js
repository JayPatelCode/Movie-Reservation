import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, CardMedia, Container, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Fetching movies from API...');
    axios.get('http://localhost:8000/movies/')
      .then(response => {
        console.log('Movies fetched successfully:', response.data);
        setMovies(response.data);
        setLoading(false);
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
      <Paper 
        sx={{
          mb: 4,
          p: 6,
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to CinemaVault
        </Typography>
        <Typography variant="h5" component="p">
          Your best choice for movie tickets!
        </Typography>
      </Paper>

      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Now Showing ({movies.length})
      </Typography>
      
      <Grid container spacing={4}>
        {movies.map(movie => (
          <Grid item xs={12} sm={6} md={4} key={movie.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
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
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {movie.title}
                </Typography>
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
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
