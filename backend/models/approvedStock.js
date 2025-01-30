// const mongoose = require('mongoose');

// const approvedStockSchema = new mongoose.Schema({
//   _id: String,
//   stockType: {
//     type: String,
//     enum: ['Departmental', 'Institutional'],
//     required: true
//   },
//   assetHeads: {
//     type: [String],
//     default: [
//       'Books', 'Sports/Games Items', 'Printers', 'AirConditioners',
//       'Equipment', 'Furnitures and Fixtures', 'Lab Equipments', 'Computers and Accessories'
//     ]
//   },
//   specification: { type: String, required: true },
//   dateOfPurchase: { type: String, required: true },
//   financialYear: { type: String, required: true },
//   batchNo: { type: String, required: true },
//   vendorName: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   totalAmount: { type: Number, required: true },
//   roomNo: { type: String },
//   purpose: { type: String },
//   bills: { type: String, required: true },
//   allocatedDept: [{
//     department: String,
//     allocatedQuantity: Number
//   }]
// });

// const approvedStock = mongoose.model('approvedStock', approvedStockSchema);
// module.exports = approvedStock;
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

