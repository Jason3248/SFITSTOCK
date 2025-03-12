import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Collapse, Typography, Box
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const DrillDownStockDetails = ({ stocks }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "#1976D2" }}>
          <TableRow>
            {["Specification", "Quantity", "Amount", "Date", "Bills", "Departments", "Type"].map((head) => (
              <TableCell key={head} sx={{ color: "white", fontWeight: "bold" }}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock, idx) => (
            <TableRow key={idx} hover>
              <TableCell>{stock.specification || "N/A"}</TableCell>
              <TableCell>{stock.quantity || "N/A"}</TableCell>
              <TableCell>₹{stock.totalAmount?.toFixed(2) || "N/A"}</TableCell>
              <TableCell>{new Date(stock.dateOfPurchase).toLocaleDateString() || "N/A"}</TableCell>
              <TableCell>
                {stock.bills ? (
                  <a href={stock.bills} target="_blank" rel="noopener noreferrer" style={{ color: "#1976D2", fontWeight: "bold" }}>
                    View Bill
                  </a>
                ) : "N/A"}
              </TableCell>
              <TableCell>{Array.isArray(stock.allocatedDept) ? stock.allocatedDept.join(", ") : stock.allocatedDept || "N/A"}</TableCell>
              <TableCell>{stock.stockType || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DrillDownTable = ({ breakdown }) => {
  const [expandedMonths, setExpandedMonths] = useState([]);

  const toggleMonthDrillDown = (index) => {
    setExpandedMonths((prev) =>
      prev.includes(index) ? prev.filter((idx) => idx !== index) : [...prev, index]
    );
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "#1565C0" }}>
          <TableRow>
            {["Month & Year", "Quantity", "Total Amount", "Details"].map((head) => (
              <TableCell key={head} sx={{ color: "white", fontWeight: "bold" }}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {breakdown.map((monthData, idx) => (
            <React.Fragment key={idx}>
              <TableRow hover>
                <TableCell>{monthData.monthYear}</TableCell>
                <TableCell>{monthData.totalQuantity}</TableCell>
                <TableCell>₹{monthData.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => toggleMonthDrillDown(idx)}>
                    {expandedMonths.includes(idx) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <Collapse in={expandedMonths.includes(idx)} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2 }}>
                      <DrillDownStockDetails stocks={monthData.stocks} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function ViewStocks() {
  const [approvedStocks, setApprovedStocks] = useState([]);

  const fetchStocks = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/items/groupStocks");
      setApprovedStocks(data);
    } catch (err) {
      console.error("Error fetching stocks", err);
    }
  };

  const toggleApprovedDrillDown = (index) => {
    setApprovedStocks((prevStocks) =>
      prevStocks.map((stock, i) => (i === index ? { ...stock, drillDown: !stock.drillDown } : stock))
    );
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1976D2" }}>
        Approved Stock List
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0D47A1" }}>
            <TableRow>
              {["Asset Head", "Quantity", "Total Amount", "Actions"].map((head) => (
                <TableCell key={head} sx={{ color: "white", fontWeight: "bold" }}>{head}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedStocks.map((group, index) => (
              <React.Fragment key={index}>
                <TableRow hover>
                  <TableCell>{group.assetHeads}</TableCell>
                  <TableCell>{group.totalQuantity}</TableCell>
                  <TableCell>₹{group.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => toggleApprovedDrillDown(index)}>
                      {group.drillDown ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Collapse in={group.drillDown} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        <DrillDownTable breakdown={group.monthlyBreakdown} />
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ViewStocks;
