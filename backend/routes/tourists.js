const express = require('express');
const { body, validationResult } = require('express-validator');
const Tourist = require('../models/Tourist');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { authorizeTouristAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tourists
// @desc    Get all tourists (admin/government only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, riskLevel, search } = req.query;
    const query = { isActive: true };

    // Add filters
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { touristId: { $regex: search, $options: 'i' } },
        { 'personalInfo.nationality': { $regex: search, $options: 'i' } }
      ];
    }

    const tourists = await Tourist.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tourist.countDocuments(query);

    res.json({
      success: true,
      data: tourists,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get tourists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tourists'
    });
  }
});

// @route   GET /api/tourists/me
// @desc    Get current user's tourist profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id })
      .populate('userId', 'name email role');

    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    res.json({
      success: true,
      data: tourist
    });
  } catch (error) {
    console.error('Get tourist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tourist profile'
    });
  }
});

// @route   GET /api/tourists/:id
// @desc    Get tourist by ID
// @access  Private
router.get('/:id', authorizeTouristAccess, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist not found'
      });
    }

    res.json({
      success: true,
      data: tourist
    });
  } catch (error) {
    console.error('Get tourist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tourist'
    });
  }
});

// @route   PUT /api/tourists/me
// @desc    Update current user's tourist profile
// @access  Private
router.put('/me', [
  body('personalInfo.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('personalInfo.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('personalInfo.phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('personalInfo.emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('personalInfo.emergencyContact.phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid emergency contact phone number')
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

    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.phoneNumber',
      'personalInfo.emergencyContact',
      'travelInfo.accommodation',
      'healthInfo',
      'preferences'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) || key.startsWith('personalInfo.') || key.startsWith('travelInfo.') || key.startsWith('healthInfo.') || key.startsWith('preferences.')) {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          if (!tourist[parent]) tourist[parent] = {};
          tourist[parent][child] = req.body[key];
        } else {
          tourist[key] = req.body[key];
        }
      }
    });

    await tourist.save();

    res.json({
      success: true,
      message: 'Tourist profile updated successfully',
      data: tourist
    });
  } catch (error) {
    console.error('Update tourist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tourist profile'
    });
  }
});

// @route   POST /api/tourists/me/location
// @desc    Update current user's location
// @access  Private
router.post('/me/location', [
  body('coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numbers'),
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  body('accuracy')
    .optional()
    .isNumeric()
    .withMessage('Accuracy must be a number')
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

    const { coordinates, address, accuracy } = req.body;

    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    // Update location
    await tourist.updateLocation(coordinates, address, accuracy);

    // Emit location update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('location_update', {
        touristId: tourist._id,
        coordinates,
        address,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        coordinates,
        address,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// @route   GET /api/tourists/me/devices
// @desc    Get current user's devices
// @access  Private
router.get('/me/devices', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    const devices = await Device.find({ touristId: tourist._id, isActive: true });

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
});

// @route   GET /api/tourists/me/alerts
// @desc    Get current user's alerts
// @access  Private
router.get('/me/alerts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = { touristId: req.user._id, isActive: true };

    if (status) query.status = status;
    if (type) query.type = type;

    const alerts = await Alert.find(query)
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

// @route   POST /api/tourists/me/emergency
// @desc    Trigger emergency alert
// @access  Private
router.post('/me/emergency', [
  body('type')
    .isIn(['panic', 'medical', 'security', 'other'])
    .withMessage('Invalid emergency type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
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

    const { type, description } = req.body;

    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    // Create emergency alert
    const alert = new Alert({
      touristId: tourist._id,
      type: 'emergency',
      severity: 'critical',
      title: `Emergency Alert - ${type}`,
      description: description || `Emergency alert triggered by ${tourist.fullName}`,
      location: tourist.location.current,
      data: {
        emergencyType: type,
        triggeredBy: 'tourist'
      },
      metadata: {
        source: 'manual',
        confidence: 100
      }
    });

    await alert.save();

    // Update tourist status
    tourist.status = 'emergency';
    tourist.statistics.alertsTriggered += 1;
    await tourist.save();

    // Emit emergency alert via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('emergency_alert', {
        alertId: alert._id,
        touristId: tourist._id,
        type: 'emergency',
        severity: 'critical',
        location: tourist.location.current,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert triggered successfully',
      data: alert
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger emergency alert'
    });
  }
});

// @route   GET /api/tourists/me/statistics
// @desc    Get current user's statistics
// @access  Private
router.get('/me/statistics', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist profile not found'
      });
    }

    // Get device statistics
    const devices = await Device.find({ touristId: tourist._id, isActive: true });
    const deviceStats = {
      total: devices.length,
      active: devices.filter(d => d.status === 'active').length,
      warning: devices.filter(d => d.status === 'warning').length,
      offline: devices.filter(d => d.status === 'offline').length
    };

    // Get alert statistics
    const alerts = await Alert.find({ touristId: tourist._id, isActive: true });
    const alertStats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        tourist: tourist.statistics,
        devices: deviceStats,
        alerts: alertStats,
        safetyScore: tourist.safetyScore,
        riskLevel: tourist.riskLevel,
        status: tourist.status
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @route   GET /api/tourists/nearby
// @desc    Get nearby tourists (admin/government only)
// @access  Private
router.get('/nearby', async (req, res) => {
  try {
    const { coordinates, maxDistance = 1000 } = req.query;

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are required'
      });
    }

    const [longitude, latitude] = coordinates.split(',').map(Number);
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format'
      });
    }

    const nearbyTourists = await Tourist.findNearby([longitude, latitude], parseInt(maxDistance));

    res.json({
      success: true,
      data: nearbyTourists
    });
  } catch (error) {
    console.error('Get nearby tourists error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby tourists'
    });
  }
});

module.exports = router;
