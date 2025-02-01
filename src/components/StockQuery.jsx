import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/StockQuery.css';  // Importing the CSS file

const StockQuery = () => {
  const [searchId, setSearchId] = useState('');
  const [allocatedDept, setAllocatedDept] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [specification, setSpecification] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dateOfPurchase, setDateOfPurchase] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);

  // Fetching allocated departments on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/admin/config');
        setAllocatedDepartments(res.data.allocatedDept || []);
      } catch (err) {
        console.error('Error fetching config', err);
      }
    };
    fetchConfig();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = { _id: searchId, allocatedDept, roomNo, specification, quantity, startDate, endDate };

    try {
      const res = await axios.post('http://localhost:3000/api/items/search', query);
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const handleViewDetails = (stock) => {
    setSelectedStock(stock);
  };

  const handleExportExcel = async () => {
    const query = {};

    if (searchId) query._id = searchId;
    if (allocatedDept) query.allocatedDept = allocatedDept;
    if (roomNo) query.roomNo = roomNo;
    if (specification) query.specification = specification;
    if (quantity) query.quantity = quantity;
    if (dateOfPurchase) query.dateOfPurchase = dateOfPurchase;

    try {
      const res = await axios.post('http://localhost:3000/api/items/export-excel', query, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stocks.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  return (
    <div className="stock-query-container">
      <form onSubmit={handleSearch} className="search-form">
        <h2>Stock Search</h2>
        <div className="input-group">
          <input type="text" placeholder="Search by _id" onChange={(e) => setSearchId(e.target.value)} />
          <select onChange={(e) => setAllocatedDept(e.target.value)}>
            <option value="">Select Department</option>
            {allocatedDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <input type="text" placeholder="Room No" onChange={(e) => setRoomNo(e.target.value)} />
          <input type="text" placeholder="Specification" onChange={(e) => setSpecification(e.target.value)} />
          <input type="number" placeholder="Quantity" onChange={(e) => setQuantity(e.target.value)} />
          <input type="date" placeholder="Purchase Date" onChange={(e) => setDateOfPurchase(e.target.value)} />
          <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
          <button type="submit">Search</button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="results-table">
          <h3>Search Results</h3>
          <table>
            <thead>
              <tr>
                <th>Stock Unique ID</th>
                <th>Department</th>
                <th>Room No</th>
                <th>Vendor Name</th>
                <th>Specification</th>
                <th>Quantity ID</th>
                <th>Date of Purchase</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock) => (
                <tr key={stock._id}>
                  <td>{stock._id}</td>
                  <td>{stock.allocatedDept}</td>
                  <td>{stock.roomNo}</td>
                  <td>{stock.vendorName}</td>
                  <td>{stock.specification}</td>
                  <td>{stock.quantity}</td>
                  <td>{stock.dateOfPurchase}</td>
                  <td>
                    <button onClick={() => handleViewDetails(stock)} className="view-button">
                      View Full Stock Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStock && (
        <div className="stock-details">
          <h3>Stock Details</h3>
          <p><strong>Specification:</strong> {selectedStock.specification}</p>
          <p><strong>Vendor:</strong> {selectedStock.vendorName}</p>
          <p><strong>Room No:</strong> {selectedStock.roomNo}</p>
          <p><strong>Quantity:</strong> {selectedStock.quantity}</p>
          <p><strong>Date of Purchase:</strong> {selectedStock.dateOfPurchase}</p>
        </div>
      )}

      <button onClick={handleExportExcel} className="export-button">
        Export to Excel
      </button>
    </div>
  );
};

export default StockQuery;
