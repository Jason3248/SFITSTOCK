const mongoose = require("mongoose");

const departmentalStockSchema = new mongoose.Schema({
  _id: String,  // Unique ID format
  assetHeads: String,
  specification: String,
  vendorName: String,
  quantity: Number,
  dateOfPurchase: String,
  financialYear: String,
  batchNo: String,
  totalAmount: Number,
  bills: String,
  purpose: String,
  allocatedDept: String,  // Assigned department
  roomNo: String, // Initially empty, will be updated by Dept In-Charge
  status: { type: String, default: "Pending" } // Status of stock allocation
});

module.exports = mongoose.model("deptStock", departmentalStockSchema);
