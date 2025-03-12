
// const ModifyStock = () => {
//   const [stocks, setStocks] = useState([]);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [selectedBatch, setSelectedBatch] = useState(null);
//   const [updatedFields, setUpdatedFields] = useState({});
//   const [assetHeads, setAssetHeads] = useState([]);
//   const [allocatedDepartments, setAllocatedDepartments] = useState([]);

//   useEffect(() => {
//     fetchStocks();
//     fetchConfig();
//   }, []);

//   const fetchStocks = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/items/searchStocks", {
//         stockType: ["Departmental Stock", "Institutional Stock"],
//       });
//       setStocks(res.data);
//     } catch (err) {
//       console.error("Error fetching stocks:", err);
//     }
//   };

//   const fetchConfig = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/admin/config", {
//         headers: { "Accept": "application/json" },
//         responseType: "json",
//       });
//       setAssetHeads(res.data.assetHeads || []);
//       setAllocatedDepartments(res.data.allocatedDept || []);
//     } catch (err) {
//       console.error("Error fetching config", err);
//     }
//   };

//   const handleUpdateClick = (batch) => {
//     setSelectedBatch(batch);
//     setUpdatedFields({});
//     setEditDialogOpen(true);
//   };

//   const handleDeleteClick = async (batch) => {
//     if (window.confirm("Are you sure you want to delete this stock batch?")) {
//       try {
//         await axios.delete("http://localhost:5000/api/items/deleteStock", {
//           data: { stockType: batch.stockType, batchCriteria: batch._id },
//         });
//         fetchStocks();
//       } catch (err) {
//         console.error("Error deleting batch:", err);
//       }
//     }
//   };

//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     setUpdatedFields((prev) => ({
//       ...prev,
//       [name]: value === "" ? "" : value, // Explicitly store empty string when field is cleared
//     }));
//   };

//   const generateNewId = (batch, updatedFields) => {
//     return `${updatedFields.allocatedDept || batch._id.allocatedDept}/${updatedFields.specification || batch._id.specification}/${updatedFields.dateOfPurchase || batch._id.dateOfPurchase}/${updatedFields.vendorName || batch._id.vendorName}/${updatedFields.batchNo || batch._id.batchNo}/${batch.index}`;
//   };

//   const handleUpdateSubmit = async () => {
//     try {
//       let updatedId = selectedBatch._id;
//       if (updatedFields.allocatedDept || updatedFields.specification || updatedFields.dateOfPurchase || updatedFields.vendorName || updatedFields.batchNo) {
//         updatedId = generateNewId(selectedBatch, updatedFields);
//       }

//       await axios.put("http://localhost:5000/api/items/updateStock", {
//         stockType: selectedBatch.stockType,
//         batchCriteria: selectedBatch._id,
//         updatedFields,
//         newId: updatedId !== selectedBatch._id ? updatedId : undefined,
//       });

//       setEditDialogOpen(false);
//       fetchStocks();
//     } catch (err) {
//       console.error("Error updating batch:", err);
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
//         Modify Stock Batches
//       </Typography>
//       <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Asset Head</TableCell>
//               <TableCell>Specification</TableCell>
//               <TableCell>Batch No</TableCell>
//               <TableCell>Department</TableCell>
//               <TableCell>Date of Purchase</TableCell>
//               <TableCell>Vendor</TableCell>
//               <TableCell>Quantity</TableCell>
//               <TableCell>Room No</TableCell>
//               <TableCell>Financial Year</TableCell>
//               <TableCell>Batch Amount</TableCell>
//               <TableCell>Stock Type</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {stocks.map((batch, index) => (
//               <TableRow key={index} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f3f3f3" } }}>
//                 <TableCell>{batch._id.assetHeads}</TableCell>
//                 <TableCell>{batch._id.specification}</TableCell>
//                 <TableCell>{batch._id.batchNo}</TableCell>
//                 <TableCell>{batch._id.allocatedDept}</TableCell>
//                 <TableCell>{batch._id.dateOfPurchase}</TableCell>
//                 <TableCell>{batch._id.vendorName}</TableCell>
//                 <TableCell>{batch.totalQuantity}</TableCell>
//                 <TableCell>{batch._id.roomNo}</TableCell>
//                 <TableCell>{batch._id.financialYear}</TableCell>
//                 <TableCell>₹{Math.round(batch.totalAmount)}</TableCell>
//                 <TableCell>{batch.stockType}</TableCell>
//                 <TableCell>
//                   <Tooltip title="Modify">
//                     <IconButton color="primary" onClick={() => handleUpdateClick(batch)}>
//                       <EditIcon />
//                     </IconButton>
//                   </Tooltip>
//                   <Tooltip title="Delete">
//                     <IconButton color="error" onClick={() => handleDeleteClick(batch)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Edit Dialog */}
//       <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>Update Stock Batch</DialogTitle>
//         <DialogContent>
//           {/* Editable Fields */}
//           <TextField select label="Asset Head" name="assetHeads" value={updatedFields.assetHeads || selectedBatch?._id?.assetHeads || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}>
//             {assetHeads.map((head) => <MenuItem key={head} value={head}>{head}</MenuItem>)}
//           </TextField>

//           <TextField select label="Department" name="allocatedDept" value={updatedFields.allocatedDept || selectedBatch?._id?.allocatedDept || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}>
//             {allocatedDepartments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
//           </TextField>

//           <TextField 
//             label="Specification" 
//             name="specification" 
//             value={updatedFields.specification !== undefined ? updatedFields.specification : selectedBatch?._id?.specification || ""} 
//             onChange={handleFieldChange} 
//             fullWidth sx={{ mb: 2 }} 
//           />
//           <TextField label="Batch No" name="batchNo"  value={updatedFields.batchNo !== undefined ? updatedFields.batchNo : selectedBatch?._id?.batchNo || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }} />
//           <TextField label="Vendor Name" name="vendorName"  value={updatedFields.vendorName !== undefined ? updatedFields.vendorName : selectedBatch?._id?.vendorName || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
//           <TextField label="Room No" name="roomNo"  value={updatedFields.roomNo !== undefined ? updatedFields.roomNo : selectedBatch?._id?.roomNo || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
//           <TextField label="Financial Year" name="financialYear" value={updatedFields.financialYear !== undefined ? updatedFields.financialYear : selectedBatch?._id?.financialYear || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button onClick={handleUpdateSubmit} color="primary" variant="contained">Save Changes</Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };



import { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, FormControl, InputLabel, Select
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ModifyStock = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const [assetHeads, setAssetHeads] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);

  // Filters
  const [stockType, setStockType] = useState("");
  const [allocatedDept, setAllocatedDept] = useState("");
  const [specification, setSpecification] = useState("");
  const [assetHead, setAssetHead] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [roomNo, setRoomNo] = useState("");

  useEffect(() => {
    fetchStocks();
    fetchConfig();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/items/searchStocks", {
        stockType: ["Departmental Stock", "Institutional Stock"],
      });
      setStocks(res.data);
      setFilteredStocks(res.data); // Default display
    } catch (err) {
      console.error("Error fetching stocks:", err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/config", {
        headers: { "Accept": "application/json" },
        responseType: "json",
      });
      setAssetHeads(res.data.assetHeads || []);
      setAllocatedDepartments(res.data.allocatedDept || []);
    } catch (err) {
      console.error("Error fetching config", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!stockType) {
      alert("Please select stock type");
      return;
    }

    const query = {
      stockType,
      allocatedDept,
      assetHead,
      specification,
      roomNo,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/items/search", query);
      setFilteredStocks(res.data);
    } catch (err) {
      console.error("Error fetching filtered stock:", err);
    }
  };

  const handleUpdateClick = (batch) => {
    setSelectedBatch(batch);
    setUpdatedFields({});
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (batch) => {
    if (window.confirm("Are you sure you want to delete this stock batch?")) {
      try {
        await axios.delete("http://localhost:5000/api/items/deleteStock", {
          data: { stockType: batch.stockType, batchCriteria: batch._id },
        });
        fetchStocks();
      } catch (err) {
        console.error("Error deleting batch:", err);
      }
    }
  };


  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUpdatedFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateNewId = (batch, updatedFields) => {
    return `${updatedFields.allocatedDept || batch._id.allocatedDept}/${updatedFields.specification || batch._id.specification}/${updatedFields.dateOfPurchase || batch._id.dateOfPurchase}/${updatedFields.vendorName || batch._id.vendorName}/${updatedFields.batchNo || batch._id.batchNo}/${batch.index}`;
  };

  const handleUpdateSubmit = async () => {
    try {
      let updatedId = selectedBatch._id;
      if (updatedFields.allocatedDept || updatedFields.specification || updatedFields.dateOfPurchase || updatedFields.vendorName || updatedFields.batchNo) {
        updatedId = generateNewId(selectedBatch, updatedFields);
      }

      await axios.put("http://localhost:5000/api/items/updateStock", {
        stockType: selectedBatch.stockType,
        batchCriteria: selectedBatch._id,
        updatedFields,
        newId: updatedId !== selectedBatch._id ? updatedId : undefined,
      });

      setEditDialogOpen(false);
      fetchStocks();
    } catch (err) {
      console.error("Error updating batch:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
        Modify Stock Batches
      </Typography>

      {/* Filtering Form */}
      <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <FormControl style={{ minWidth: "200px" }}>
          <InputLabel>Stock Type</InputLabel>
          <Select value={stockType} onChange={(e) => setStockType(e.target.value)} required>
            <MenuItem value="">Select Stock Type</MenuItem>
            <MenuItem value="institutional">Institutional Stock</MenuItem>
            <MenuItem value="departmental">Departmental Stock</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: "200px" }}>
          <InputLabel>Department</InputLabel>
          <Select value={allocatedDept} onChange={(e) => setAllocatedDept(e.target.value)}>
            <MenuItem value="">Select Department</MenuItem>
            {allocatedDepartments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Specification" onChange={(e) => setSpecification(e.target.value)} />
        <TextField label="Room No" onChange={(e) => setRoomNo(e.target.value)} />
        <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} onChange={(e) => setStartDate(e.target.value)} />
        <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} onChange={(e) => setEndDate(e.target.value)} />

        <Button type="submit" variant="contained" color="primary">Search</Button>
      </form>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset Head</TableCell>
              <TableCell>Specification</TableCell>
              <TableCell>Batch No</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Date of Purchase</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Room No</TableCell>
              <TableCell>Financial Year</TableCell>
              <TableCell>Batch Amount</TableCell>
              {/* <TableCell>Stock Type</TableCell> */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStocks.map((batch, index) => (
              <TableRow key={index} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f3f3f3" } }}>
              <TableCell>{batch._id.assetHeads}</TableCell>
              <TableCell>{batch._id.specification}</TableCell>
              <TableCell>{batch._id.batchNo}</TableCell>
              <TableCell>{batch._id.allocatedDept === "" ? ("Institutional") : batch._id.allocatedDept}</TableCell>
              <TableCell>{batch._id.dateOfPurchase}</TableCell>
              <TableCell>{batch._id.vendorName}</TableCell>
              <TableCell>{batch.totalQuantity}</TableCell>
              <TableCell>{batch._id.roomNo}</TableCell>
              <TableCell>{batch._id.financialYear}</TableCell>
              <TableCell>₹{batch.totalAmount.toFixed(2)}</TableCell>
              {/* <TableCell>{batch.stockType}</TableCell> */}
              <TableCell>
                <Tooltip title="Modify">
                  <IconButton color="primary" onClick={() => handleUpdateClick(batch)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={() => handleDeleteClick(batch)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>Update Stock Batch</DialogTitle>
        <DialogContent>
          {/* Editable Fields */}
          <TextField select label="Asset Head" name="assetHeads" value={updatedFields.assetHeads || selectedBatch?._id?.assetHeads || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}>
            {assetHeads.map((head) => <MenuItem key={head} value={head}>{head}</MenuItem>)}
          </TextField>

          <TextField select label="Department" name="allocatedDept" value={updatedFields.allocatedDept || selectedBatch?._id?.allocatedDept || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}>
            {allocatedDepartments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </TextField>

          <TextField 
            label="Specification" 
            name="specification" 
            value={updatedFields.specification !== undefined ? updatedFields.specification : selectedBatch?._id?.specification || ""} 
            onChange={handleFieldChange} 
            fullWidth sx={{ mb: 2 }} 
          />
          <TextField 
              label="Date of Purchase" 
              name="dateOfPurchase" 
              type="date"
              value={updatedFields.dateOfPurchase !== undefined ? updatedFields.dateOfPurchase : selectedBatch?._id?.dateOfPurchase || ""} 
              onChange={handleFieldChange} 
              fullWidth 
              sx={{ mb: 2 }} 
              InputLabelProps={{ shrink: true }} 
            />

          <TextField label="Batch No" name="batchNo"  value={updatedFields.batchNo !== undefined ? updatedFields.batchNo : selectedBatch?._id?.batchNo || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Vendor Name" name="vendorName"  value={updatedFields.vendorName !== undefined ? updatedFields.vendorName : selectedBatch?._id?.vendorName || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
          <TextField label="Room No" name="roomNo"  value={updatedFields.roomNo !== undefined ? updatedFields.roomNo : selectedBatch?._id?.roomNo || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
          <TextField label="Financial Year" name="financialYear" value={updatedFields.financialYear !== undefined ? updatedFields.financialYear : selectedBatch?._id?.financialYear || ""} onChange={handleFieldChange} fullWidth sx={{ mb: 2 }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleUpdateSubmit} color="primary" variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModifyStock;

