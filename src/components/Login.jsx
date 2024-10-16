import React, { useState } from 'react';
import { Avatar, Button, TextField, Paper, Typography, Container, Box } from '@mui/material';
import SfitLogo from './assets/sfit_logo.gif'; // Make sure to import your logo.
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isAdminLogin, setIsAdminLogin] = useState(false); // Toggle between admin and user login
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdminLogin) {
      await adminLogin(credentials);
    } else {
      await userLogin(credentials);
    }
  };

  const userLogin = async (credentials) => {
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
        throw new Error(errorText || 'User login failed!');
      }
  
      const data = await response.json();
      if (data.token && data.userLevel !== undefined) {
        localStorage.setItem('userLevel', data.userLevel);
        localStorage.setItem('token', data.token);
        alert('User login successful!');
  
        // Navigate based on userLevel
        switch (data.userLevel) {
          case 1:
            navigate('/');
            break;
          case 2:
            navigate('/hodcmpn');
            break;
          case 3:
            navigate('/hodinft');
            break;
          case 4:
            navigate('/hodextc');
            break;
          case 5:
            navigate('/hodmech');
            break;
          case 6:
            navigate('/hodelec');
            break;
          case 7:
            navigate('/hodaiml');
            break;
          case 8:
            navigate('/hodecs');
            break;
          case 9:
            navigate('/principal');
            break;
          case 10:
            navigate('/director');
            break;
          default:
            throw new Error('Unknown user level');
        }
      } else {
        throw new Error('Login failed! No token or user level received.');
      }
    } catch (error) {
      console.error('Error during user login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };
  

  const adminLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Admin login failed!');
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        alert('Admin login successful!');
        navigate('/admindashboard')// Navigate to admin dashboard (if routing is set up)
      } else {
        throw new Error('Admin login failed! No token received.');
      }
    } catch (error) {
      console.error('Error during admin login:', error.message);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
        elevation={6}
      >
        <Avatar sx={{ m: 1, bgcolor: 'white', width: 60, height: 60 }} src={SfitLogo} />
        <Typography component="h1" variant="h5">
          {isAdminLogin ? 'Admin Login' : 'User Login'}
        </Typography>
        <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email ID"
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
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, p: 1.5 }}
          >
            {isAdminLogin ? 'Login as Admin' : 'Login as User'}
          </Button>
        </Box>
        <Button onClick={() => setIsAdminLogin(!isAdminLogin)} sx={{ mt: 2 }}>
          {isAdminLogin ? 'Login as User' : 'Login as Admin'}
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
