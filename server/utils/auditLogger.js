const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} logData - The log data
 * @param {String} logData.action - The action that was performed
 * @param {String} logData.actionType - The type of action (CREATE, READ, UPDATE, DELETE)
 * @param {ObjectId} logData.user - User ID who performed the action
 * @param {String} logData.targetModel - The model that was affected
 * @param {ObjectId} logData.targetId - ID of the document that was affected
 * @param {String} logData.ip - IP address from which action was performed
 * @param {String} logData.userAgent - User agent from which action was performed
 * @param {Object} logData.details - Additional details about the action
 * @returns {Promise<AuditLog>} The created audit log
 */
exports.createAuditLog = async (logData) => {
  try {
    const auditLog = await AuditLog.create({
      action: logData.action,
      actionType: logData.actionType,
      user: logData.user,
      targetModel: logData.targetModel,
      targetId: logData.targetId,
      ip: logData.ip,
      userAgent: logData.userAgent,
      details: logData.details || {}
    });

    return auditLog;
  } catch (error) {
    // If audit logging fails, log to console but don't block the app
    console.error('Audit logging error:', error);
    
    // Try to create a system error log
    try {
      await AuditLog.create({
        action: 'SYSTEM_ERROR',
        actionType: 'CREATE',
        targetModel: 'AuditLog',
        details: { error: error.message, stack: error.stack }
      });
    } catch (innerError) {
      console.error('Critical error in audit logging system:', innerError);
    }
  }
};

/**
 * Middleware to log route access
 */
exports.logRouteAccess = (req, res, next) => {
  // Only log GET requests to animals
  if (req.method === 'GET' && req.originalUrl.includes('/api/animals')) {
    const actionDetails = {};
    
    // Capture query parameters for search
    if (Object.keys(req.query).length > 0) {
      actionDetails.query = req.query;
    }
    
    // Capture filter parameters
    if (req.params.filterType) {
      actionDetails.filterType = req.params.filterType;
    }
    
    // Log the access
    exports.createAuditLog({
      action: req.params.filterType ? 'ANIMAL_FILTER_SEARCH' : 'ANIMAL_VIEW',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
      targetModel: 'Animal',
      targetId: req.params.id || null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: actionDetails
    });
  }
  
  next();
};

/**
 * Get audit logs with filtering and pagination
 * @param {Object} queryParams - Query parameters for filtering
 * @returns {Promise<Object>} Audit logs with pagination metadata
 */
exports.getAuditLogs = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  
  // Build query
  let query = {};
  
  // Filter by action
  if (queryParams.action) {
    query.action = queryParams.action;
  }
  
  // Filter by user
  if (queryParams.user) {
    query.user = queryParams.user;
  }
  
  // Filter by target model
  if (queryParams.targetModel) {
    query.targetModel = queryParams.targetModel;
  }
  
  // Filter by target ID
  if (queryParams.targetId) {
    query.targetId = queryParams.targetId;
  }
  
  // Filter by date range
  if (queryParams.startDate && queryParams.endDate) {
    query.timestamp = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate)
    };
  } else if (queryParams.startDate) {
    query.timestamp = { $gte: new Date(queryParams.startDate) };
  } else if (queryParams.endDate) {
    query.timestamp = { $lte: new Date(queryParams.endDate) };
  }
  
  // Execute query with pagination
  const total = await AuditLog.countDocuments(query);
  
  const logs = await AuditLog.find(query)
    .populate('user', 'name email')
    .sort({ timestamp: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Return results with pagination metadata
  return {
    success: true,
    count: logs.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: logs
  };
};