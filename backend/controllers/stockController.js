const { validationResult } = require('express-validator');
const Stock = require('../models/stock');
const path = require('path');


// GET all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single stock by ID
exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new stock with validation
exports.createStock = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    // The file is available in req.file
    const pdfPath = req.file.path;
    req.body.bills = "http://localhost:5000/api/stock/inward/" + pdfPath
    req.body.bills = req.body.bills.replaceAll('\\' , '/')
    // console.log(pdfPath)
    console.log(req.body.bills)
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) a stock by ID with validation
exports.updateStock = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated stock
      runValidators: true, // Run schema validation on update
    });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE a stock by ID
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.accessFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    // console.log(filename)
    // console.log(__dirname)
    const rootPath = path.dirname(__dirname);
    // console.log(rootPath)
    // Construct the file path to the uploaded file
    const filePath = path.join(rootPath, 'uploads', filename);
    // console.log(filePath)

    // Send the file to the client
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
