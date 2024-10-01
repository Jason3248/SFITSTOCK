import React, { useState, useEffect } from "react";
import axios from "axios";

function PrincipalApproval() {
  const [stocks, setStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
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


  const handleApproval = async (id, status) => {
    let reason = '';
    if(status === 'rejected'){
      reason = prompt('Please enter the reason for rejection:');
      setRejectionReason(reason);
    }
    try {
      const encodedId = encodeURIComponent(id);
      await axios.put(`http://localhost:5000/api/items/principal/${encodedId}`, {
        principalApprovalStatus: status,
        rejectionReason: reason
      });
      fetchPendingStocks(); 
    } catch (err) {
      console.error("Error updating Principal approval status", err);
    }
  };

  return (
    <div className="App">
      <h1>Principal Stock Approval Page(The Principal can only approve/reject the request)</h1>

      <h2>Pending Approvals</h2>
      <table>
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
                {stock.principalApprovalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApproval(stock._id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(stock._id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}
                {stock.principalApprovalStatus !== "pending" && (
                  <span>{stock.principalApprovalStatus.toUpperCase()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrincipalApproval;
