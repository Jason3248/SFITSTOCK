
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  // _id: { type: String, required: true}, 
  
  assetHeads: { type: [String], required: true },
  specification: { type: String, required: true },
  vendorName: { type: String },
  quantity: { type: Number, required: true },
  batchNo: { type: String },
  totalAmount: { type: Number },
  roomNo: { type: String },
  dateOfPurchase: { type: String },
  purpose: { type: String },
  financialYear: { type: String },
  bills: { type: String },
  allocatedDept: [
    {
      department: { type: [String], required: true },
      allocatedQuantity: { type: Number, required: true },
    },
  ],
  stockType: { type: String, enum: ['Institutional Stock', 'Departmental Stock'], required: true },
});

module.exports = mongoose.model('approvedStock', stockSchema);

