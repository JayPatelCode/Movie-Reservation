import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar, Menu, MenuItem, Tooltip, Badge, Chip } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, AccountCircle, ExitToApp, LockOpen, PersonAdd, BookOnline, AdminPanelSettings, Home, Search, Notifications, DarkMode, LightMode } from '@mui/icons-material';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  const token = localStorage.getItem('token');
  const currentUser = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/is_admin/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          setIsAdmin(response.data.is_admin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAnchorEl(null);
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const isActive = (path) => location.pathname === path;

  const MotionButton = motion(Button);

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton 
              component={Link} 
              to="/" 
              color="inherit" 
              edge="start"
              sx={{ mr: 2, p: 1.5 }}
            >
              <Movie sx={{ fontSize: 32, color: 'white' }} />
            </IconButton>
          </motion.div>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component={Link}
              to="/"
              sx={{ 
                fontWeight: 'bold',
                color: 'white',
                textDecoration: 'none',
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mr: 4,
                display: { xs: 'none', md: 'block' }
              }}
            >
              🎬 CinemaVault
            </Typography>
            
            {/* Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <MotionButton 
                component={Link} 
                to="/" 
                startIcon={<Home />}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  background: isActive('/') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Home
              </MotionButton>
            </Box>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton onClick={toggleDarkMode} sx={{ color: 'white' }}>
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </motion.div>
            </Tooltip>

            {token ? (
              <>
                {/* Notifications */}
                <Tooltip title="Notifications">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton sx={{ color: 'white' }}>
                      <Badge badgeContent={notificationCount} color="error">
                        <Notifications />
                      </Badge>
                    </IconButton>
                  </motion.div>
                </Tooltip>

                {/* My Reservations */}
                <MotionButton 
                  component={Link} 
                  to="/my-reservations" 
                  startIcon={<BookOnline />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    background: isActive('/my-reservations') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    },
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  My Bookings
                </MotionButton>

                {/* Admin Panel */}
                {isAdmin && (
                  <MotionButton 
                    component={Link} 
                    to="/admin" 
                    startIcon={<AdminPanelSettings />}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      background: isActive('/admin') ? 'rgba(255,255,255,0.2)' : 'rgba(255,215,0,0.2)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      '&:hover': {
                        background: 'rgba(255,215,0,0.3)',
                      },
                      display: { xs: 'none', md: 'flex' }
                    }}
                  >
                    Admin
                  </MotionButton>
                )}

                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {/* Username Display */}
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        opacity: 0.9
                      }}
                    >
                      Hello, {currentUser?.username || 'User'}!
                    </Typography>
                  </Box>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Tooltip title={`Logged in as ${currentUser?.username || 'User'}`}>
                      <IconButton
                        onClick={handleMenuClick}
                        sx={{ 
                          border: '2px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            border: '2px solid rgba(255,255,255,0.5)',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {currentUser?.first_name?.[0] || currentUser?.username?.[0] || 'U'}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                  </motion.div>
                </Box>

                {/* User Menu Dropdown */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleMenuClose} sx={{ py: 2 }}>
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {currentUser?.first_name?.[0] || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {currentUser?.first_name} {currentUser?.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {currentUser?.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  
                  <MenuItem 
                    component={Link} 
                    to="/profile" 
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <AccountCircle sx={{ mr: 2 }} />
                    My Profile
                  </MenuItem>
                  
                  <MenuItem 
                    component={Link} 
                    to="/my-reservations" 
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                  >
                    <BookOnline sx={{ mr: 2 }} />
                    My Reservations
                  </MenuItem>
                  
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                    <ExitToApp sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <MotionButton 
                  component={Link} 
                  to="/login" 
                  startIcon={<LockOpen />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  Login
                </MotionButton>
                
                <MotionButton 
                  component={Link} 
                  to="/register" 
                  startIcon={<PersonAdd />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    ml: 1,
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(254, 107, 139, 0.4)'
                    }
                  }}
                >
                  Sign Up
                </MotionButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
