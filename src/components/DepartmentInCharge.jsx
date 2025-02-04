import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Box,
  AppBar,
  Toolbar
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import StockQuery from "./StockQuery";
import DeptViewStocks from "./DeptViewStocks";
import Profile from "./Profile";

function DepartmentInCharge() {

  const location = useLocation();

  const department = location.state || {};
  const [groupedStocks, setGroupedStocks] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  // Fetch grouped stocks
  const fetchGroupedStocks = async () => {
    if (!department) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/items/departmentGrouped/${department}`);
      setGroupedStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks", err);
    }
  };

  useEffect(() => {
    fetchGroupedStocks();
  }, [department]);

  // Open room assignment dialog
  const openRoomAssignment = (batch) => {
    setSelectedBatch(batch);
    setRoomAssignments([{ roomNo: "", quantity: "" }]);
    setOpenDialog(true);
  };

  // Handle input changes in room assignments
  const handleRoomChange = (index, field, value) => {
    const updatedAssignments = [...roomAssignments];
    updatedAssignments[index][field] = value;
    setRoomAssignments(updatedAssignments);
  };

  // Add new room assignment input
  const addRoomAssignment = () => {
    setRoomAssignments([...roomAssignments, { roomNo: "", quantity: "" }]);
  };

  
 
  const assignRooms = async () => {
    console.log("Selected batch before sending:", selectedBatch); 

    if (!selectedBatch || roomAssignments.length === 0) {
      alert("Please select a batch and enter at least one room assignment.");
      return;
    }
  
    const payload = {
      batchDetails: {
        specification: selectedBatch._id.specification,
        vendorName: selectedBatch._id.vendorName,
        batchNo: selectedBatch._id.batchNo,
        dateOfPurchase: selectedBatch._id.dateOfPurchase,
        department 
      },
      roomAssignments: roomAssignments.map((r) => ({
        roomNo: r.roomNo.trim(),
        quantity: parseInt(r.quantity, 10),
      })),
    };
  
    console.log("Sending payload:", payload); // Debug log
  
    try {
      const res = await axios.put("http://localhost:5000/api/items/assignRooms", payload);
      alert(res.data.message);
      fetchGroupedStocks();
      setOpenDialog(false);
      setSelectedBatch(null);
    } catch (err) {
      console.error("Backend error:", err.response?.data);
      alert(err.response?.data?.error || "Failed to assign rooms.");
    }
  };
  
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  

  return (
    <>
    <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Department-In-Charge Dashboard - {department} Department
          </Typography>
          <Button color="inherit" onClick={() => logout()}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
      <Box sx={{ marginBottom: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#0D47A1" }}>
          {department} Department In-Charge
        </Typography>
      </Box>

      
      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Allocate Stocks')} sx={{ mr: 2 }}>
              Allocate Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Fetch Stocks')} sx={{ mr: 2 }}>
              Fetch Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('View Stocks')} sx={{ mr: 2 }}>
              View Stocks
            </Button>
            <Button variant="contained" color="primary" onClick={() => setSelectedOption('Update Profile')}>
              Update Profile
            </Button>
          </Box>

          {selectedOption === 'Fetch Stocks' && <StockQuery />}
          {selectedOption === 'View Stocks' &&  <DeptViewStocks department={department}/>}
          {selectedOption === 'Update Profile' && <Profile />}
          {selectedOption === 'Allocate Stocks' && (
            <>
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#0D47A1" }}>Specification</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#0D47A1" }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#0D47A1" }}>Batch No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#0D47A1" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#0D47A1" }}>Assign Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedStocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No stocks available
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedStocks.map((batch, index) => (
                    <TableRow key={index}>
                      <TableCell>{batch._id.specification}</TableCell>
                      <TableCell>{batch._id.vendorName}</TableCell>
                      <TableCell>{batch._id.batchNo}</TableCell>
                      <TableCell>{batch.totalQuantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => openRoomAssignment(batch)}
                          startIcon={<AddIcon />}
                          sx={{
                            borderRadius: 1,
                            padding: "6px 16px",
                            fontWeight: "bold",
                            textTransform: "none",
                            backgroundColor: "#1976D2", // Primary Blue
                            "&:hover": {
                              backgroundColor: "#1565C0", // Hover Darker Blue
                            },
                          }}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </TableContainer>
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: "#1976D2", color: "#fff" }}>
              Assign Rooms for {selectedBatch?._id.specification}
            </DialogTitle>
            <DialogContent>
              {roomAssignments.map((room, index) => (
                <Grid container spacing={2} key={index} sx={{ marginBottom: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Room No"
                      variant="outlined"
                      fullWidth
                      value={room.roomNo}
                      onChange={(e) => handleRoomChange(index, "roomNo", e.target.value)}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Quantity"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={room.quantity}
                      onChange={(e) => handleRoomChange(index, "quantity", e.target.value)}
                      min="1"
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={addRoomAssignment}
                sx={{
                  marginBottom: 2,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: "bold",
                  borderColor: "#1976D2", // Primary Blue Border
                  color: "#1976D2", // Primary Blue Text
                  "&:hover": {
                    backgroundColor: "#1976D2",
                    color: "#fff",
                  },
                }}
              >
                Add Room
              </Button>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={assignRooms}
                startIcon={<CheckIcon />}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#1976D2", // Primary Blue
                  "&:hover": {
                    backgroundColor: "#1565C0", // Hover Darker Blue
                  },
                }}
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpenDialog(false)}
                startIcon={<CancelIcon />}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: "bold",
                  borderColor: "#0D47A1", // Secondary Blue Border
                  color: "#0D47A1", // Secondary Blue Text
                  "&:hover": {
                    backgroundColor: "#0D47A1",
                    color: "#fff",
                  },
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
            </>
            
          )}
        </Container>
      </Box>
      

      
      
    </Container>
    </>
    
  );
}

export default DepartmentInCharge;

// Assign rooms to batch
  // const assignRooms = async () => {
  //   if (!selectedBatch || roomAssignments.length === 0) {
  //     alert("Please select a batch and enter at least one room assignment.");
  //     return;
  //   }

  //   try {
  //     const res = await axios.put("http://localhost:5000/api/items/assignRooms", {
  //       batchDetails: selectedBatch._id,
  //       roomAssignments: roomAssignments.map((r) => ({
  //         roomNo: r.roomNo,
  //         quantity: parseInt(r.quantity, 10),
  //       })),
  //     });

  //     alert(res.data.message);
  //     fetchGroupedStocks();
  //     setOpenDialog(false);
  //     setSelectedBatch(null);
  //   } catch (err) {
  //     console.error("Error updating room", err);
  //     alert("Failed to assign rooms.");
  //   }
  // };