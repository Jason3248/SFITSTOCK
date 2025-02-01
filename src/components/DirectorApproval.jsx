import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockQuery from './StockQuery';
import '../styles/directorapproval.css';
import ViewStocks from './ViewStocks';
function DirectorApproval() {
  const [pendingStocks, setPendingStocks] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOption, setSelectedOption] = useState('Main Page');
  const [loading, setLoading] = useState(false);

  // Fetch the pending stocks for director approval
  const fetchPendingStocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/items/director-pending');
      setPendingStocks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending stocks', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStocks();
  }, []);

  // Handle approval or rejection of stock items
  const handleApproval = async (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Please enter the reason for rejection:');
      setRejectionReason(reason);
    }
    try {
      const encodedId = encodeURIComponent(id);
      await axios.put(`http://localhost:5000/api/items/director/${encodedId}`, {
        directorApprovalStatus: status,
        rejectionReason: reason,
      });
      fetchPendingStocks(); // Refresh the list after updating approval status
    } catch (err) {
      console.error('Error updating stock status', err);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userLevel');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <div className="navbarParent">
        <div className="nav-item" onClick={() => setSelectedOption('View stocks')}>View Stocks</div>
        <div className="nav-item" onClick={() => setSelectedOption('Fetch Stocks')}>Fetch Stocks</div>
        <div className="nav-item" onClick={() => logout()}>Logout</div>
      </div>

      <div className="content">
        {/* Conditionally render StockQuery component */}
        {selectedOption === 'Fetch Stocks' && <StockQuery />}

        {/* Display pending stock items when on Main Page */}
        {selectedOption === 'View Stocks' && (
          // <div>
          //   <h2>Pending Director Approvals</h2>

          //   {/* Display loading message when fetching data */}
          //   {loading ? (
          //     <p className="loading-message">Loading pending stocks...</p>
          //   ) : (
          //     <table className="stock-table">
          //       <thead>
          //         <tr>
          //           <th>Asset Heads</th>
          //           <th>Vendor Name</th>
          //           <th>Quantity</th>
          //           <th>Department</th>
          //           <th>Invoice</th>
          //           <th>HOD Approval</th>
          //           <th>Principal Approval</th>
          //           <th>Actions</th>
          //         </tr>
          //       </thead>
          //       <tbody>
          //         {pendingStocks.length === 0 ? (
          //           <tr>
          //             <td colSpan="8">No pending approvals at the moment.</td>
          //           </tr>
          //         ) : (
          //           pendingStocks.map((stock) => (
          //             <tr key={stock._id}>
          //               <td>{stock.assetHeads.join(', ')}</td>
          //               <td>{stock.vendorName}</td>
          //               <td>{stock.quantity}</td>
          //               <td>{stock.allocatedDept}</td>
          //               <td>
          //                 {stock.bills ? (
          //                   <a href={stock.bills} target="_blank" rel="noopener noreferrer">
          //                     View Invoice
          //                   </a>
          //                 ) : (
          //                   'No Invoice'
          //                 )}
          //               </td>
          //               <td>{stock.hodApprovalStatus}</td>
          //               <td>{stock.principalApprovalStatus}</td>
          //               <td>
          //                 {stock.directorApprovalStatus === 'pending' ? (
          //                   <>
          //                     <button
          //                       className="approve-btn"
          //                       onClick={() => handleApproval(stock._id, 'approved')}
          //                     >
          //                       Approve
          //                     </button>
          //                     <button
          //                       className="reject-btn"
          //                       onClick={() => handleApproval(stock._id, 'rejected')}
          //                     >
          //                       Reject
          //                     </button>
          //                   </>
          //                 ) : (
          //                   <span>{stock.directorApprovalStatus.toUpperCase()}</span>
          //                 )}
          //               </td>
          //             </tr>
          //           ))
          //         )}
          //       </tbody>
          //     </table>
          //   )}
          // </div>
          <ViewStocks />
        )}
      </div>
    </>
  );
}

export default DirectorApproval;
