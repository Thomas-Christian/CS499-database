const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check header for authorization token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to req object
    req.user = await User.findById(decoded.id);

    // If user doesn't exist anymore
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    next();
  } catch (err) {
    // Create audit log for invalid token
    await createAuditLog({
      action: 'AUTH_FAILURE',
      actionType: 'READ',
      user: null,
      targetModel: 'Auth',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { error: 'Invalid token' }
    });

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Create audit log for authorization failure
      createAuditLog({
        action: 'AUTHORIZATION_FAILURE',
        actionType: 'READ',
        user: req.user.id,
        targetModel: req.originalUrl.split('/')[2] || 'Unknown',
        targetId: null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { 
          requiredRoles: roles.join(','), 
          userRole: req.user.role 
        }
      });

      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};