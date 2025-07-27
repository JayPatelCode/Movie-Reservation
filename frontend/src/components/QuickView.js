
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const QuickView = ({ movie, open, handleClose }) => {
  if (!movie) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        display: 'flex',
        boxShadow: 24,
        p: 0,
      }}>
        <Box sx={{ flex: 1, p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {movie.title}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {movie.description}
          </Typography>
          <Button component={Link} to={`/movie/${movie.id}`} sx={{ mt: 2 }} variant="contained">
            Book Now
          </Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          <img src={movie.poster_path} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      </Box>
    </Modal>
  );
};

export default QuickView;
