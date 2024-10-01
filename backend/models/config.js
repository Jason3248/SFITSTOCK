// models/Config.js
const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  assetHeads: { type: [String], default: [] },
  allocatedDept: { type: [String], default: [] }
});

module.exports = mongoose.model('Config', ConfigSchema);
