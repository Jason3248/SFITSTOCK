import React, { useState } from 'react';
import { Avatar, Button, TextField, Paper, Typography, Container, Box } from '@mui/material';
import SfitLogo from './assets/sfit_logo.gif'; // Make sure to import your logo.

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false); // New state for registration toggle

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(credentials);
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed!');
      }

      const data = await response.json();
      if (data.token && data.userLevel !== undefined) {
        localStorage.setItem('userLevel', data.userLevel);
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        throw new Error('Login failed! No token received.');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }} elevation={6}>
        <Avatar sx={{ m: 1, bgcolor: 'white', width: 60, height: 60 }} src={SfitLogo} />
        <Typography component="h1" variant="h5">{isRegistering ? 'Create a new admin' : 'Log in'}</Typography>
        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email/PID"
            name="email"
            value={credentials.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={credentials.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, p: 1.5 }}
          >
            {isRegistering ? 'Register' : 'Login'} {/* Change button text based on registration state */}
          </Button>
        </Box>
        <Button onClick={() => setIsRegistering(!isRegistering)} sx={{ mt: 2 }}>
          {isRegistering ? 'Already have an account? Login' : 'Create a new admin'}
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
