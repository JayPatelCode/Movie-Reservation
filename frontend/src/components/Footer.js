import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 6,
      mt: 'auto', // Push footer to the bottom
      borderTop: (theme) => `1px solid ${theme.palette.divider}`,
    }} component="footer">
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          MovieReservation
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Your best choice for movie tickets!
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="https://mui.com/">
            MovieReservation
          </Link>{' '}
          {new Date().getFullYear()}{'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
