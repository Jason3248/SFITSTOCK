import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton, // Import IconButton for the sandwich bar
  Collapse,   // Import Collapse to manage filter visibility
  Typography, // Import Typography for text styling
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Import the MenuIcon
import "../styles/hodcmpn.css";

function HodCMPN() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filters, setFilters] = useState({
    assetHeads: "",
    specification: "",
    vendorName: "",
    batchNo: "",
    roomNo: "",
    dateOfPurchase: "",
    allocatedDept: "",
    hodApprovalStatus: "", // Changed default to empty string for all
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [filterOpen, setFilterOpen] = useState(false); // State to manage filter visibility

  // Fetch stocks from API
  const fetchStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/approve/cmpn");
      setStocks(res.data);
      setFilteredStocks(res.data);
    } catch (err) {
      console.error("Error fetching items", err);
      setSnackMessage("Error fetching items.");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Handle approval/rejection of stocks
  const handleApproval = async (id, status) => {
    let reason = "";
    if (status === "rejected") {
      reason = prompt("Please enter the reason for rejection:");
    }
    try {
      await axios.put(`http://localhost:5000/api/items/approve/cmpn/${encodeURIComponent(id)}`, {
        hodApprovalStatus: status,
        rejectionReason: reason,
      });
      fetchStocks();
      setSnackMessage(`Stock ${status === "approved" ? "approved" : "rejected"} successfully.`);
      setSnackSeverity("success");
    } catch (err) {
      console.error("Error updating approval status", err);
      setSnackMessage("Error updating approval status.");
      setSnackSeverity("error");
    }
    setSnackOpen(true);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Apply filters on stocks based on user input
  useEffect(() => {
    const filtered = stocks.filter((stock) => {
      return (
        (filters.assetHeads === "" || stock.assetHeads.includes(filters.assetHeads)) &&
        (filters.specification === "" || stock.specification.includes(filters.specification)) &&
        (filters.vendorName === "" || stock.vendorName.includes(filters.vendorName)) &&
        (filters.batchNo === "" || stock.batchNo.includes(filters.batchNo)) &&
        (filters.roomNo === "" || stock.roomNo.includes(filters.roomNo)) &&
        (filters.dateOfPurchase === "" || stock.dateOfPurchase.includes(filters.dateOfPurchase)) &&
        (filters.allocatedDept === "" || stock.allocatedDept.includes(filters.allocatedDept)) &&
        (filters.hodApprovalStatus === "" || stock.hodApprovalStatus === filters.hodApprovalStatus)
      );
    });
    setFilteredStocks(filtered);
  }, [filters, stocks]);

  // Close the Snackbar
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  // Toggle filters visibility
  const handleToggleFilters = () => {
    setFilterOpen((prev) => !prev); // Toggle filter visibility
  };

  return (
    <div className="hod-cmpn">
      <h1>Stock Approval</h1>
      <IconButton onClick={handleToggleFilters}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6">{filterOpen ? "Hide Filters" : "Show Filters"}</Typography>

      <Collapse in={filterOpen}>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="hod-approval-status-label">Approval Status</InputLabel>
          <Select
            labelId="hod-approval-status-label"
            name="hodApprovalStatus"
            value={filters.hodApprovalStatus}
            onChange={handleFilterChange}
            label="Approval Status"
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="assetHeads"
              label="Equipment Type"
              value={filters.assetHeads}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="specification"
              label="Stock Type"
              value={filters.specification}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="vendorName"
              label="Vendor Name"
              value={filters.vendorName}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="batchNo"
              label="Batch No"
              value={filters.batchNo}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="roomNo"
              label="Room No"
              value={filters.roomNo}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              type="date"
              name="dateOfPurchase"
              value={filters.dateOfPurchase}
              onChange={handleFilterChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              variant="outlined"
              name="allocatedDept"
              label="Allocated Dept"
              value={filters.allocatedDept}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={() => fetchStocks()}>
          Apply Filters
        </Button>
      </Collapse>

      <TableContainer sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Head</TableCell>
              <TableCell>Specification</TableCell>
              <TableCell>Vendor Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Batch No</TableCell>
              <TableCell>Date of Purchase</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Room No</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Departments</TableCell>
              <TableCell>Approval By HOD</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStocks.map((stock) => (
              <TableRow key={stock._id}>
                <TableCell>{stock.assetHeads}</TableCell>
                <TableCell>{stock.specification}</TableCell>
                <TableCell>{stock.vendorName}</TableCell>
                <TableCell>{stock.quantity}</TableCell>
                <TableCell>{stock.batchNo}</TableCell>
                <TableCell>{stock.dateOfPurchase}</TableCell>
                <TableCell>{stock.totalAmount}</TableCell>
                <TableCell>{stock.roomNo}</TableCell>
                <TableCell>
                  {stock.bills ? (
                    <a href={stock.bills} target="_blank" rel="noopener noreferrer">
                      View Invoice
                    </a>
                  ) : (
                    "No Invoice"
                  )}
                </TableCell>
                <TableCell>{stock.allocatedDept}</TableCell>
                <TableCell>{stock.hodApprovalStatus}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className="success"
                    onClick={() => handleApproval(stock._id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    className="error"
                    onClick={() => handleApproval(stock._id, "rejected")}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    

      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default HodCMPN;
