const { body } = require('express-validator');

// Validation rules for creating an allocation
const createAllocationValidationRules = [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('department').notEmpty().withMessage('Department is required'),
    body('dateOfIssue').notEmpty().withMessage('Date of issue is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),

];

module.exports = {
    createAllocationValidationRules,
    // Other validation rules for updateAllocation if needed
};
