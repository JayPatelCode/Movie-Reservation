import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Box, Card, CardMedia, CardContent, Typography, Button, Rating } from '@mui/material';
import { Link } from 'react-router-dom';

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    slidesToSlide: 5,
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    slidesToSlide: 4,
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    slidesToSlide: 2,
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    slidesToSlide: 1,
    items: 1,
  },
};

const MovieCarousel = ({ movies, title }) => {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {movies.map((movie) => (
          <Box key={movie.id} sx={{ p: 1 }}>
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
                  height="300"
                  image={movie.poster_path}
                  alt={movie.title}
                  sx={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {movie.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={movie.average_rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    ({(movie.average_rating || 0).toFixed(1)})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {movie.description.substring(0, 50)}...
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" component={Link} to={`/movie/${movie.id}`} fullWidth>
                  View Details
                </Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default MovieCarousel;