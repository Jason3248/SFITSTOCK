import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Box, Avatar } from "@mui/material";
import StockQuery from "./StockQuery";
import SPITLogoGif from "../components/assets/sfit_logo.gif";  // Assuming the logo is stored as 'sfit_logo.gif' in the 'assets' folder
import '../styles/principalapproval.css';
import ViewStocks from "./ViewStocks";
import Profile from "./Profile";
function PrincipalApproval() {
  const [stocks, setStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);

  // Fetch pending stocks for approval
  const fetchPendingStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/principal-pending");
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks for Principal approval", err);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
  }, []);

  // const handleApproval = async (id, status) => {
  //   let reason = rejectionReason;
  //   if (status === 'rejected') {
  //     setSelectedStockId(id);
  //     setOpenDialog(true);  // Open dialog to enter rejection reason
  //   } else {
  //     try {
  //       await axios.put(`http://localhost:5000/api/items/principal/${encodeURIComponent(id)}`, {
  //         principalApprovalStatus: status,
  //         rejectionReason: reason
  //       });
  //       fetchPendingStocks();
  //     } catch (err) {
  //       console.error("Error updating Principal approval status", err);
  //     }
  //   }
  // };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStockId(null);
  };

  // const handleRejectWithReason = async () => {
  //   try {
  //     await axios.put(`http://localhost:5000/api/items/principal/${encodeURIComponent(selectedStockId)}`, {
  //       principalApprovalStatus: "rejected",
  //       rejectionReason: rejectionReason
  //     });
  //     setRejectionReason('');
  //     fetchPendingStocks();
  //     handleDialogClose();
  //   } catch (err) {
  //     console.error("Error rejecting with reason", err);
  //   }
  // };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  return (
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
            Principal Dashboard
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
  );
}

export default PrincipalApproval;
