const jwt = require('jsonwebtoken');
const AuthModel = require('../models/Auth');

// Main authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Invalid token format.'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = AuthModel.verifyToken(token);
    
    // Get user from database to ensure user still exists
    const user = await AuthModel.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. User not found.'
      });
    }
    
    // Add user info to request object
    req.user = decoded;
    req.userProfile = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid token.'
    });
  }
};

// Optional authentication middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = AuthModel.verifyToken(token);
        const user = await AuthModel.getUserById(decoded.userId);
        
        if (user) {
          req.user = decoded;
          req.userProfile = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  try {
    // First run the regular auth middleware
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Check if user is admin (you can add is_admin column to users table)
    if (!req.userProfile.is_admin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid token.'
    });
  }
};

// No authentication middleware (for compatibility)
const noAuth = (req, res, next) => {
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  noAuth
};
