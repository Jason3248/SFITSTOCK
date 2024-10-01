const mongoose = require('mongoose');

const approvedStockSchema = new mongoose.Schema({
  _id: String,
  assetHeads: {
    type: [String],
    default: ['Books', 'Sports/Games Items', 'Printers', 'AirConditioners', 'Equipment', 'Furnitures and Fixtures', 'Lab Equipments', 'Computers and Accessories']
    // required: true,
  },
  specification: {
    type: String,
    // required: true,
  },
  dateOfPurchase: {
    type: String,
    required: true,
  },
  financialYear: {
    type: String, 
    required: true
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
    required: true
  },
  allocatedDept: {
    type: [String],
    default: ['CMPN','INFT','EXTC','MECH','ELEC', 'AIML', 'ECS'],
    required: true
  },
  hodApprovalStatus: { type: String, default: 'pending' },
  principalApprovalStatus: { type: String, default: 'pending'},
  directorApprovalStatus: { type: String, default: 'pending'}
});

module.exports = mongoose.model('approvedStock', approvedStockSchema);