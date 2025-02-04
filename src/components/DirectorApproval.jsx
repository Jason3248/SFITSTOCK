import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockQuery from './StockQuery';
import '../styles/directorapproval.css';
import ViewStocks from './ViewStocks';
import Profile from './Profile';
import { AppBar, Toolbar, Typography, Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Box, Avatar } from "@mui/material";

import SPITLogoGif from "../components/assets/sfit_logo.gif";

function DirectorApproval() {
  const [pendingStocks, setPendingStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page');
  const [loading, setLoading] = useState(false);

  // Fetch the pending stocks for director approval
  const fetchPendingStocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/items/director-pending');
      setPendingStocks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending stocks', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
  }, []);

  // Handle approval or rejection of stock items
  const handleApproval = async (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Please enter the reason for rejection:');
      setRejectionReason(reason);
    }
    try {
      const encodedId = encodeURIComponent(id);
      await axios.put(`http://localhost:5000/api/items/director/${encodedId}`, {
        directorApprovalStatus: status,
        rejectionReason: reason,
      });
      fetchPendingStocks(); // Refresh the list after updating approval status
    } catch (err) {
      console.error('Error updating stock status', err);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  return (
    <>
       <div className="App">
      {/* AppBar with Logo and Navigation */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <Avatar 
            alt="SPIT Logo" 
            src={SPITLogoGif} 
            sx={{ width: 40, height: 40, marginRight: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Director Dashboard
          </Typography>
          <Button color="inherit" onClick={() => logout()}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">   
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => setSelectedOption('View Stocks')}>View Stocks</Button>
          <Button variant="contained" color="primary" onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</Button>
          <Button variant="contained" color="primary" onClick={() => setSelectedOption('Update Profile')}>Update Profile</Button>
          </Box>

          {selectedOption === 'Fetch Stocks' && <StockQuery />}
          {selectedOption === 'View Stocks' &&  <ViewStocks />}
          {selectedOption === 'Update Profile' && <Profile />}
        </Container>
      </Box>
      

    </div>
    </>
  );
}

export default DirectorApproval;
