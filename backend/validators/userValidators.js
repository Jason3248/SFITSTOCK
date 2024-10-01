const { body } = require('express-validator');

// Validation rules for creating a user
const createUserValidationRules = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('pid').notEmpty().withMessage('PID is required'),
];

// Add validation rules for updating a user if needed

module.exports = {
    createUserValidationRules,
    // Other validation rules for updateUser if needed
};
