
import { useLocation, useNavigate } from 'react-router-dom'; // Import navigate for redirection
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockQuery from './StockQuery';
import '../styles/hodPage.css'
import Profile from './Profile';
import ViewStocks from './ViewStocks';
// function HODPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { department } = location.state || {}; // Retrieve department from route state

//   const [stocks, setStocks] = useState([]);
//   const [filteredStocks, setFilteredStocks] = useState([]);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [selectedOptions, setSelectedOptions] = useState('');

//   // Redirect to login if no department is passed
//   useEffect(() => {
//     if (!department) {
//       alert('No department found! Redirecting to login page.');
//       navigate('/login'); // Redirect to login if department is not found
//     } else {
//       fetchStocks();
//     }
//   }, [department, navigate]);

//   // Fetch stocks for the selected department
//   const fetchStocks = async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/items/getstocks/${department}`);
//       setStocks(res.data);
//       setFilteredStocks(res.data); // Initialize filteredStocks with all data
//     } catch (err) {
//       console.error("Error fetching items", err);
//     }
//   };

//   const handleApproval = async (id, status) => {
//     let reason = '';
//     if (status === 'rejected') {
//       reason = prompt('Please enter the reason for rejection:');
//       setRejectionReason(reason);
//     }
//     try {
//       const encodedId = encodeURIComponent(id);
//       await axios.put(`http://localhost:5000/api/items/approve/${department}/${encodedId}`, {
//         hodApprovalStatus: status,
//         rejectionReason: reason,
//       });
//       fetchStocks(); // Refresh stocks after updating
//     } catch (err) {
//       console.error("Error updating approval status", err);
//     }
//   };

//   return (
//     <div className="App">
//       {/* Sidebar Navigation */}
//       <div className="">
//         <div className="">
//           <button onClick={() => setSelectedOptions('Main Page')}>View Stocks</button>
//         </div>
//         <div>
//           <button onClick={() => setSelectedOptions('Fetch Stocks')}>Fetch Stocks</button>
//         </div>
//         <div>
//           <button onClick={() => setSelectedOptions('Update Profile')}>Update Profile</button>
//         </div>
//       </div>

//       <div className="content">
//         {/* Conditionally render components based on the selected option */}
//         {selectedOptions === 'Fetch Stocks' && <StockQuery />}

//         {selectedOptions === 'Main Page' && (
//           <>
//             <h1>Page Of the HOD of the {department} Department</h1>
//             {filteredStocks.length === 0 ? (
//               <p className="no-stocks-message">No stocks available at the moment.</p>
//             ) : (
//               <table className="stock-table">
//                 <thead>
//                   <tr>
//                     <th>Asset Head</th>
//                     <th>Specification</th>
//                     <th>Vendor Name</th>
//                     <th>Quantity</th>
//                     <th>Batch No</th>
//                     <th>Date of Purchase</th>
//                     <th>Total Amount</th>
//                     <th>Room No</th>
//                     <th>Invoice</th>
//                     <th>Department</th>
//                     <th>Approval By HOD</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStocks.map((stock) => (
//                     <tr key={stock._id}>
//                       <td>{stock.assetHeads}</td>
//                       <td>{stock.specification}</td>
//                       <td>{stock.vendorName}</td>
//                       <td>{stock.quantity}</td>
//                       <td>{stock.batchNo}</td>
//                       <td>{stock.dateOfPurchase}</td>
//                       <td>{stock.totalAmount}</td>
//                       <td>{stock.roomNo}</td>
//                       <td>{stock.bills ? (
//                           <a href={stock.bills} target="_blank" rel="noopener noreferrer">
//                             View Invoice
//                           </a>
//                         ) : (
//                           "No Invoice"
//                         )}</td>
//                       <td>{stock.allocatedDept}</td>
//                       <td>{stock.hodApprovalStatus}</td>
//                       <td>
//                       {stock.hodApprovalStatus === "pending" ? (
//                           <>
//                             <button className="approve-btn" onClick={() => handleApproval(stock._id, "approved")}>
//                               Approve
//                             </button>
//                             <button className="reject-btn" onClick={() => handleApproval(stock._id, "rejected")}>
//                               Reject
//                             </button>
//                           </>
//                         ) : (
//                           <span>{stock.hodApprovalStatus.toUpperCase()}</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </>
//         )}
//         {
//           selectedOptions === 'Update Profile' && (
//             <Profile />
//           )
//         }
//       </div>
//     </div>
//   );
// }
function HODPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { department } = location.state || {}; 
  const [selectedOptions, setSelectedOptions] = useState('');

 
  useEffect(() => {
    if (!department) {
      alert('No department found! Redirecting to login page.');
      navigate('/login'); 
   
  }}, [department, navigate]);


  // Fetch stocks for the selected department
  // const fetchStocks = async () => {
  //   try {
  //     const res = await axios.get(`http://localhost:5000/api/items/getstocks/${department}`);
  //     setStocks(res.data);
  //     setFilteredStocks(res.data); // Initialize filteredStocks with all data
  //   } catch (err) {
  //     console.error("Error fetching items", err);
  //   }
  // };

  return (
    <div className="App">
   
      <div className="sidebar">
        <button onClick={() => setSelectedOptions('View Stocks')}>View Stocks</button>
        <button onClick={() => setSelectedOptions('Fetch Stocks')}>Fetch Stocks</button>
        <button onClick={() => setSelectedOptions('Update Profile')}>Update Profile</button>
      </div>

      <div className="content">
        
        {selectedOptions === 'Fetch Stocks' && <StockQuery />}

        {selectedOptions === 'View Stocks' && <ViewStocks />}

        {selectedOptions === 'Update Profile' && <Profile />}
      </div>
    </div>
  );
}



export default HODPage;

