const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { createStockValidationRules } = require('../validators/stockValidators'); // Import validation rules
const multer = require('../multerConfig');

// Define routes
router.get('/', stockController.getAllStocks);
router.get('/:id', stockController.getStockById);

// Use validation middleware for creating a stock
router.post('/', multer.single('bills'), stockController.createStock);

router.put('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);
router.get('/uploads/:filename', stockController.accessFile);

module.exports = router;
