import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verifies JWT token and sets req.user

export const protect = async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie (if using cookies)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized - no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user and attach to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User belonging to this token no longer exists',
      });
    }
    
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    res.status(401).json({
      success: false,
      error: 'Not authorized - invalid token',
    });
  }
};

// Admin authorization (if still needed for some routes)
export const adminOnly = (req, res, next) => {
  // This assumes you might still want some admin-only routes
  // but without the role system, you might check another property
  // or remove this entirely if not needed
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
};