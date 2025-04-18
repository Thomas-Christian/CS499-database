const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogById,
  getUserActivity,
  getAuditStats,
  getAnimalActivity
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Routes accessible by admin only
router.get('/', authorize('admin'), getAuditLogs);
router.get('/stats', authorize('admin'), getAuditStats);
router.get('/user/:userId', authorize('admin'), getUserActivity);
router.get('/:id', authorize('admin'), getAuditLogById);

// Routes accessible by admin and staff
router.get('/animal/:animalId', authorize('admin', 'staff'), getAnimalActivity);

module.exports = router;