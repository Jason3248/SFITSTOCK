const express = require('express');
const router = express.Router();
const allocateController = require('../controllers/allocateController');
const { createAllocationValidationRules } = require('../validators/allocationValidators'); // Import validation rules

// Define routes
router.get('/', allocateController.getAllAllocations);
router.get('/:id', allocateController.getAllocationById);

// Use validation middleware for creating an allocation
router.post('/', createAllocationValidationRules, allocateController.createAllocation);

router.put('/:id', allocateController.updateAllocation);
router.delete('/:id', allocateController.deleteAllocation);

// POST route to update checkedByLab or checkedByHod
router.post('/updateAllocation', allocateController.updateAllocation);

module.exports = router;
