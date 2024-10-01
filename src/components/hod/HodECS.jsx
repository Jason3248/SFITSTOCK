import React, { useState, useEffect } from "react";
import axios from "axios";

function HodECS() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [filters, setFilters] = useState({
    assetHeads: "",
    specification: "",
    vendorName: "",
    quantity: 0,
    batchNo: "",
    totalAmount: 0,
    roomNo: "",
    dateOfPurchase: "",
    purpose: "",
    financialYear: "",
    bills: "",
    allocatedDept: "",
    hodApprovalStatus: "pending",
    principalApprovalStatus: "pending",
    directorApprovalStatus: "pending",
    rejectionReason: '',
    rejectedBy: ''  });

  const [rejectionReason, setRejectionReason] = useState('');

  const fetchStocks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items/approve/ecs");
      setStocks(res.data);
      setFilteredStocks(res.data); // Initialize filteredStocks with all data
    } catch (err) {
      console.error("Error fetching items", err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleApproval = async (id, status) => {
    let reason = '';
    if(status === 'rejected'){
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  useEffect(() => {
    const filtered = stocks.filter((stock) => {
      return (
        (filters.assetHeads === "" || stock.assetHeads.includes(filters.assetHeads)) &&
        (filters.specification === "" || stock.specification.includes(filters.specification)) &&
        (filters.vendorName === "" || stock.vendorName.includes(filters.vendorName)) &&
        (filters.batchNo === "" || stock.batchNo.includes(filters.batchNo)) &&
        (filters.roomNo === "" || stock.roomNo.includes(filters.roomNo)) &&
        (filters.dateOfPurchase === "" || stock.dateOfPurchase.includes(filters.dateOfPurchase)) &&
        (filters.allocatedDept === "" || stock.allocatedDept.includes(filters.allocatedDept)) &&
        (filters.hodApprovalStatus === "" || stock.hodApprovalStatus === filters.hodApprovalStatus) &&
        (filters.principalApprovalStatus === "" || stock.principalApprovalStatus === filters.principalApprovalStatus)
      );
    });
    setFilteredStocks(filtered);
  }, [filters, stocks]);

  return (
    <div className="App">
      <h1>Stock Approval</h1>

      <div>
        <h2>Filter Options</h2>
        <form>
          <input
            type="text"
            name="assetHeads"
            placeholder="Equipment Type"
            value={filters.assetHeads}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="specification"
            placeholder="Stock Type"
            value={filters.specification}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="vendorName"
            placeholder="Vendor Name"
            value={filters.vendorName}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="batchNo"
            placeholder="Batch No"
            value={filters.batchNo}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="roomNo"
            placeholder="Room No"
            value={filters.roomNo}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="dateOfPurchase"
            value={filters.dateOfPurchase}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="allocatedDept"
            value={filters.allocatedDept}
            onChange={handleFilterChange}
          />
          
        

          <select
            name="hodApprovalStatus"
            value={filters.hodApprovalStatus}
            onChange={handleFilterChange}
          >
            <option value="">Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </form>
      </div>

      <h2>Stock List</h2>
      <table>
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
              <td>{stock.hodApprovalStatus}</td>
              <td>
                {stock.hodApprovalStatus === "pending" && (
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
                {stock.hodApprovalStatus !== "pending" && (
                  <span>{stock.hodApprovalStatus.toUpperCase()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HodECS;
