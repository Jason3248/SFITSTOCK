import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'
import '../styles/StockQuery.css';  // Importing the CSS file

const StockQuery = () => {
    const [stockType, setStockType] = useState('');
    const [allocatedDept, setAllocatedDept] = useState('');
    const [specification, setSpecification] = useState('');
    const [assetHead, setAssetHead] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [results, setResults] = useState([]);
    const [allocatedDepartments, setAllocatedDepartments] = useState([]);
    const [assetHeads, setAssetHeads] = useState([]);
    const [roomNo, setRoomNo] = useState('');
  
    useEffect(() => {
      const fetchConfig = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/admin/config');
          setAllocatedDepartments(res.data.allocatedDept || []);
          setAssetHeads(res.data.assetHeads || []);
          console.log(assetHeads);
          console.log(allocatedDepartments);
          
        } catch (err) {
          console.error('Error fetching config', err);
        }
      };
      fetchConfig();
    }, []);
  
    const handleSearch = async (e) => {
      e.preventDefault();
      if (!stockType) {
        alert('Please select stock type');
        return;
      }
  
      const query = { stockType, allocatedDept, assetHead, specification, roomNo, startDate, endDate, minAmount, maxAmount };
  
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
  
      const data = results.map(batch => ({
        "Specification": batch._id.specification,
        "Vendor Name": batch._id.vendorName,
        "Batch No": batch._id.batchNo,
        "Allocated Dept": batch._id.allocatedDept,
        "Asset Head": batch._id.assetHeads,
        "Room No": batch._id.roomNo,
        "Quantity": batch.totalQuantity,
        "Total Amount": `₹${Math.round(batch.totalAmount)}`,
        "Date of Purchase": new Date(batch._id.dateOfPurchase).toLocaleDateString()
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Data");
  
      XLSX.writeFile(workbook, "Stock_Query.xlsx");
    };
  
    return (
      <div>
        <form onSubmit={handleSearch} className="search-form">
          <select onChange={(e) => setStockType(e.target.value)} required>
            <option value="">Select Stock Type</option>
            <option value="institutional">Institutional Stock</option>
            <option value="departmental">Departmental Stock</option>
          </select>
          <select onChange={(e) => setAllocatedDept(e.target.value)}>
            <option value="">Select Department</option>
            {allocatedDepartments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
          onChange={(e) => setAssetHead(e.target.value)}>
            <option value="">Select Asset head</option>
            {
              assetHeads.map((item) => {
                return (<option key={item} value={item}>{item}</option>)
              })
            }
            </select>
          <input type="text" placeholder="Specification" onChange={(e) => setSpecification(e.target.value)} />
          <input type="text" placeholder="Room No" onChange={(e) => setRoomNo(e.target.value)} />
          <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
  
          {/* Min and Max Amount Filters */}
          <input type="number" placeholder="Min Amount" onChange={(e) => setMinAmount(e.target.value)} />
          <input type="number" placeholder="Max Amount" onChange={(e) => setMaxAmount(e.target.value)} />
  
          <button type="submit">Search</button>
        </form>
  
        {results.length > 0 && (
          <>
            <button onClick={handleExportToExcel} className="export-btn">Export to Excel</button>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Vendor Name</th>
                  <th>Batch No</th>
                  <th>Department</th>
                  <th>Asset Head</th>
                  <th>Room No</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Date of Purchase (Format: MM-DD-YYYY)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((batch, index) => (
                  <tr key={index}>
                    <td>{batch._id.specification}</td>
                    <td>{batch._id.vendorName}</td>
                    <td>{batch._id.batchNo}</td>
                    <td>{batch._id.allocatedDept}</td>
                    <td>{batch._id.assetHeads}</td>
                    <td>{batch._id.roomNo}</td>
                    <td>{batch.totalQuantity}</td>
                    <td>₹{Math.round(batch.totalAmount)}</td>
                    <td>{new Date(batch._id.dateOfPurchase).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  };


export default StockQuery;
