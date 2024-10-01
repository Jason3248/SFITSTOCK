const Allocate = require('../models/allocated');
const Stock = require('../models/stock');
const { validationResult } = require('express-validator');

// GET all allocations
exports.getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocate.find();
    res.json(allocations.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single allocation by ID
exports.getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocate.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json(allocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new allocation with updates to the corresponding stock document
exports.createAllocation = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract details from req.body
    const { quantity, purpose, stockId } = req.body;

    // Find the stock document based on stockId
    const stock = await Stock.findById(stockId);
    // console.log(stock)

    if (!stock) {
      return res.status(400).json({ message: 'Stock not found for the given stockId' });
    }

    // Check if the quantity requested is less than or equal to the available quantity
    if (quantity > stock.quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available quantity in stock' });
    }
    const complaints = req.body.complaints ? req.body.complaints : [];

    // Create the allocation document with details from req.body and stock document
    const allocation = new Allocate({
      quantity,
      purpose,
      nameOfEquipment: stock.nameOfEquipment,
      equipmentType: stock.equipmentType, // Take equipmentType from the stock document
      stockType: stock.stockType, // Match stockType from the stock document
      batchNo: stock.batchNo, // Take batchNo from the stock document
      department: req.body.department, // Include department from req.body
      dateOfIssue: req.body.dateOfIssue, // Include dateOfIssue from req.body
      remarks: req.body.remarks, // Include remarks from req.body
      complaints: complaints, // Initialize complaints as an empty array
      // Add other fields as needed
    });

    // Update the corresponding stock document
    stock.allocatedDept.push(allocation._id);

    // Save the updated stock document
    await stock.save();

    // Save the allocation document
    await allocation.save();

    res.status(201).json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT (update) an allocation by ID
exports.updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocate.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated allocation
      runValidators: true, // Run schema validation on update
    });
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE an allocation by ID
exports.deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocate.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ message: 'Allocation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAllocation = async (req, res) => {
  const { objectId, checkedByLab, checkedByHod } = req.body;

  try {
    const allocatedDoc = await Allocate.findById(objectId);
    // console.log(allocatedDoc)

    if (!allocatedDoc) {
      return res.status(404).json({ message: 'Allocation document not found' });
    }

    // Update checkedByLab if provided
    if (checkedByLab !== undefined) {
      allocatedDoc.checkedbyLab = checkedByLab;
    }

    // Update checkedByHod if provided
    if (checkedByHod !== undefined) {
      allocatedDoc.checkedbyHod = checkedByHod;
    }

    // Save the updated allocation document
    await allocatedDoc.save();

    // Check if both checkedByLab and checkedByHod are true
    if (allocatedDoc.checkedbyLab === true && allocatedDoc.checkedbyHod === true) {
      // Find the stock document where allocatedDept array contains the objectId
      const stockDoc = await Stock.findOne({ allocatedDept: { $in: [objectId] } });
      // console.log(stockDoc)

      if (!stockDoc) {
        return res.status(404).json({ message: 'Stock document not found' });
      }

      // Subtract the quantity from the stock document
      stockDoc.quantity -= allocatedDoc.quantity;

      // Save the updated stock document
      await stockDoc.save();
    }

    res.json({ message: 'Allocation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
