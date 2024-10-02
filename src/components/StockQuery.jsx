import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [allocatedDepartments, setAllocatedDepartments] = useState([]); // Store the fetched departments

  // Fetch config (allocated departments)
  const fetchConfig = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/config');
      setAllocatedDepartments(res.data.allocatedDept || []); // Set fetched allocated departments
    } catch (err) {
      console.error('Error fetching config', err);
    }
  };

  useEffect(() => {
    fetchConfig(); // Fetch allocated departments on component mount
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = { _id: searchId, allocatedDept, roomNo, specification, quantity, startDate, endDate };

    try {
      const res = await axios.post('http://localhost:5000/api/items/search', query);
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const handleViewDetails = (stock) => {
    setSelectedStock(stock); // Show stock details when clicked
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
      const res = await axios.post('http://localhost:5000/api/items/export-excel', query, {
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
    <div>
      <form onSubmit={handleSearch}>
        {/* Search form fields */}
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
      </form>

      {/* Display results in a table */}
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Stock Unique Identification</th>
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
                  <button onClick={() => handleViewDetails(stock)}>View Full Stock Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Selected stock details */}
      {selectedStock && (
        <div>
          <h3>Stock Details</h3>
          <p>
            <strong>Stock Unique Identification:</strong> {selectedStock._id}
          </p>
          <p>
            <strong>Department:</strong> {selectedStock.allocatedDept}
          </p>
          <p>
            <strong>Room No:</strong> {selectedStock.roomNo}
          </p>
          <p>
            <strong>Specification:</strong> {selectedStock.specification}
          </p>
          <p>
            <strong>Batch No:</strong> {selectedStock.batchNo}
          </p>
          <p>
            <strong>Quantity ID:</strong> {selectedStock.quantity}
          </p>
          <p>
            <strong>Date of Purchase:</strong> {selectedStock.dateOfPurchase}
          </p>
          <p>
            <strong>Financial Year:</strong> {selectedStock.financialYear}
          </p>
          <p>
            <strong>Total Amount:</strong> {selectedStock.totalAmount}
          </p>
          <p>
            <strong>Invoice:</strong>{' '}
            {selectedStock.bills ? (
              <a href={selectedStock.bills} target="_blank" rel="noopener noreferrer">
                View Invoice
              </a>
            ) : (
              'No Invoice'
            )}
          </p>
          <p>
            <strong>Vendor Name:</strong> {selectedStock.vendorName}
          </p>
        </div>
      )}

      <button onClick={handleExportExcel}>Export to Excel</button>
    </div>
  );
};

export default StockQuery;
