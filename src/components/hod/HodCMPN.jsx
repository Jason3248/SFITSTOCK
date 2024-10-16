import React, { useState, useEffect } from "react";
import axios from "axios";
import StockQuery from '../StockQuery';
//import '../styles/hodcmpn.css';

function HodCMPN() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOptions, setSelectedOptions] = useState('Main Page');

  // Fetch CMPN department stocks
  const fetchStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/approve/cmpn");
      setStocks(res.data);
      setFilteredStocks(res.data); // Initialize filteredStocks with all data
    } catch (err) {
      console.error("Error fetching items", err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Handle approval or rejection of stocks
  const handleApproval = async (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Please enter the reason for rejection:');
      setRejectionReason(reason);
    }
    try {
      const encodedId = encodeURIComponent(id);
      await axios.put(`http://localhost:5000/api/items/approve/cmpn/${encodedId}`, {
        hodApprovalStatus: status,
        rejectionReason: reason
      });
      fetchStocks();
    } catch (err) {
      console.error("Error updating approval status", err);
    }
  };

  return (
    <div className="App">
      {/* Sidebar Navigation */}
      <div className="navbarParent">
        <div className="nav-item" >
          <button onClick={() => setSelectedOptions('Main Page')}>View Stocks</button></div>
        <div className="nav-item" > <button onClick={() => setSelectedOptions('Fetch Stocks')}>Fetch Stocks</button> </div>
      </div>

      <div className="content">
        {/* Conditionally render components based on the selected option */}
        {selectedOptions === 'Fetch Stocks' && <StockQuery />}

        {selectedOptions === 'Main Page' && (
          <>
            <h1>CMPN Approved Stock List</h1>
            {filteredStocks.length === 0 ? (
              <p className="no-stocks-message">No stocks available at the moment.</p>
            ) : (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Asset Head</th>
                    <th>Specification</th>
                    <th>Vendor Name</th>
                    <th>Quantity</th>
                    <th>Batch No</th>
                    <th>Date of Purchase</th>
                    <th>Total Amount</th>
                    <th>Room No</th>
                    <th>Invoice</th>
                    <th>Departments</th>
                    <th>Approval By HOD</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock._id}>
                      <td>{stock.assetHeads}</td>
                      <td>{stock.specification}</td>
                      <td>{stock.vendorName}</td>
                      <td>{stock.quantity}</td>
                      <td>{stock.batchNo}</td>
                      <td>{stock.dateOfPurchase}</td>
                      <td>{stock.totalAmount}</td>
                      <td>{stock.roomNo}</td>
                      <td>
                        {stock.bills ? (
                          <a href={stock.bills} target="_blank" rel="noopener noreferrer">
                            View Invoice
                          </a>
                        ) : (
                          "No Invoice"
                        )}
                      </td>
                      <td>{stock.allocatedDept}</td>
                      <td className={stock.hodApprovalStatus}>{stock.hodApprovalStatus}</td>
                      <td>
                        {stock.hodApprovalStatus === "pending" ? (
                          <>
                            <button className="approve-btn" onClick={() => handleApproval(stock._id, "approved")}>
                              Approve
                            </button>
                            <button className="reject-btn" onClick={() => handleApproval(stock._id, "rejected")}>
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>{stock.hodApprovalStatus.toUpperCase()}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HodCMPN;
