import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Container, Card, CardContent, CardActions, Divider } from '@mui/material';
import StockQuery from './StockQuery';
import Profile from './Profile';
import '../styles/hodPage.css';
import DeptViewStocks from './DeptViewStocks';

function HODPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { department } = location.state || {}; // Retrieve department from route state

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  // Redirect to login if no department is passed
  useEffect(() => {
    if (!department) {
      alert('No department found! Redirecting to login page.');
      navigate('/login');
    } else {
      fetchStocks();
    }
  }, [department, navigate]);

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items/getstocks/${department}`);
      setStocks(res.data);
      setFilteredStocks(res.data); // Initialize filteredStocks with all data
    } catch (err) {
      console.error('Error fetching items', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  return (
    <div className="App">
      {/* AppBar for Navbar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HOD Dashboard - {department} Department
          </Typography>
          <Button color="inherit" onClick={() => logout()}>Logout</Button>
        </Toolbar>
      </AppBar>

  
      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('View Stocks')} sx={{ mr: 2 }}>
              View Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Fetch Stocks')} sx={{ mr: 2 }}>
              Fetch Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Update Profile')}>
              Update Profile
            </Button>
          </Box>

          
          {selectedOption === 'Fetch Stocks' && <StockQuery />}
          {selectedOption === 'View Stocks' && <DeptViewStocks department={department}/> }
          {selectedOption === 'Update Profile' && <Profile />}
        </Container>
      </Box>
    </div>
  );
}

export default HODPage;
