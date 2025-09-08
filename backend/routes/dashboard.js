const express = require('express');
const Tourist = require('../models/Tourist');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const user = req.user;
    let data = {};

    if (user.role === 'tourist') {
      // Get tourist-specific data
      const tourist = await Tourist.findOne({ userId: user._id });
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist profile not found'
        });
      }

      // Get tourist's devices
      const devices = await Device.find({ touristId: tourist._id, isActive: true });
      
      // Get tourist's recent alerts
      const recentAlerts = await Alert.find({ touristId: tourist._id, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5);

      data = {
        tourist: {
          safetyScore: tourist.safetyScore,
          status: tourist.status,
          riskLevel: tourist.riskLevel,
          lastLocation: tourist.location.current,
          lastSeen: tourist.lastSeen
        },
        devices: {
          total: devices.length,
          active: devices.filter(d => d.status === 'active').length,
          warning: devices.filter(d => d.status === 'warning').length,
          offline: devices.filter(d => d.status === 'offline').length
        },
        alerts: {
          total: recentAlerts.length,
          active: recentAlerts.filter(a => a.status === 'active').length,
          recent: recentAlerts
        }
      };
    } else {
      // Get admin/government data
      const totalTourists = await Tourist.countDocuments({ isActive: true });
      const totalDevices = await Device.countDocuments({ isActive: true });
      const totalAlerts = await Alert.countDocuments({ isActive: true });
      const activeAlerts = await Alert.countDocuments({ status: 'active', isActive: true });
      const criticalAlerts = await Alert.countDocuments({ severity: 'critical', isActive: true });

      // Get recent alerts
      const recentAlerts = await Alert.find({ isActive: true })
        .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
        .sort({ createdAt: -1 })
        .limit(10);

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

      data = {
        statistics: {
          totalTourists,
          totalDevices,
          totalAlerts,
          activeAlerts,
          criticalAlerts
        },
        deviceStats,
        touristStats,
        recentAlerts
      };
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// @route   GET /api/dashboard/statistics
// @desc    Get dashboard statistics
// @access  Private
router.get('/statistics', async (req, res) => {
  try {
    const user = req.user;
    const { period = '24h' } = req.query;
    
    let startDate;
    switch (period) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    let data = {};

    if (user.role === 'tourist') {
      // Get tourist-specific statistics
      const tourist = await Tourist.findOne({ userId: user._id });
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist profile not found'
        });
      }

      // Get tourist's alerts in period
      const alerts = await Alert.find({
        touristId: tourist._id,
        createdAt: { $gte: startDate },
        isActive: true
      });

      // Get tourist's devices
      const devices = await Device.find({ touristId: tourist._id, isActive: true });

      data = {
        alerts: {
          total: alerts.length,
          byType: alerts.reduce((acc, alert) => {
            acc[alert.type] = (acc[alert.type] || 0) + 1;
            return acc;
          }, {}),
          bySeverity: alerts.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
          }, {})
        },
        devices: {
          total: devices.length,
          byStatus: devices.reduce((acc, device) => {
            acc[device.status] = (acc[device.status] || 0) + 1;
            return acc;
          }, {}),
          avgBattery: devices.reduce((sum, device) => sum + device.batteryLevel, 0) / devices.length || 0
        },
        tourist: {
          safetyScore: tourist.safetyScore,
          riskLevel: tourist.riskLevel,
          status: tourist.status
        }
      };
    } else {
      // Get admin/government statistics
      const tourists = await Tourist.find({
        createdAt: { $gte: startDate },
        isActive: true
      });

      const devices = await Device.find({
        createdAt: { $gte: startDate },
        isActive: true
      });

      const alerts = await Alert.find({
        createdAt: { $gte: startDate },
        isActive: true
      });

      // Get tourists by nationality
      const touristsByNationality = await Tourist.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$personalInfo.nationality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get devices by type
      const devicesByType = await Device.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } }
      ]);

      // Get alerts by type
      const alertsByType = await Alert.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      data = {
        tourists: {
          total: tourists.length,
          byNationality: touristsByNationality,
          byStatus: tourists.reduce((acc, tourist) => {
            acc[tourist.status] = (acc[tourist.status] || 0) + 1;
            return acc;
          }, {})
        },
        devices: {
          total: devices.length,
          byType: devicesByType,
          byStatus: devices.reduce((acc, device) => {
            acc[device.status] = (acc[device.status] || 0) + 1;
            return acc;
          }, {})
        },
        alerts: {
          total: alerts.length,
          byType: alertsByType,
          bySeverity: alerts.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
          }, {})
        }
      };
    }

    res.json({
      success: true,
      data,
      period
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/notifications
// @desc    Get dashboard notifications
// @access  Private
router.get('/notifications', async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10 } = req.query;

    let notifications = [];

    if (user.role === 'tourist') {
      // Get tourist's recent alerts as notifications
      const tourist = await Tourist.findOne({ userId: user._id });
      if (tourist) {
        const alerts = await Alert.find({ touristId: tourist._id, isActive: true })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit));

        notifications = alerts.map(alert => ({
          id: alert._id,
          type: 'alert',
          title: alert.title,
          message: alert.description,
          severity: alert.severity,
          timestamp: alert.createdAt,
          read: alert.status !== 'active'
        }));
      }
    } else {
      // Get admin/government notifications
      const alerts = await Alert.find({
        status: { $in: ['active', 'acknowledged'] },
        isActive: true
      })
        .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      notifications = alerts.map(alert => ({
        id: alert._id,
        type: 'alert',
        title: alert.title,
        message: alert.description,
        severity: alert.severity,
        timestamp: alert.createdAt,
        read: alert.status === 'acknowledged',
        tourist: alert.touristId
      }));
    }

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get dashboard notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get dashboard activity feed
// @access  Private
router.get('/activity', async (req, res) => {
  try {
    const user = req.user;
    const { limit = 20 } = req.query;

    let activities = [];

    if (user.role === 'tourist') {
      // Get tourist's recent activities
      const tourist = await Tourist.findOne({ userId: user._id });
      if (tourist) {
        const alerts = await Alert.find({ touristId: tourist._id, isActive: true })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit));

        activities = alerts.map(alert => ({
          id: alert._id,
          type: 'alert',
          action: 'Alert created',
          description: alert.description,
          timestamp: alert.createdAt,
          severity: alert.severity
        }));
      }
    } else {
      // Get system-wide activities
      const alerts = await Alert.find({ isActive: true })
        .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      activities = alerts.map(alert => ({
        id: alert._id,
        type: 'alert',
        action: 'Alert created',
        description: alert.description,
        timestamp: alert.createdAt,
        severity: alert.severity,
        tourist: alert.touristId
      }));
    }

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get dashboard activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed'
    });
  }
});

module.exports = router;
