import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockQuery from './StockQuery';
function DirectorApproval() {
  const [pendingStocks, setPendingStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page')
  const fetchPendingStocks = async () => {
    try {
      
      const res = await axios.get('http://localhost:5000/api/items/director-pending');
      
      setPendingStocks(res.data);
    } catch (err) {
      console.error('Error fetching pending stocks', err);
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
      await axios.put(`http://localhost:5000/api/items/director/${encodedId}`, { directorApprovalStatus: status,
      rejectionReason: reason
       });
      fetchPendingStocks();  // Refresh the list after approval/rejection
    } catch (err) {
      console.error('Error updating stock status', err);
    }
  };

  return (
    <>
      <div className="sidebar">
        <button onClick={() => setSelectedOption('Main Page')}>View Stocks</button>
        <button onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</button>
      </div>
      {
        selectedOption === 'Fetch Stocks' && (
          <StockQuery />
        )
      }
      {
        selectedOption === 'Main Page' && (
          <div>
      <h2>Pending Director Approvals</h2>
      <table>
        <thead>
          <tr>
            <th>Asset Heads</th>
            <th>Vendor Name</th>
            <th>Quantity</th>
            <th>Department</th>
            <th>Invoice</th>
            <th>HOD Approval</th>
            <th>Principal Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingStocks.map((stock) => (
            <tr key={stock._id}>
              <td>{stock.assetHeads.join(', ')}</td>
              <td>{stock.vendorName}</td>
              <td>{stock.quantity}</td>
              <td>{stock.allocatedDept}</td>
              <td>
                    {stock.bills ? (
                      <a href={stock.bills} target="_blank" rel="noopener noreferrer">
                        View Invoice
                      </a>
                    ) : (
                      "No Invoice"
                    )}
                </td>
              <td>{stock.hodApprovalStatus}</td>
              <td>{stock.principalApprovalStatus}</td>
              <td>
                <button onClick={() => handleApproval(stock._id, 'approved')}>Approve</button>
                <button onClick={() => handleApproval(stock._id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        )
      }
    
    </>
  );
}

export default DirectorApproval;
