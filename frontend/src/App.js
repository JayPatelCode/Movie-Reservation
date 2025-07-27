import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import ExtraordinaryHome from './components/ExtraordinaryHomeNew';
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
import UserProfile from './components/UserProfile';
import ForgotPassword from './components/ForgotPassword';
import PasswordResetConfirm from './components/PasswordResetConfirm';

function App() {
  return (
    <CustomThemeProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<ExtraordinaryHome />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/reservation/:id" element={<Reservation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-reservations" element={<UserReservations />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/theaters" element={<TheaterManagement />} />
              <Route path="/admin/movies" element={<MovieManagement />} />
              <Route path="/admin/showtimes" element={<ShowtimeManagement />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password/reset/confirm/:uid/:token" element={<PasswordResetConfirm />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
