const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User  = require('../models').User; 
dotenv.config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.body.token || req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token Missing' });
    }

    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token is invalid' });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Something Went Wrong While Validating the Token',
    });
  }

};

exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ where: { email: req.user.email } });

    if (!userDetails || userDetails.accountType !== 'Student') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Students',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'User Role Can\'t be Verified' });
  }
 
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ where: { email: req.user.email } });

    if (!userDetails || userDetails.accountType !== 'Admin') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Admin',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'User Role Can\'t be Verified' });
  }
};

exports.isSuperAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ where: { email: req.user.email } });

    if (!userDetails || userDetails.accountType !== 'Super Admin') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Super Admin',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'User Role Can\'t be Verified' });
  }
};

