import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, Box, Avatar } from "@mui/material";
import StockQuery from "./StockQuery";
import SPITLogoGif from "../components/assets/sfit_logo.gif";  // Assuming the logo is stored as 'sfit_logo.gif' in the 'assets' folder
import '../styles/principalapproval.css';

function PrincipalApproval() {
  const [stocks, setStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);

  // Fetch pending stocks for approval
  const fetchPendingStocks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/items/principal-pending");
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks for Principal approval", err);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
  }, []);

  const handleApproval = async (id, status) => {
    let reason = rejectionReason;
    if (status === 'rejected') {
      setSelectedStockId(id);
      setOpenDialog(true);  // Open dialog to enter rejection reason
    } else {
      try {
        await axios.put(`http://localhost:3000/api/items/principal/${encodeURIComponent(id)}`, {
          principalApprovalStatus: status,
          rejectionReason: reason
        });
        fetchPendingStocks();
      } catch (err) {
        console.error("Error updating Principal approval status", err);
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStockId(null);
  };

  const handleRejectWithReason = async () => {
    try {
      await axios.put(`http://localhost:3000/api/items/principal/${encodeURIComponent(selectedStockId)}`, {
        principalApprovalStatus: "rejected",
        rejectionReason: rejectionReason
      });
      setRejectionReason('');
      fetchPendingStocks();
      handleDialogClose();
    } catch (err) {
      console.error("Error rejecting with reason", err);
    }
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
          <Button color="inherit" onClick={() => setSelectedOption('Main Page')}>View Stocks</Button>
          <Button color="inherit" onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ marginTop: 4 }}>
        {/* Conditionally render the StockQuery component when "Fetch Stocks" is selected */}
        {selectedOption === 'Fetch Stocks' && <StockQuery />}

        {/* Display stock approval list when "Main Page" is selected */}
        {selectedOption === 'Main Page' && (
          <>
            <Typography variant="h4" gutterBottom>Principal Stock Approvals</Typography>
            <Typography variant="h6" color="textSecondary">Pending Approvals</Typography>

            {stocks.length === 0 ? (
              <Typography variant="body1" color="textSecondary">No stocks pending approval.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ marginTop: 3, borderRadius: 2 }}>
                <Table aria-label="stock approval table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Head</TableCell>
                      <TableCell>Specifications</TableCell>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Batch No</TableCell>
                      <TableCell>Date of Purchase</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Room No</TableCell>
                      <TableCell>Departments</TableCell>
                      <TableCell>HOD Approval Status</TableCell>
                      <TableCell>Principal Approval Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks.map((stock) => (
                      <TableRow key={stock._id}>
                        <TableCell>{stock.assetHeads}</TableCell>
                        <TableCell>{stock.specification}</TableCell>
                        <TableCell>{stock.vendorName}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>{stock.batchNo}</TableCell>
                        <TableCell>{new Date(stock.dateOfPurchase).toLocaleDateString()}</TableCell>
                        <TableCell>{stock.totalAmount}</TableCell>
                        <TableCell>{stock.roomNo}</TableCell>
                        <TableCell>{stock.allocatedDept}</TableCell>
                        <TableCell>{stock.hodApprovalStatus}</TableCell>
                        <TableCell>{stock.principalApprovalStatus}</TableCell>
                        <TableCell>
                          {stock.principalApprovalStatus === "pending" ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApproval(stock._id, "approved")}
                                sx={{ marginRight: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleApproval(stock._id, "rejected")}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Typography variant="body2">{stock.principalApprovalStatus.toUpperCase()}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>

      {/* Rejection Reason Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
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
      </Dialog>
    </div>
  );
}

export default PrincipalApproval;
