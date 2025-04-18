const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create user - role will default to volunteer unless specified by an admin
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'volunteer'
    });

    // Create audit log
    await createAuditLog({
      action: 'USER_CREATE',
      actionType: 'INSERT',
      user: null, // No authenticated user for registration
      targetModel: 'User',
      targetId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        name: user.name, 
        email: user.email, 
        role: user.role
      }
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user and include password field (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Create audit log for failed login
      await createAuditLog({
        action: 'LOGIN_FAILED',
        actionType: 'READ',
        user: null,
        targetModel: 'User',
        targetId: user._id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { email }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Create audit log for successful login
    await createAuditLog({
      action: 'LOGIN_SUCCESS',
      actionType: 'READ',
      user: user._id,
      targetModel: 'User',
      targetId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email }
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Create audit log for logout
    await createAuditLog({
      action: 'LOGOUT',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'User',
      targetId: req.user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create and send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};