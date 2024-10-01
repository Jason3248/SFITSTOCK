const mongoose = require("mongoose");
const { Schema } = mongoose;

const AllocatedSchema = new Schema({
  equipmentType: {
    type: String,
    // required: true,
  },
  stockType: {
    type: String,
    // required: true,
  },
  nameOfEquipment: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  batchNo: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  
  dateOfIssue: {
    type: String,
    required: true,
  },
  purpose:{
    type: String,
    required: true,
  },
  checkedbyHod:{
    type: Boolean,
    default : false
  },
  checkedbyLab:{
    type: Boolean,
    default : false
  },
  remarks:{
    type: String,
    required: true,
  },
  isDisposed:{
    type : Boolean,
    default : false
  },
  complaints:[{
    type: String
  }]
});
const allocate = mongoose.model("allocate", AllocatedSchema);

module.exports = allocate;
