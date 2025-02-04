const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const authMiddleware = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET;


// ROUTE 1: Create a User using: 
//POST route "/api/auth/createuser".
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 })
], async (req, res) => {

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "A user with this Email already Exist! Please try another Email or try changing password " })
        }
        const salt = await bcrypt.genSalt(10);
        const hashnsalt = await bcrypt.hash(req.body.password, salt);
        mobilenumber = parseInt(req.body.mobileNo)
        // Create a new user
        user = await User.create({
            name: req.body.name,
            password: hashnsalt,
            email: req.body.email,
            // pid: req.body.pid,
            userLevel: req.body.userLevel,
            userType: req.body.userType,
            department: req.body.department,
            labNo: req.body.labNo,
            // avatar: req.file.avatar,

        });
        const data = {
            user: {
                id: user._id,
                email: user.email,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);


        // res.json(user)
        res.json({ authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send(" Internal Server Error!! ");
    }
})

router.post('/getuser', fetchuser, async (req, res) => {

    try {
       const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      console.log(user);
      
  
      if (!user) {
        console.log('Invalid email or password, !user');
        return res.status(400).json({ message: 'Invalid email or password' });
        
        
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid email or password, !isMatch');
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user._id, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log(token);
      
  
      res.json({
        token,
        userLevel: user.userLevel
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // router.put('/update-credentials', authMiddleware(), async (req, res) => {
  //   const { email, currentPassword, newPassword} = req.body;
  //   const userId = req.user._id;
  
  //   try {
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return res.status(404).json({ message: 'User not found' });
  //     }
  
  //     // Verify current password
  //     const isMatch = await bcrypt.compare(currentPassword, user.password);
  //     if (!isMatch) {
  //       return res.status(400).json({ message: 'Current password is incorrect' });
  //     }
  
  //     // Update email if provided and check for uniqueness
  //     if (email) {
  //       const emailExists = await User.findOne({ email });
  //       if (emailExists && emailExists._id.toString() !== userId) {
  //         return res.status(400).json({ message: 'Email already in use' });
  //       }
  //       user.email = email;
  //     }
  
  //     // Update pid if provided and check for uniqueness
  //     // if (pid) {
  //     //   const pidExists = await User.findOne({ pid });
  //     //   if (pidExists && pidExists._id.toString() !== userId) {
  //     //     return res.status(400).json({ message: 'PID already in use' });
  //     //   }
  //     //   user.pid = pid;
  //     // }
  
  //     // Update password if a new password is provided
  //     if (newPassword) {
  //       const salt = await bcrypt.genSalt(10);
  //       user.password = await bcrypt.hash(newPassword, salt);
  //     }
  
  //     await user.save();
  //     res.json({ message: 'Profile updated successfully' });
  //   } catch (error) {
  //     console.error('Error updating credentials:', error);
  //     res.status(500).json({ message: 'Server error' });
  //   }
  // });
  
  router.put('/update-credentials', authMiddleware(), async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
  
    console.log("Received Data:", { email, currentPassword, newPassword });
  
    try {
      const user = await User.findById(userId);
      console.log("user", user);
      
      if (!user) {
        console.log("User not there");
        
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (!currentPassword) {
        console.log("Password not there");
        
        return res.status(400).json({ message: 'Current password is required' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log("IsMatch", isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      // if (email) {
      //   const emailExists = await User.findOne({ email });
      //   if (emailExists && emailExists._id.toString() !== userId) {
      //     console.log("This exectues");
          
      //     return res.status(400).json({ message: 'Email already in use' });
      //   }
      //   user.email = email;
      //   console.log(user.email);
        
      // }
      if(email){
        user.email = email;
      }
      
  
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        console.log(user.password);
        
      }

  
      await user.save();
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating credentials:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  
  module.exports = router;


