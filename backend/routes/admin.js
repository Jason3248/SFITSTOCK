const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Stock = require('../models/stock'); 
const Config = require('../models/config');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});
/*
router.get('/assetHeads', async (req, res) => {
  try {
    const assetHeads = await Stock.find().distinct('assetHeads');
    res.json(assetHeads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch all allocated departments
router.get('/allocatedDepartments', async (req, res) => {
  try {
    const allocatedDepartments = await Stock.find().distinct('allocatedDept');
    res.json(allocatedDepartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new asset head
router.post('/assetHeads', async (req, res) => {
  const { name } = req.body;
  try {
    // Update all documents to include the new asset head
    await Stock.updateMany({}, { $addToSet: { assetHeads: name } });
    res.status(201).json({ message: 'Asset head added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new allocated department
router.post('/allocatedDepartments', async (req, res) => {
  const { name } = req.body;
  try {
    // Update all documents to include the new allocated department
    await Stock.updateMany({}, { $addToSet: { allocatedDept: name } });
    res.status(201).json({ message: 'Allocated department added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an asset head
router.delete('/assetHeads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Stock.updateMany({}, { $pull: { assetHeads: id } });
    res.json({ message: 'Asset head deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an allocated department
router.delete('/allocatedDepartments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Stock.updateMany({}, { $pull: { allocatedDept: id } });
    res.json({ message: 'Allocated department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/
// Add this to your admin routes file
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Create a new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

router.get('/config', async (req, res) => {
  try {
    let config = await Config.findOne();

    // If no config exists, create one
    if (!config) {
      config = new Config();
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ message: 'Error fetching config' });
  }
});

// Update assetHeads and allocatedDept
router.put('/update-config', async (req, res) => {
  const { assetHeads, allocatedDept } = req.body;

  try {
    let config = await Config.findOne();

    // If no config exists, create one
    if (!config) {
      config = new Config();
    }

    if (assetHeads) {
      config.assetHeads = assetHeads;
    }

    if (allocatedDept) {
      config.allocatedDept = allocatedDept;
    }

    await config.save();
    res.json({ message: 'Config updated successfully' });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Error updating config' });
  }
});


module.exports = router;
