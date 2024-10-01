const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;


// ROUTE 1: Create a User using: 
//POST route "/api/auth/createuser".
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),
    body('pid', 'Enter a valid pid').isLength({ min: 5 }),
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
            pid: req.body.pid,
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

/*
// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be Empty').exists(),
], async (req, res) => {


    console.log(req.body);
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {

        let user = await User.findOne({ email });

        if (!user) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        // const passwordCompare = await bcrypt.compare(password, user.password);
        // if (!passwordCompare) {
        //     success = false
        //     return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        // }

        const data = {
            user: {
                id: user._id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ user, success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});
*/

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
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
/*
//Todays route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check if the password is correct
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Create a JWT token
      const token = jwt.sign(
        { userId: user._id, userLevel: user.userLevel },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      // Return the token and userLevel
      res.json({
        token,
        userLevel: user.userLevel,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
*/
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
  
  
  module.exports = router;


