const mongoose = require("mongoose");

const departmentalStockSchema = new mongoose.Schema({
  _id: String,
  assetHeads: String,
  specification: String,
  vendorName: String,
  quantity: Number,
  dateOfPurchase: String,
  financialYear: String,
  batchNo: String,
  totalAmount: Number,
  individualAmount: Number, 
  bills: String,
  purpose: String,
  allocatedDept: String,  
  roomNo: String, 
  status: { type: String, default: "Pending" } 
});

module.exports = mongoose.model("deptStock", departmentalStockSchema);
