import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper, Avatar, CssBaseline, Grid, Link, Snackbar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PasswordResetConfirm = () => {
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password !== rePassword) {
      setError('Passwords do not match.');
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.post('http://localhost:8000/auth/users/reset_password_confirm/', {
        uid,
        token,
        new_password: password,
      });
      setMessage('Your password has been reset successfully. You can now log in.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      console.error('Password reset confirmation failed!', err);
      setError('Failed to reset password. The link might be invalid or expired.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://source.unsplash.com/random?lock)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="re_password"
              label="Confirm New Password"
              type="password"
              id="re_password"
              autoComplete="new-password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
            {message && <Typography color="primary">{message}</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Reset Password
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Back to Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {error || message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default PasswordResetConfirm;
