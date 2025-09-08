const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const Tourist = require('../models/Tourist');
const Device = require('../models/Device');
const { authorizeAlertAccess, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, severity, touristId } = req.query;
    const query = { isActive: true };

    // Add filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (touristId) query.touristId = touristId;

    // For tourists, only show their own alerts
    if (req.user.role === 'tourist') {
      const tourist = await Tourist.findOne({ userId: req.user._id });
      if (tourist) {
        query.touristId = tourist._id;
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { current: 1, pages: 0, total: 0 }
        });
      }
    }

    const alerts = await Alert.find(query)
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .populate('deviceId', 'deviceId deviceType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// @route   GET /api/alerts/statistics
// @desc    Get alert statistics
// @access  Private
router.get('/statistics', async (req, res) => {
  try {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    const endDate = new Date();

    const stats = await Alert.getStatistics(startDate, endDate);

    const totalAlerts = await Alert.countDocuments({ isActive: true });
    const activeAlerts = await Alert.countDocuments({ status: 'active', isActive: true });
    const criticalAlerts = await Alert.countDocuments({ severity: 'critical', isActive: true });

    res.json({
      success: true,
      data: {
        total: totalAlerts,
        active: activeAlerts,
        critical: criticalAlerts,
        last24Hours: stats[0] || { total: 0, byType: [], bySeverity: [], byStatus: [] }
      }
    });
  } catch (error) {
    console.error('Get alert statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private
router.get('/:id', authorizeAlertAccess, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .populate('deviceId', 'deviceId deviceType')
      .populate('response.acknowledgedBy', 'name email')
      .populate('response.resolvedBy', 'name email')
      .populate('response.actions.performedBy', 'name email');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert'
    });
  }
});

// @route   PUT /api/alerts/:id/acknowledge
// @desc    Acknowledge alert
// @access  Private
router.put('/:id/acknowledge', [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notes } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user can acknowledge this alert
    if (req.user.role === 'tourist') {
      const tourist = await Tourist.findOne({ userId: req.user._id });
      if (!tourist || alert.touristId.toString() !== tourist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this alert'
        });
      }
    }

    await alert.acknowledge(req.user._id, notes);

    // Emit alert update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('alert_update', {
        alertId: alert._id,
        status: 'acknowledged',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert'
    });
  }
});

// @route   PUT /api/alerts/:id/resolve
// @desc    Resolve alert
// @access  Private
router.put('/:id/resolve', [
  body('resolution')
    .notEmpty()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Resolution is required and cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { resolution, notes } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Only admin and government users can resolve alerts
    if (req.user.role === 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to resolve alerts'
      });
    }

    await alert.resolve(req.user._id, resolution, notes);

    // Emit alert update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('alert_update', {
        alertId: alert._id,
        status: 'resolved',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert'
    });
  }
});

// @route   PUT /api/alerts/:id/false-alarm
// @desc    Mark alert as false alarm
// @access  Private
router.put('/:id/false-alarm', [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Only admin and government users can mark alerts as false alarms
    if (req.user.role === 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to mark alerts as false alarms'
      });
    }

    await alert.markFalseAlarm(req.user._id, reason);

    // Emit alert update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('alert_update', {
        alertId: alert._id,
        status: 'false_alarm',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Alert marked as false alarm successfully',
      data: alert
    });
  } catch (error) {
    console.error('Mark false alarm error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as false alarm'
    });
  }
});

// @route   POST /api/alerts/:id/actions
// @desc    Add action to alert
// @access  Private
router.post('/:id/actions', [
  body('action')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Action is required and cannot exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, notes } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if user can add actions to this alert
    if (req.user.role === 'tourist') {
      const tourist = await Tourist.findOne({ userId: req.user._id });
      if (!tourist || alert.touristId.toString() !== tourist._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this alert'
        });
      }
    }

    await alert.addAction(action, req.user._id, notes);

    // Emit alert update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('alert_update', {
        alertId: alert._id,
        action: action,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Action added successfully',
      data: alert
    });
  } catch (error) {
    console.error('Add action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add action'
    });
  }
});

// @route   POST /api/alerts/:id/escalate
// @desc    Escalate alert
// @access  Private
router.post('/:id/escalate', [
  body('escalatedTo')
    .isArray({ min: 1 })
    .withMessage('At least one user must be specified for escalation'),
  body('escalatedTo.*')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { escalatedTo, reason } = req.body;

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Only admin and government users can escalate alerts
    if (req.user.role === 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to escalate alerts'
      });
    }

    await alert.escalate(escalatedTo, reason);

    // Emit alert update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('alert_update', {
        alertId: alert._id,
        escalated: true,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Alert escalated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Escalate alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate alert'
    });
  }
});

// @route   GET /api/alerts/critical/active
// @desc    Get all critical active alerts
// @access  Private
router.get('/critical/active', requireAdmin, async (req, res) => {
  try {
    const criticalAlerts = await Alert.findCritical()
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .populate('deviceId', 'deviceId deviceType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: criticalAlerts
    });
  } catch (error) {
    console.error('Get critical alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch critical alerts'
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', authorizeAlertAccess, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Only admin and government users can delete alerts
    if (req.user.role === 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete alerts'
      });
    }

    // Soft delete
    alert.isActive = false;
    await alert.save();

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert'
    });
  }
});

module.exports = router;
