const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Tourist = require('../models/Tourist');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { requireAdmin, requireGovernment } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin/Government)
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalTourists = await Tourist.countDocuments({ isActive: true });
    const totalDevices = await Device.countDocuments({ isActive: true });
    const totalAlerts = await Alert.countDocuments({ isActive: true });

    // Get active alerts by severity
    const activeAlerts = await Alert.find({ status: 'active', isActive: true });
    const alertsBySeverity = activeAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});

    // Get device statistics
    const deviceStats = await Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get tourist statistics
    const touristStats = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent alerts
    const recentAlerts = await Alert.find({ isActive: true })
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get critical alerts
    const criticalAlerts = await Alert.find({
      severity: 'critical',
      status: { $in: ['active', 'acknowledged'] },
      isActive: true
    })
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalTourists,
          totalDevices,
          totalAlerts,
          activeAlerts: activeAlerts.length
        },
        alertsBySeverity,
        deviceStats,
        touristStats,
        recentAlerts,
        criticalAlerts
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin/Government)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = { isActive: true };

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin/Government)
router.put('/users/:id/status', requireAdmin, [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/tourists/analytics
// @desc    Get tourist analytics
// @access  Private (Admin/Government)
router.get('/tourists/analytics', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get tourist registrations over time
    const registrations = await Tourist.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get tourists by nationality
    const byNationality = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$personalInfo.nationality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get tourists by status
    const byStatus = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get tourists by risk level
    const byRiskLevel = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Get average safety score
    const avgSafetyScore = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgScore: { $avg: '$safetyScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        registrations,
        byNationality,
        byStatus,
        byRiskLevel,
        avgSafetyScore: avgSafetyScore[0]?.avgScore || 0
      }
    });
  } catch (error) {
    console.error('Get tourist analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tourist analytics'
    });
  }
});

// @route   GET /api/admin/devices/analytics
// @desc    Get device analytics
// @access  Private (Admin/Government)
router.get('/devices/analytics', requireAdmin, async (req, res) => {
  try {
    // Get devices by type
    const byType = await Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    // Get devices by status
    const byStatus = await Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get devices by manufacturer
    const byManufacturer = await Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$manufacturer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get battery statistics
    const batteryStats = await Device.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgBattery: { $avg: '$batteryLevel' },
          minBattery: { $min: '$batteryLevel' },
          maxBattery: { $max: '$batteryLevel' }
        }
      }
    ]);

    // Get low battery devices
    const lowBatteryDevices = await Device.find({
      batteryLevel: { $lt: 20 },
      isActive: true
    }).countDocuments();

    res.json({
      success: true,
      data: {
        byType,
        byStatus,
        byManufacturer,
        batteryStats: batteryStats[0] || { avgBattery: 0, minBattery: 0, maxBattery: 0 },
        lowBatteryDevices
      }
    });
  } catch (error) {
    console.error('Get device analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device analytics'
    });
  }
});

// @route   GET /api/admin/alerts/analytics
// @desc    Get alert analytics
// @access  Private (Admin/Government)
router.get('/alerts/analytics', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get alerts over time
    const alertsOverTime = await Alert.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get alerts by type
    const byType = await Alert.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get alerts by severity
    const bySeverity = await Alert.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Get alerts by status
    const byStatus = await Alert.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get response time statistics
    const responseTimeStats = await Alert.aggregate([
      {
        $match: {
          'response.acknowledgedAt': { $exists: true },
          isActive: true
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$response.acknowledgedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        alertsOverTime,
        byType,
        bySeverity,
        byStatus,
        responseTimeStats: responseTimeStats[0] || {
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        }
      }
    });
  } catch (error) {
    console.error('Get alert analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert analytics'
    });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send broadcast message to all users
// @access  Private (Government only)
router.post('/broadcast', requireGovernment, [
  body('message')
    .notEmpty()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message is required and cannot exceed 1000 characters'),
  body('type')
    .isIn(['info', 'warning', 'emergency'])
    .withMessage('Invalid message type'),
  body('targetUsers')
    .optional()
    .isArray()
    .withMessage('targetUsers must be an array')
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

    const { message, type, targetUsers } = req.body;

    // Emit broadcast via WebSocket
    const io = req.app.get('io');
    if (io) {
      if (targetUsers && targetUsers.length > 0) {
        // Send to specific users
        targetUsers.forEach(userId => {
          io.to(`user_${userId}`).emit('broadcast', {
            message,
            type,
            timestamp: new Date(),
            from: 'Government'
          });
        });
      } else {
        // Send to all users
        io.emit('broadcast', {
          message,
          type,
          timestamp: new Date(),
          from: 'Government'
        });
      }
    }

    res.json({
      success: true,
      message: 'Broadcast sent successfully'
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast'
    });
  }
});

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private (Admin/Government)
router.get('/system/health', requireAdmin, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Check WebSocket connection
    const wsStatus = req.app.get('io') ? 'connected' : 'disconnected';
    
    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      responseTime: Date.now() - startTime
    };

    res.json({
      success: true,
      data: {
        status: dbStatus === 'healthy' && wsStatus === 'connected' ? 'healthy' : 'degraded',
        database: dbStatus,
        websocket: wsStatus,
        metrics: systemMetrics,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
});

// @route   GET /api/admin/users/pending
// @desc    Get pending user approvals
// @access  Private (Admin only)
router.get('/users/pending', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const query = { status: 'pending', isActive: true };

    if (role) query.role = role;

    const pendingUsers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: pendingUsers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users'
    });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve a pending user
// @access  Private (Admin only)
router.put('/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    user.status = 'active';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = null;
    await user.save();

    // Emit notification via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('accountApproved', {
        message: 'Your account has been approved and is now active',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
});

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject a pending user
// @access  Private (Admin only)
router.put('/users/:id/reject', requireAdmin, [
  body('reason')
    .notEmpty()
    .trim()
    .withMessage('Rejection reason is required')
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
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    user.status = 'suspended';
    user.rejectionReason = reason;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    // Emit notification via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('accountRejected', {
        message: `Your account has been rejected: ${reason}`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'User rejected successfully',
      data: user
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend an active user
// @access  Private (Admin only)
router.put('/users/:id/suspend', requireAdmin, [
  body('reason')
    .notEmpty()
    .trim()
    .withMessage('Suspension reason is required')
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
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    user.status = 'suspended';
    user.rejectionReason = reason;
    await user.save();

    // Emit notification via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('accountSuspended', {
        message: `Your account has been suspended: ${reason}`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user'
    });
  }
});

// @route   PUT /api/admin/users/:id/reactivate
// @desc    Reactivate a suspended user
// @access  Private (Admin only)
router.put('/users/:id/reactivate', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'User is not suspended'
      });
    }

    user.status = 'active';
    user.rejectionReason = null;
    await user.save();

    // Emit notification via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${user._id}`).emit('accountReactivated', {
        message: 'Your account has been reactivated',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user'
    });
  }
});

// Helper function to check database health
const checkDatabaseHealth = async () => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    if (state === 1) {
      // Test a simple query
      await User.findOne().limit(1);
      return 'healthy';
    } else {
      return 'unhealthy';
    }
  } catch (error) {
    return 'unhealthy';
  }
};

module.exports = router;
