import React, { useState, useEffect } from "react";
import axios from "axios";
import StockQuery from "./StockQuery";
import '../styles/princiapalapproval.css';  

function PrincipalApproval() {
  const [stocks, setStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page');

  // Fetch pending stock items for Principal approval
  const fetchPendingStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/principal-pending");
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks for Principal approval", err);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
  }, []);

  // Handle approval or rejection of a stock item
  const handleApproval = async (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Please enter the reason for rejection:');
      setRejectionReason(reason);
    }
    try {
      const encodedId = encodeURIComponent(id);
      await axios.put(`http://localhost:5000/api/items/principal/${encodedId}`, {
        principalApprovalStatus: status,
        rejectionReason: reason
      });
      fetchPendingStocks();  // Refresh the list after approval action
    } catch (err) {
      console.error("Error updating Principal approval status", err);
    }
  };

  return (
    <div className="App">
      {/* Sidebar Navigation */}
      <div className="navbarParent">
        <div className="nav-item" onClick={() => setSelectedOption('Main Page')}>View Stocks</div>
        <div className="nav-item" onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</div>
      </div>

      <div className="content">
        {/* Conditionally render the StockQuery component when "Fetch Stocks" is selected */}
        {selectedOption === 'Fetch Stocks' && <StockQuery />}

        {/* Display stock approval list when "Main Page" is selected */}
        {selectedOption === 'Main Page' && (
          <>
            <h1>Principal Stock Approvals</h1>
            <h2>Pending Approvals</h2>

            {stocks.length === 0 ? (
              <p className="no-stocks-message">No stocks pending approval.</p>
            ) : (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Asset Head</th>
                    <th>Specifications</th>
                    <th>Vendor Name</th>
                    <th>Quantity</th>
                    <th>Batch No</th>
                    <th>Date of Purchase</th>
                    <th>Total Amount</th>
                    <th>Room No</th>
                    <th>Departments</th>
                    <th>HOD Approval Status</th>
                    <th>Principal Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock._id}>
                      <td>{stock.assetHeads}</td>
                      <td>{stock.specification}</td>
                      <td>{stock.vendorName}</td>
                      <td>{stock.quantity}</td>
                      <td>{stock.batchNo}</td>
                      <td>{new Date(stock.dateOfPurchase).toLocaleDateString()}</td>
                      <td>{stock.totalAmount}</td>
                      <td>{stock.roomNo}</td>
                      <td>{stock.allocatedDept}</td>
                      <td>{stock.hodApprovalStatus}</td>
                      <td>{stock.principalApprovalStatus}</td>
                      <td>
                        {stock.principalApprovalStatus === "pending" ? (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() => handleApproval(stock._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleApproval(stock._id, "rejected")}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>{stock.principalApprovalStatus.toUpperCase()}</span>
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

export default PrincipalApproval;
