import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Box, Avatar } from "@mui/material";
import StockQuery from "./StockQuery";
import SPITLogoGif from "../components/assets/sfit_logo.gif";  // Assuming the logo is stored as 'sfit_logo.gif' in the 'assets' folder
import '../styles/principalapproval.css';
import ViewStocks from "./ViewStocks";
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
            Principal Approval Dashboard
          </Typography>
          <Button color="inherit" onClick={() => setSelectedOption('View Stocks')}>View Stocks</Button>
          <Button color="inherit" onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</Button>
          <Button color="inherit" onClick={() => logout()}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        {/* Conditionally render the StockQuery component when "Fetch Stocks" is selected */}
        {selectedOption === 'Fetch Stocks' && <StockQuery />}

        {/* Display stock approval list when "Main Page" is selected */}
        {selectedOption === 'View Stocks' && (
          <ViewStocks />
        )}
      </Container>

      {/* Rejection Reason Dialog */}
      {/* <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Rejection Reason</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Please provide a reason for rejecting this stock.
          </Typography>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRejectWithReason} color="error">
            Submit
          </Button>
        </DialogActions>
      </Dialog> */}
    </div>
  );
}

export default PrincipalApproval;
