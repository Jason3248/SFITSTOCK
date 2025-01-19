const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Stock = require('../models/stock'); 
const Config = require('../models/config');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const JWT_SECRET = process.env.JWT_SECRET;
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

router.post('/createuser', [
  body('name', 'Enter a valid Name').isLength({ min: 3 }),
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Password must be at least 8 characters').isLength({ min: 8 })
], async (req, res) => {
  console.log(req.body);
  
  console.log("New HOD Dept:", req.body.allocatedDept);
  console.log("New HOD Name:", req.body.name);
  console.log("New HOD email", req.body.email);
  console.log("Password", req.body.password);
  
  
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
          return res.status(400).json({ error: "A user with this Email already exists! Please try another Email or change password." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user (Assign `userLevel: 2` if it's HOD)
      user = await User.create({
          name: req.body.name,
          password: hashedPassword,
          email: req.body.email,
          
          userLevel: req.body.userType === 'HOD' ? 2 : req.body.userLevel,
          userType: req.body.userType,
          department: req.body.allocatedDept,
          labNo: req.body.labNo,
      });

      const data = {
          user: {
              id: user._id,
              email: user.email,
          }
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
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
