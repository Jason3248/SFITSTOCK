import React, { useState, useEffect } from "react";
import axios from "axios";

// DrillDownTable Component
const DrillDownTable = ({ breakdown }) => {
  return (
    <table className="drilldown-table">
      <thead>
        <tr>
          <th>Month and Year</th>
          <th>Quantity</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        {breakdown.map((monthData, idx) => (
          <tr key={idx}>
            <td>{monthData.monthYear}</td>
            <td>{monthData.totalQuantity}</td>
            <td>{monthData.totalAmount}</td>
          </tr>
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
      const { data } = await axios.get("http://localhost:5000/api/items/groupApprovedStocks");
      setApprovedStocks(data);  // Assuming 'data' is already structured properly
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
                {console.log(group._id)}
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