import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Home from './components/Home';
import MovieDetails from './components/MovieDetails';
import Reservation from './components/Reservation';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import UserReservations from './components/UserReservations';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import TheaterManagement from './components/TheaterManagement';
import MovieManagement from './components/MovieManagement';
import ShowtimeManagement from './components/ShowtimeManagement';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/reservation/:id" element={<Reservation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-reservations" element={<UserReservations />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/theaters" element={<TheaterManagement />} />
              <Route path="/admin/movies" element={<MovieManagement />} />
              <Route path="/admin/showtimes" element={<ShowtimeManagement />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
