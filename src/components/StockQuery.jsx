import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Download } from "@mui/icons-material";

const StockQuery = () => {
  const [stockType, setStockType] = useState("");
  const [allocatedDept, setAllocatedDept] = useState("");
  const [specification, setSpecification] = useState("");
  const [assetHead, setAssetHead] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [results, setResults] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);
  const [assetHeads, setAssetHeads] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/config");
        setAllocatedDepartments(res.data.allocatedDept || []);
        setAssetHeads(res.data.assetHeads || []);
      } catch (err) {
        console.error("Error fetching config", err);
      }
    };
    fetchConfig();
  }, []);

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
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  const handleExportToExcel = () => {
    if (results.length === 0) {
      alert("No data to export!");
      return;
    }

    const data = results.map((batch) => ({
      "Specification": batch._id.specification,
      "Vendor Name": batch._id.vendorName,
      "Batch No": batch._id.batchNo,
      "Allocated Dept": batch._id.allocatedDept,
      "Asset Head": batch._id.assetHeads,
      "Room No": batch._id.roomNo,
      "Quantity": batch.totalQuantity,
      "Total Amount": `₹${batch.totalAmount.toFixed(2)}`,
      "Date of Purchase": new Date(batch._id.dateOfPurchase).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");

    XLSX.writeFile(workbook, "Stock_Query.xlsx");
  };

  return (
    <div style={{ padding: "20px" }}>
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
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: "200px" }}>
          <InputLabel>Asset Head</InputLabel>
          <Select value={assetHead} onChange={(e) => setAssetHead(e.target.value)}>
            <MenuItem value="">Select Asset Head</MenuItem>
            {assetHeads.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField label="Specification" onChange={(e) => setSpecification(e.target.value)} />
        <TextField label="Room No" onChange={(e) => setRoomNo(e.target.value)} />
        <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} onChange={(e) => setStartDate(e.target.value)} />
        <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} onChange={(e) => setEndDate(e.target.value)} />
        <TextField type="number" label="Min Amount" onChange={(e) => setMinAmount(e.target.value)} />
        <TextField type="number" label="Max Amount" onChange={(e) => setMaxAmount(e.target.value)} />

        <Button type="submit" variant="contained" color="primary">
          Search
        </Button>
      </form>

      {results.length > 0 && (
        <>
          <Button onClick={handleExportToExcel} variant="contained" color="success" startIcon={<Download />}>
            Export to Excel
          </Button>

          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>Specification</b></TableCell>
                  <TableCell><b>Vendor Name</b></TableCell>
                  <TableCell><b>Batch No</b></TableCell>
                  <TableCell><b>Department</b></TableCell>
                  <TableCell><b>Asset Head</b></TableCell>
                  <TableCell><b>Room No</b></TableCell>
                  <TableCell><b>Quantity</b></TableCell>
                  <TableCell><b>Total Amount</b></TableCell>
                  <TableCell><b>Date of Purchase</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((batch, index) => (
                  <TableRow key={index}>
                    <TableCell>{batch._id.specification}</TableCell>
                    <TableCell>{batch._id.vendorName}</TableCell>
                    <TableCell>{batch._id.batchNo}</TableCell>
                    <TableCell>{batch._id.allocatedDept}</TableCell>
                    <TableCell>{batch._id.assetHeads}</TableCell>
                    <TableCell>{batch._id.roomNo}</TableCell>
                    <TableCell>{batch.totalQuantity}</TableCell>
                    <TableCell>₹{batch.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(batch._id.dateOfPurchase).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default StockQuery;
