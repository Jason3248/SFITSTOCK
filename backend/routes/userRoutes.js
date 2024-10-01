const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidationRules } = require('../validators/userValidators'); // Import validation rules

// Define routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Use validation middleware for creating a user
router.post('/', createUserValidationRules, userController.createUser);

router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
