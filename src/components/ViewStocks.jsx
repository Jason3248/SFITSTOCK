import React, { useState, useEffect } from "react";
import axios from "axios";

// DrillDownStockDetails Component
const DrillDownStockDetails = ({ stocks }) => {
  // Error handling: Check if stocks exists and is an array
  if (!Array.isArray(stocks)) {
    return <div>No stock details available</div>;
  }

  return (
    <table className="drilldown-details-table">
      <thead>
        <tr>
          <th>Specification</th>
          <th>Quantity</th>
          <th>Total Amount</th>
          <th>Date of Purchase</th>
          <th>Bills</th>
          <th>Allocated Departments</th>
          <th>Stock Type</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock, idx) => (
          <tr key={idx}>
            <td>{stock.specification || "N/A"}</td>
            <td>{stock.quantity || "N/A"}</td>
            <td>{stock.totalAmount || "N/A"}</td>
            <td>{new Date(stock.dateOfPurchase).toLocaleDateString() || "N/A"}</td>
            <td>
              {stock.bills ? (
                <a href={stock.bills} target="_blank" rel="noopener noreferrer">
                  View Bill
                </a>
              ) : (
                "N/A"
              )}
            </td>
            <td>
              {stock.allocatedDept && stock.allocatedDept.length > 0
                ? stock.allocatedDept
                    .map(
                      (dept) =>
                        `${dept.department.join(", ")}: ${dept.allocatedQuantity}`
                    )
                    .join(", ")
                : "N/A"}
            </td>
            <td>{stock.stockType || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// DrillDownTable Component
const DrillDownTable = ({ breakdown }) => {
  const [expandedMonths, setExpandedMonths] = useState([]);

  // Toggle the drill-down view for individual stocks for a specific month
  const toggleMonthDrillDown = (index) => {
    setExpandedMonths((prev) =>
      prev.includes(index)
        ? prev.filter((idx) => idx !== index)
        : [...prev, index]
    );
  };

  return (
    <table className="drilldown-table">
      <thead>
        <tr>
          <th>Month and Year</th>
          <th>Quantity</th>
          <th>Total Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {breakdown.map((monthData, idx) => (
          <React.Fragment key={idx}>
            <tr>
              <td>{monthData.monthYear}</td>
              <td>{monthData.totalQuantity}</td>
              <td>{monthData.totalAmount}</td>
              <td>
                <button onClick={() => toggleMonthDrillDown(idx)}>
                  {expandedMonths.includes(idx) ? "^" : "V"}
                </button>
              </td>
            </tr>
            {/* Show individual stock details if expanded */}
            {expandedMonths.includes(idx) && (
              <tr>
                <td colSpan="4">
                  {/* DrillDownStockDetails Component to show individual stocks */}
                  <DrillDownStockDetails stocks={monthData.stocks} />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

function ViewStocks() {
  const [approvedStocks, setApprovedStocks] = useState([]);

  // Fetch approved stocks with aggregated data from the backend
  const fetchApprovedStocks = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/items/groupApprovedStocks"
      );
      setApprovedStocks(data); // Assuming 'data' includes individual stocks for each month
    } catch (err) {
      console.error("Error fetching approved stocks", err);
    }
  };

  // Toggle the drill-down view for each stock item
  const toggleApprovedDrillDown = (index) => {
    setApprovedStocks((prevStocks) =>
      prevStocks.map((stock, i) =>
        i === index ? { ...stock, drillDown: !stock.drillDown } : stock
      )
    );
  };

  useEffect(() => {
    fetchApprovedStocks();
  }, []);

  return (
    <div>
      <h1>Approved Stock List</h1>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Asset Head</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvedStocks.map((group, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>{group._id}</td>
                <td>{group.totalQuantity}</td>
                <td>{group.totalAmount}</td>
                <td>
                  <button onClick={() => toggleApprovedDrillDown(index)}>
                    {group.drillDown ? "^" : "V"}
                  </button>
                </td>
              </tr>
              {/* Show drill-down details if drillDown is true */}
              {group.drillDown && (
                <tr>
                  <td colSpan="4">
                    {/* DrillDownTable Component to show monthly breakdown */}
                    <DrillDownTable breakdown={group.monthlyBreakdown} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewStocks;
