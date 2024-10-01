// routes/protectedRoute.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/protected-data', auth, (req, res) => {
  res.json({ message: 'This is protected data', userId: req.user._id});
});

module.exports = router;
