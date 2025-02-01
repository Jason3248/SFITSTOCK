import React, { useState, useEffect } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig"; // Import Firebase storage
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Box, Typography, InputAdornment } from "@mui/material";
import StockQuery from "./StockQuery";
import Profile from './Profile';
import ViewStocks from "./ViewStocks";
import sfit_logo from '../components/assets/sfit_logo.gif'
import * as XLSX from 'xlsx';

function PurchaseInCharge() {
  const [approvedStocks, setApprovedStocks] = useState([]);
  const [assetHeads, setAssetHeads] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Add Stock');
  const [file, setFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null); // Added state for excel file
  const [stockData, setStockData] = useState({
    _id: "",
    assetHeads: "",
    specification: "",
    vendorName: "",
    quantity: 0,
    batchNo: "",
    totalAmount: 0,
    roomNo: "",
    dateOfPurchase: "",
    purpose: "",
    financialYear: "",
    bills: "",
    stockType: "Departmental Stock",
    allocatedDept: [{ department: "", allocatedQuantity: 0 }]
  });

  const [editId, setEditId] = useState(null);

  const fetchConfig = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/config");
      setAssetHeads(res.data.assetHeads || []);
      setAllocatedDepartments(res.data.allocatedDept || []);
    } catch (err) {
      console.error("Error fetching config", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  const fetchApprovedStocks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/items/groupApprovedStocks");
      setApprovedStocks(res.data);
    } catch (err) {
      console.error("Error fetching approved items", err);
    }
  };

  useEffect(() => {
    fetchApprovedStocks();
    fetchConfig(); // Load asset heads and allocated departments from config
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStockData({ ...stockData, [name]: value });
  };

  const handleAllocatedDeptChange = (index, field, value) => {
    const updatedDept = [...stockData.allocatedDept];
    updatedDept[index][field] = value;
    setStockData({ ...stockData, allocatedDept: updatedDept });
  };

  const handleAddDeptAllocation = () => {
    setStockData({
      ...stockData,
      allocatedDept: [
        ...stockData.allocatedDept,
        { department: "", allocatedQuantity: 0 }
      ]
    });
  };

  const handleRemoveDeptAllocation = (index) => {
    const updatedDept = [...stockData.allocatedDept];
    updatedDept.splice(index, 1);
    setStockData({ ...stockData, allocatedDept: updatedDept });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return null;
    const storageRef = ref(storage, `bills/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error("File upload failed", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedBillUrl = "";
      if (file) {
        uploadedBillUrl = await uploadFile();
      }

      const { assetHeads, specification, vendorName, totalAmount, batchNo, dateOfPurchase, purpose, financialYear, bills, allocatedDept, stockType, quantity } = stockData;

      // Handle backend call for adding stock
      await axios.post("http://localhost:3000/api/items/addStock", {
        assetHeads,
        specification,
        vendorName,
        totalAmount,
        batchNo,
        dateOfPurchase,
        purpose,
        financialYear,
        bills: uploadedBillUrl || bills,
        allocatedDept,
        stockType,
        quantity
      });

      setEditId(null);
      setStockData({
        _id: "",
        assetHeads: "",
        specification: "",
        vendorName: "",
        quantity: 0,
        batchNo: "",
        totalAmount: 0,
        roomNo: "",
        dateOfPurchase: "",
        purpose: "",
        financialYear: "",
        bills: "",
        stockType: "Departmental Stock",
        allocatedDept: [{ department: "", allocatedQuantity: 0 }]
      });
      setSelectedOption('Stocks');
    } catch (error) {
      console.error("Error adding/updating item", error);
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      try {
        // Send the parsed data to the backend
        const response = await axios.post("http://localhost:3000/api/items/uploadStockExcel", { stocks: parsedData });
        alert(response.data.message);
        fetchApprovedStocks(); // Refresh stock list
      } catch (error) {
        console.error("Error uploading stock data:", error);
        alert("Failed to upload stock data.");
      }
    };
  };

  return (
    <Box className="purchase-in-charge-container" sx={{ padding: 3 }}>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={sfit_logo} alt="SFIT Logo" className="logo-img" />
          <Typography variant="h6">SFIT <strong>STOCK</strong></Typography>
        </div>
        <div className="navbar-links">
          <Button variant="contained" color="primary" onClick={() => setSelectedOption('Add Stock')}>
            Add Stock
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setSelectedOption('Stocks')}>
            View Stocks
          </Button>
          <Button variant="contained" color="success" onClick={() => setSelectedOption('Fetch Stocks')}>
            Fetch Stocks
          </Button>
          <Button variant="contained" color="info" onClick={() => setSelectedOption('Update Profile')}>
            Update Profile
          </Button>
          <Button variant="contained" color="error" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </nav>

      <Box className="content">
        {selectedOption === 'Add Stock' && (
          <div>
            <Typography variant="h4" gutterBottom>Add Stock</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Upload Stock Excel</Typography>
                <Button variant="contained" component="label" fullWidth>
                  Choose Excel File
                  <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelUpload} />
                </Button>
              </Grid>
            </Grid>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Asset Head</InputLabel>
                    <Select
                      name="assetHeads"
                      value={stockData.assetHeads}
                      onChange={handleChange}
                      label="Asset Head"
                      required
                    >
                      <MenuItem value="">Select an Asset Head</MenuItem>
                      {assetHeads.map((head, index) => (
                        <MenuItem key={index} value={head}>{head}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Specification"
                    name="specification"
                    value={stockData.specification}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vendor Name"
                    name="vendorName"
                    value={stockData.vendorName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={stockData.quantity}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Batch No"
                    name="batchNo"
                    value={stockData.batchNo}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Amount"
                    name="totalAmount"
                    type="number"
                    value={stockData.totalAmount}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Purchase"
                    name="dateOfPurchase"
                    type="date"
                    value={stockData.dateOfPurchase}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Purpose"
                    name="purpose"
                    value={stockData.purpose}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Financial Year"
                    name="financialYear"
                    value={stockData.financialYear}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">Upload Bills (Invoice)</Typography>
                  <Button variant="contained" component="label" fullWidth>
                    Choose Bill File
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Stock Type</InputLabel>
                    <Select
                      name="stockType"
                      value={stockData.stockType}
                      onChange={handleChange}
                      label="Stock Type"
                    >
                      <MenuItem value="Departmental Stock">Departmental Stock</MenuItem>
                      <MenuItem value="Institutional Stock">Institutional Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {stockData.stockType === "Institutional Stock" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Room No."
                      name="roomNo"
                      value={stockData.roomNo}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                )}

                {stockData.stockType === "Departmental Stock" && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Allocated Departments</Typography>
                    {stockData.allocatedDept.map((dept, index) => (
                      <Grid container spacing={2} key={index}>
                        <Grid item xs={12} sm={5}>
                          <Select
                            value={dept.department}
                            onChange={(e) => handleAllocatedDeptChange(index, "department", e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="">Select Department</MenuItem>
                            {allocatedDepartments.map((dept, i) => (
                              <MenuItem key={i} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <TextField
                            type="number"
                            value={dept.allocatedQuantity}
                            onChange={(e) => handleAllocatedDeptChange(index, "allocatedQuantity", e.target.value)}
                            fullWidth
                            placeholder="Allocated Quantity"
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemoveDeptAllocation(index)}
                            fullWidth
                          >
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    ))}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleAddDeptAllocation}
                    >
                      Add Department
                    </Button>
                  </Grid>
                )}
              </Grid>

              <Box mt={3} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  {editId ? "Update" : "Add"} Stock
                </Button>
              </Box>
            </form>
          </div>
        )}

        {selectedOption === 'Stocks' && (
          <ViewStocks />
        )}
      </Box>
    </Box>
  );
}

export default PurchaseInCharge;
