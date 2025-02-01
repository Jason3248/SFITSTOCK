import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Container, Card, CardContent, CardActions, Divider } from '@mui/material';
import StockQuery from './StockQuery';
import Profile from './Profile';
import '../styles/hodPage.css';

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
      const res = await axios.get(`http://localhost:3000/api/items/getstocks/${department}`);
      setStocks(res.data);
      setFilteredStocks(res.data); // Initialize filteredStocks with all data
    } catch (err) {
      console.error('Error fetching items', err);
    }
  };

  return (
    <div className="App">
      {/* AppBar for Navbar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HOD Dashboard - {department} Department
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Main Page')} sx={{ mr: 2 }}>
              View Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Fetch Stocks')} sx={{ mr: 2 }}>
              Fetch Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Update Profile')}>
              Update Profile
            </Button>
          </Box>

          {/* Conditional Render based on selected option */}
          {selectedOption === 'Fetch Stocks' && <StockQuery />}

          {selectedOption === 'Main Page' && (
            <>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Stocks for {department} Department
              </Typography>
              {filteredStocks.length === 0 ? (
                <Typography>No stocks available at the moment.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredStocks.map((stock) => (
                    <Grid item xs={12} sm={6} md={4} key={stock._id}>
                      <Card sx={{ minWidth: 275 }}>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            {stock.assetHeads}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Specification: {stock.specification}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vendor: {stock.vendorName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {stock.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Batch No: {stock.batchNo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date of Purchase: {stock.dateOfPurchase}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ₹{stock.totalAmount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Room No: {stock.roomNo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Dept: {stock.allocatedDept}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" href={stock.bills} target="_blank" variant="outlined">
                            View Invoice
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {selectedOption === 'Update Profile' && <Profile />}
        </Container>
      </Box>
    </div>
  );
}

export default HODPage;
