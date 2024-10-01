const mongoose = require("mongoose");
const { Schema } = mongoose;

const StockSchema = new Schema({
  _id: String,
  assetHeads: {
    type: [String],
    default: []
    // required: true,
  },
  specification: {
    type: String,
    // required: true,
  },
  dateOfPurchase: {
    type: String,
   // required: true,
  },
  financialYear: {
    type: String, 
    //required: true
  },
  batchNo: {
    type: String,
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  
  totalAmount: {
    type: Number,
    // required: true,
  },
  roomNo: {
    type: String,
    required: true
  },
 
  purpose: {
    type: String,
    // required: true,
  },
 
  bills: {
    type: String,
   // required: true
  },
  allocatedDept: {
    type: [String],
    default: [],
    required: true
  },
  hodApprovalStatus: { type: String, default: 'pending' },
  principalApprovalStatus: { type: String, default: 'pending'},
  directorApprovalStatus: { type: String, default: 'pending'},
  rejectionReason: { type: String, default: '' },
  rejectedBy: { type: String, default: ''}
});
 

module.exports = mongoose.model("stock", StockSchema);
