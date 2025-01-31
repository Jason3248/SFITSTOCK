
 import '../styles/StockQuery.css';  // Importing the CSS file


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const StockQuery = () => {
//   const [stockType, setStockType] = useState(''); // Institutional or Departmental
//   const [searchId, setSearchId] = useState('');
//   const [allocatedDept, setAllocatedDept] = useState('');
//   const [roomNo, setRoomNo] = useState('');
//   const [specification, setSpecification] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [dateOfPurchase, setDateOfPurchase] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [results, setResults] = useState([]);
//   const [selectedStock, setSelectedStock] = useState(null);
//   const [allocatedDepartments, setAllocatedDepartments] = useState([]);

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/admin/config');
//         setAllocatedDepartments(res.data.allocatedDept || []);
//       } catch (err) {
//         console.error('Error fetching config', err);
//       }
//     };
//     fetchConfig();
//   }, []);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!stockType) {
//       alert('Please select stock type');
//       return;
//     }

//     const query = {
//       stockType,
//       _id: searchId,
//       allocatedDept,
//       roomNo,
//       specification,
//       quantity,
//       startDate,
//       endDate,
//     };

//     try {
//       const res = await axios.post(`http://localhost:5000/api/items/search`, query);
//       setResults(res.data);
//     } catch (err) {
//       console.error('Error fetching stock:', err);
//     }
//   };

//   const handleViewDetails = (stock) => {
//     setSelectedStock(stock);
//   };

//   const handleExportExcel = async () => {
//     if (!stockType) {
//       alert('Please select stock type');
//       return;
//     }

//     const query = { stockType };

//     if (searchId) query._id = searchId;
//     if (allocatedDept) query.allocatedDept = allocatedDept;
//     if (roomNo) query.roomNo = roomNo;
//     if (specification) query.specification = specification;
//     if (quantity) query.quantity = quantity;
//     if (dateOfPurchase) query.dateOfPurchase = dateOfPurchase;
//     if (startDate && endDate) {
//       query.startDate = startDate;
//       query.endDate = endDate;
//     }

//     try {
//       const res = await axios.post('http://localhost:5000/api/items/export-excel', query, {
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${stockType}-stocks.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       console.error('Error exporting to Excel:', err);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSearch} className="search-form">
//         <select onChange={(e) => setStockType(e.target.value)} required>
//           <option value="">Select Stock Type</option>
//           <option value="institutional">Institutional Stock</option>
//           <option value="departmental">Departmental Stock</option>
//         </select>
//         <input type="text" placeholder="Search by _id" onChange={(e) => setSearchId(e.target.value)} />
//         <select onChange={(e) => setAllocatedDept(e.target.value)}>
//           <option value="">Select Department</option>
//           {allocatedDepartments.map((dept) => (
//             <option key={dept} value={dept}>
//               {dept}
//             </option>
//           ))}
//         </select>
//         <input type="text" placeholder="Room No" onChange={(e) => setRoomNo(e.target.value)} />
//         <input type="text" placeholder="Specification" onChange={(e) => setSpecification(e.target.value)} />
//         <input type="number" placeholder="Quantity" onChange={(e) => setQuantity(e.target.value)} />
//         <input type="date" placeholder="Purchase Date" onChange={(e) => setDateOfPurchase(e.target.value)} />
//         <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
//         <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
//         <button type="submit">Search</button>
//       </form>

//       {results.length > 0 && (
//         <table>
//           <thead>
//             <tr>
//               <th>Stock ID</th>
//               <th>Department</th>
//               <th>Room No</th>
//               <th>Vendor Name</th>
//               <th>Specification</th>
//               <th>Quantity</th>
//               <th>Date of Purchase</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.map((stock) => (
//               <tr key={stock._id}>
//                 <td>{stock._id}</td>
//                 <td>{stock.allocatedDept}</td>
//                 <td>{stock.roomNo}</td>
//                 <td>{stock.vendorName}</td>
//                 <td>{stock.specification}</td>
//                 <td>{stock.quantity}</td>
//                 <td>{stock.dateOfPurchase}</td>
//                 <td>
//                   <button onClick={() => handleViewDetails(stock)}>View Full Stock Details</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {selectedStock && (
//         <div className="stock-details">
//           <h3>Stock Details</h3>
//           {/* Display selected stock details */}
//         </div>
//       )}

//       <button onClick={handleExportExcel} className="export-button">
//         Export to Excel
//       </button>
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; 



const StockQuery = () => {
  const [stockType, setStockType] = useState('');
  const [allocatedDept, setAllocatedDept] = useState('');
  const [specification, setSpecification] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [results, setResults] = useState([]);
  const [allocatedDepartments, setAllocatedDepartments] = useState([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/config');
        setAllocatedDepartments(res.data.allocatedDept || []);
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

    const query = { stockType, allocatedDept, specification, startDate, endDate, minAmount, maxAmount };

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
      "Quantity": batch.totalQuantity,
      "Total Amount": `₹${batch.totalAmount}`,
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
        <input type="text" placeholder="Specification" onChange={(e) => setSpecification(e.target.value)} />
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
                  <td>{batch.totalQuantity}</td>
                  <td>₹{batch.totalAmount}</td>
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


// export default StockQuery;


// export default StockQuery;

