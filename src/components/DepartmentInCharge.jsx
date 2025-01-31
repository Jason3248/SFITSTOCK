
import { useState, useEffect } from "react";
import axios from "axios";

// function DepartmentInCharge({ department }) {
//   const [stocks, setStocks] = useState([]);
//   const [roomNo, setRoomNo] = useState("");
//   const [quantity, setQuantity] = useState("");

//   console.log("Department received in component:", department);

//   const fetchStocks = async () => {
//     if (!department) return;
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
//   }, [department]);

//   useEffect(() => {
//     console.log("Updated stocks:", stocks);
//   }, [stocks]);

//   const assignRoomBulk = async () => {
//     if (!roomNo || !quantity) {
//       alert("Please enter Room No and Quantity.");
//       return;
//     }

//     try {
//       const res = await axios.put("http://localhost:5000/api/items/assignRooms", {
//         department,
//         roomNo,
//         quantity: parseInt(quantity, 10)
//       });

//       console.log("Room assignment response:", res.data);
//       alert(res.data.message);
//       fetchStocks(); // Refresh stock list
//     } catch (err) {
//       console.error("Error updating room", err);
//       alert("Failed to assign rooms.");
//     }
//   };

//   return (
//     <div>
//       <h1>{department} Department In-Charge</h1>

//       {/* Room No and Quantity Inputs */}
//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           placeholder="Enter Room No"
//           value={roomNo}
//           onChange={(e) => setRoomNo(e.target.value)}
//           style={{ marginRight: "10px" }}
//         />
//         <input
//           type="number"
//           placeholder="Enter Quantity"
//           value={quantity}
//           onChange={(e) => setQuantity(e.target.value)}
//           min="1"
//           style={{ marginRight: "10px" }}
//         />
//         <button onClick={assignRoomBulk}>Assign Room</button>
//       </div>

//       {/* Table to Display Stock */}
//       <table>
//         <thead>
//           <tr>
//             <th>Specification</th>
//             <th>Vendor</th>
//             <th>Batch No</th>
//             <th>Room No</th>
//           </tr>
//         </thead>
//         <tbody>
//           {stocks.length === 0 ? (
//             <tr>
//               <td colSpan="4">No stocks available</td>
//             </tr>
//           ) : (
//             stocks.map((stock) => (
//               <tr key={stock._id}>
//                 <td>{stock.specification}</td>
//                 <td>{stock.vendorName}</td>
//                 <td>{stock.batchNo}</td>
//                 <td>{stock.roomNo || "Not Assigned"}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }
function DepartmentInCharge({ department }) {
  const [groupedStocks, setGroupedStocks] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [roomAssignments, setRoomAssignments] = useState([]);

  const fetchGroupedStocks = async () => {
    if (!department) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/items/departmentGrouped/${department}`);
      setGroupedStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks", err);
    }
  };

  useEffect(() => {
    fetchGroupedStocks();
  }, [department]);

  const openRoomAssignment = (batch) => {
    setSelectedBatch(batch);
    setRoomAssignments([{ roomNo: "", quantity: "" }]);
  };

  const handleRoomChange = (index, field, value) => {
    const updatedAssignments = [...roomAssignments];
    updatedAssignments[index][field] = value;
    setRoomAssignments(updatedAssignments);
  };

  const addRoomAssignment = () => {
    setRoomAssignments([...roomAssignments, { roomNo: "", quantity: "" }]);
  };

  // const assignRooms = async () => {
  //   if (!selectedBatch) return;

  //   try {
  //     const res = await axios.put("http://localhost:5000/api/items/assignRooms", {
  //       batchDetails: selectedBatch._id,
  //       roomAssignments: roomAssignments.map(r => ({
  //         roomNo: r.roomNo,
  //         quantity: parseInt(r.quantity, 10)
  //       }))
  //     });

  //     alert(res.data.message);
  //     fetchGroupedStocks();
  //     setSelectedBatch(null);
  //   } catch (err) {
  //     console.error("Error updating room", err);
  //     alert("Failed to assign rooms.");
  //   }
  // };
  const assignRooms = async () => {
    if (!selectedBatch || roomAssignments.length === 0) {
      alert("Please select a batch and enter at least one room assignment.");
      return;
    }
  
    try {
      const res = await axios.put("http://localhost:5000/api/items/assignRooms", {
        batchDetails: {
          specification: selectedBatch._id.specification,
          vendorName: selectedBatch._id.vendorName,
          batchNo: selectedBatch._id.batchNo,
          dateOfPurchase: selectedBatch._id.dateOfPurchase, // Ensure this field exists
          department: department
        },
        roomAssignments: roomAssignments.map(r => ({
          roomNo: r.roomNo,
          quantity: parseInt(r.quantity, 10)
        }))
      });
  
      alert(res.data.message);
      fetchGroupedStocks();
      setSelectedBatch(null);
    } catch (err) {
      console.error("Error updating room", err);
      alert(err.response?.data?.error || "Failed to assign rooms.");
    }
  };
  
  return (
    <div>
      <h1>{department} Department In-Charge</h1>

      {/* Table to Display Grouped Stock */}
      <table>
        <thead>
          <tr>
            <th>Specification</th>
            <th>Vendor</th>
            <th>Batch No</th>
            <th>Quantity</th>
            <th>Assign Room</th>
          </tr>
        </thead>
        <tbody>
          {groupedStocks.length === 0 ? (
            <tr><td colSpan="5">No stocks available</td></tr>
          ) : (
            groupedStocks.map((batch, index) => (
              <tr key={index}>
                <td>{batch._id.specification}</td>
                <td>{batch._id.vendorName}</td>
                <td>{batch._id.batchNo}</td>
                <td>{batch.totalQuantity}</td>
                <td><button onClick={() => openRoomAssignment(batch)}>Assign Room</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Room Assignment Modal */}
      {selectedBatch && (
        <div className="modal">
          <h3>Assign Rooms for {selectedBatch._id.specification}</h3>
          {roomAssignments.map((room, index) => (
            <div key={index}>
              <input type="text" placeholder="Room No" value={room.roomNo} onChange={(e) => handleRoomChange(index, "roomNo", e.target.value)} />
              <input type="number" placeholder="Quantity" value={room.quantity} onChange={(e) => handleRoomChange(index, "quantity", e.target.value)} />
            </div>
          ))}
          <button onClick={addRoomAssignment}>+ Add Room</button>
          <button onClick={assignRooms}>Confirm</button>
        </div>
      )}
    </div>
  );
}


export default DepartmentInCharge;






