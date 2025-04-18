const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      // User actions
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_VIEW',
      
      // Authentication actions
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'AUTH_FAILURE',
      'AUTHORIZATION_FAILURE',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_COMPLETE',
      
      // Animal actions (authenticated)
      'ANIMAL_CREATE',
      'ANIMAL_UPDATE',
      'ANIMAL_DELETE',
      'ANIMAL_VIEW',
      'ANIMAL_FILTER_SEARCH',
      'ANIMAL_STATS_VIEW',
      'ANIMAL_GEOSPATIAL_SEARCH',
      
      // Public animal actions
      'PUBLIC_ANIMAL_VIEW',
      'PUBLIC_ANIMAL_DETAIL_VIEW',
      'PUBLIC_ANIMAL_FILTER_VIEW',
      'PUBLIC_ANIMAL_STATS_VIEW',
      
      // Admin actions
      'AUDIT_LOG_VIEW',
      'AUDIT_STATS_VIEW',
      'USER_ACTIVITY_VIEW',
      'ANIMAL_ACTIVITY_VIEW',
      
      // System actions
      'RATE_LIMIT_EXCEEDED',
      'SYSTEM_ERROR'
    ]
  },
  actionType: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'INSERT']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  targetModel: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for performance optimization
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);