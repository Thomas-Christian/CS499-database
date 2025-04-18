const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const total = await User.countDocuments(query);
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Create audit log for user list access
    await createAuditLog({
      action: 'USER_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'User',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        page, 
        limit, 
        filters: req.query 
      }
    });
    
    // Return results with pagination metadata
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create audit log for viewing user details
    await createAuditLog({
      action: 'USER_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
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

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
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
    
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    
    // Create audit log for user creation
    await createAuditLog({
      action: 'USER_CREATE',
      actionType: 'CREATE',
      user: req.user.id,
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
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Get user before update for audit log
    const originalUser = await User.findById(req.params.id);
    
    if (!originalUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.role) updateData.role = req.body.role;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Create audit log for user update
    await createAuditLog({
      action: 'USER_UPDATE',
      actionType: 'UPDATE',
      user: req.user.id,
      targetModel: 'User',
      targetId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        before: {
          name: originalUser.name,
          email: originalUser.email,
          role: originalUser.role
        },
        after: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create audit log before deletion
    await createAuditLog({
      action: 'USER_DELETE',
      actionType: 'DELETE',
      user: req.user.id,
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
    
    await user.deleteOne();
    
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