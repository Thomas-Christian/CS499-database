const AuditLog = require('../models/AuditLog');
const { getAuditLogs, createAuditLog } = require('../utils/auditLogger');

// @desc    Get audit logs with filtering and pagination
// @route   GET /api/audit
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const result = await getAuditLogs(req.query);
    
    // Log this access to audit logs
    await createAuditLog({
      action: 'AUDIT_LOG_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'AuditLog',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { filters: req.query }
    });
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit log by ID
// @route   GET /api/audit/:id
// @access  Private/Admin
exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    // Log this access
    await createAuditLog({
      action: 'AUDIT_LOG_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'AuditLog',
      targetId: auditLog._id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user activity
// @route   GET /api/audit/user/:userId
// @access  Private/Admin
exports.getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    
    // Count total logs for this user
    const total = await AuditLog.countDocuments({ user: req.params.userId });
    
    // Get logs with pagination
    const logs = await AuditLog.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Log this access
    await createAuditLog({
      action: 'USER_ACTIVITY_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'User',
      targetId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { 
        pagination: { page, limit } 
      }
    });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit statistics
// @route   GET /api/audit/stats
// @access  Private/Admin
exports.getAuditStats = async (req, res) => {
  try {
    // Advanced aggregation pipeline for audit statistics
    const stats = await AuditLog.aggregate([
      {
        $facet: {
          // Actions by type
          'actionTypes': [
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Activity by time
          'timeActivity': [
            {
              $group: {
                _id: { 
                  $dateToString: { 
                    format: '%Y-%m-%d', 
                    date: '$timestamp' 
                  } 
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }  // Last 30 days
          ],
          // Top active users
          'activeUsers': [
            { 
              $match: { 
                user: { $ne: null } 
              } 
            },
            { 
              $group: { 
                _id: '$user', 
                count: { $sum: 1 } 
              } 
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
              }
            },
            {
              $project: {
                _id: 1,
                count: 1,
                user: { $arrayElemAt: ['$userDetails', 0] }
              }
            },
            {
              $project: {
                _id: 1,
                count: 1,
                'user.name': 1,
                'user.email': 1,
                'user.role': 1
              }
            }
          ],
          // Most accessed models
          'accessedModels': [
            { $group: { _id: '$targetModel', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);
    
    // Log this access
    await createAuditLog({
      action: 'AUDIT_STATS_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'AuditLog',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get activity for a specific animal
// @route   GET /api/audit/animal/:animalId
// @access  Private/Admin or Staff
exports.getAnimalActivity = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      targetModel: 'Animal',
      targetId: req.params.animalId
    })
    .populate('user', 'name email role')
    .sort({ timestamp: -1 });
    
    // Log this access
    await createAuditLog({
      action: 'ANIMAL_ACTIVITY_VIEW',
      actionType: 'READ',
      user: req.user.id,
      targetModel: 'Animal',
      targetId: req.params.animalId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};