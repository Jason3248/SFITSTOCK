const { body } = require('express-validator');

// Validation rules for creating a stock
const createStockValidationRules = [
  body('nameOfEquipment').notEmpty().withMessage('Name of equipment is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('batchNo').notEmpty().withMessage('Batch number is required'),
  body('dateOfPurchase').notEmpty().withMessage('Date of purchase is required'),
  body('remarks').notEmpty().withMessage('Remarks are required'),
];

// Add validation rules for updating a stock if needed

module.exports = {
  createStockValidationRules,
  // Other validation rules for updateStock if needed
};
