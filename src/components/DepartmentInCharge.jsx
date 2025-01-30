// import React, { useState, useEffect } from "react";
// import axios from "axios";

// function DepartmentInCharge({ department }) {
//   const [stocks, setStocks] = useState([]);
//   const [roomNumbers, setRoomNumbers] = useState({});

//   useEffect(() => {
//     fetchDepartmentStocks();
//   }, []);

//   const fetchDepartmentStocks = async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/items/department-stocks/${department}`);
//       setStocks(res.data);
//       console.log(res.data);
      
//     } catch (err) {
//       console.error("Error fetching department stocks", err);
//     }
//   };

//   const handleRoomChange = (stockId, value) => {
//     setRoomNumbers({ ...roomNumbers, [stockId]: value });
//   };

//   const handleSubmit = async (stockId) => {
//     if (!roomNumbers[stockId]) {
//       alert("Please enter a Room No.");
//       return;
//     }

//     try {
//       await axios.put("http://localhost:5000/api/items/assign-room", {
//         stockId,
//         department,
//         roomNo: roomNumbers[stockId],
//       });

//       alert("Room assigned successfully!");
//       fetchDepartmentStocks(); // Refresh the data
//     } catch (err) {
//       console.error("Error assigning room number", err);
//     }
//   };

//   return (
//     <div>
//       <h1>Department In-Charge Panel</h1>
//       <h2>Allocated Stocks for {department}</h2>

//       <table border="1">
//         <thead>
//           <tr>
//             <th>Specification</th>
//             <th>Vendor</th>
//             <th>Batch No</th>
//             <th>Quantity</th>
//             <th>Room No</th>
//             <th>Assign Room</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stocks.map((stock) => (
//             <tr key={stock._id}>
//               <td>{stock.specification}</td>
//               <td>{stock.vendorName}</td>
//               <td>{stock.batchNo}</td>
//               <td>{stock.quantity}</td>
//               <td>{stock.roomNo || "Not Assigned"}</td>
//               <td>
//                 <input
//                   type="text"
//                   value={roomNumbers[stock._id] || ""}
//                   onChange={(e) => handleRoomChange(stock._id, e.target.value)}
//                 />
//                 <button onClick={() => handleSubmit(stock._id)}>Assign</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// function DepartmentInCharge({ department }) {
//   const [stocks, setStocks] = useState([]);

//   console.log("Department received in component:", department);

//   const fetchStocks = async () => {
//     if (!department) return;  // Prevent calling API with undefined department
//     try {
//       const res = await axios.get(`http://localhost:5000/api/items/department/${department}`);
//       console.log("API Response:", res.data);
//       setStocks(res.data);
//     } catch (err) {
//       console.error("Error fetching stocks", err);
//     }
//   };

//   useEffect(() => {
//     fetchStocks();
//   }, [department]);  // Re-fetch stocks if department changes

//   useEffect(() => {
//     console.log("Updated stocks:", stocks);
//   }, [stocks]);  // Debugging state updates

//   const assignRoom = async (_id, roomNo) => {
//     try {
//       await axios.put("http://localhost:5000/api/items/assignRoom", { _id, roomNo });
//       console.log(`Room updated for ${_id}, fetching stocks again...`);
//       await fetchStocks();  // Ensure fetch runs after update
//     } catch (err) {
//       console.error("Error updating room", err);
//     }
//   };

//   return (
//     <div>
//       <h1>{department} Department In-Charge</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Specification</th>
//             <th>Vendor</th>
//             <th>Batch No</th>
//             <th>Room No</th>
//             <th>Assign Room</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stocks.length === 0 ? (
//             <tr>
//               <td colSpan="5">No stocks available</td>
//             </tr>
//           ) : (
//             stocks.map((stock) => {
//               console.log("Rendering stock:", stock);
//               return (
//                 <tr key={stock._id}>
//                   <td>{stock.specification}</td>
//                   <td>{stock.vendorName}</td>
//                   <td>{stock.batchNo}</td>
//                   <td>{stock.roomNo || "Not Assigned"}</td>
//                   <td>
//                     <input type="text" placeholder="Enter Room No" onBlur={(e) => assignRoom(stock._id, e.target.value)} />
//                   </td>
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import axios from "axios";

function DepartmentInCharge({ department }) {
  const [stocks, setStocks] = useState([]);
  const [roomNo, setRoomNo] = useState("");
  const [quantity, setQuantity] = useState("");

  console.log("Department received in component:", department);

  const fetchStocks = async () => {
    if (!department) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/items/department/${department}`);
      console.log("API Response:", res.data);
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks", err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [department]);

  useEffect(() => {
    console.log("Updated stocks:", stocks);
  }, [stocks]);

  const assignRoomBulk = async () => {
    if (!roomNo || !quantity) {
      alert("Please enter Room No and Quantity.");
      return;
    }

    try {
      const res = await axios.put("http://localhost:5000/api/items/assignRooms", {
        department,
        roomNo,
        quantity: parseInt(quantity, 10)
      });

      console.log("Room assignment response:", res.data);
      alert(res.data.message);
      fetchStocks(); // Refresh stock list
    } catch (err) {
      console.error("Error updating room", err);
      alert("Failed to assign rooms.");
    }
  };

  return (
    <div>
      <h1>{department} Department In-Charge</h1>

      {/* Room No and Quantity Inputs */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Room No"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Enter Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          style={{ marginRight: "10px" }}
        />
        <button onClick={assignRoomBulk}>Assign Room</button>
      </div>

      {/* Table to Display Stock */}
      <table>
        <thead>
          <tr>
            <th>Specification</th>
            <th>Vendor</th>
            <th>Batch No</th>
            <th>Room No</th>
          </tr>
        </thead>
        <tbody>
          {stocks.length === 0 ? (
            <tr>
              <td colSpan="4">No stocks available</td>
            </tr>
          ) : (
            stocks.map((stock) => (
              <tr key={stock._id}>
                <td>{stock.specification}</td>
                <td>{stock.vendorName}</td>
                <td>{stock.batchNo}</td>
                <td>{stock.roomNo || "Not Assigned"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentInCharge;






