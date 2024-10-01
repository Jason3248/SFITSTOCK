const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Not authorized as admin' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized as admin' });
  }
};

module.exports = adminAuth;
