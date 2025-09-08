const express = require('express');
const { body, validationResult } = require('express-validator');
const Device = require('../models/Device');
const Tourist = require('../models/Tourist');
const Alert = require('../models/Alert');
const { authorizeDeviceAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/devices
// @desc    Get all devices (admin/government only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, deviceType, search } = req.query;
    const query = { isActive: true };

    // Add filters
    if (status) query.status = status;
    if (deviceType) query.deviceType = deviceType;
    if (search) {
      query.$or = [
        { deviceId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const devices = await Device.find(query)
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName')
      .sort({ lastUpdate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Device.countDocuments(query);

    res.json({
      success: true,
      data: devices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
});

// @route   GET /api/devices/statistics
// @desc    Get device statistics (admin/government only)
// @access  Private
router.get('/statistics', async (req, res) => {
  try {
    const totalDevices = await Device.countDocuments({ isActive: true });
    const activeDevices = await Device.countDocuments({ status: 'active', isActive: true });
    const warningDevices = await Device.countDocuments({ status: 'warning', isActive: true });
    const offlineDevices = await Device.countDocuments({ status: 'offline', isActive: true });

    const deviceTypes = await Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    const lowBatteryDevices = await Device.findLowBattery(20);
    const offlineDevicesList = await Device.findOffline(30);

    res.json({
      success: true,
      data: {
        total: totalDevices,
        active: activeDevices,
        warning: warningDevices,
        offline: offlineDevices,
        byType: deviceTypes,
        lowBattery: lowBatteryDevices.length,
        offlineList: offlineDevicesList.length
      }
    });
  } catch (error) {
    console.error('Get device statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device statistics'
    });
  }
});

// @route   GET /api/devices/:id
// @desc    Get device by ID
// @access  Private
router.get('/:id', authorizeDeviceAccess, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('touristId', 'touristId personalInfo.firstName personalInfo.lastName');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device'
    });
  }
});

// @route   POST /api/devices
// @desc    Create a new device
// @access  Private
router.post('/', [
  body('deviceType')
    .isIn(['smartband', 'tracker', 'phone', 'watch', 'beacon'])
    .withMessage('Invalid device type'),
  body('manufacturer')
    .notEmpty()
    .withMessage('Manufacturer is required'),
  body('model')
    .notEmpty()
    .withMessage('Model is required'),
  body('serialNumber')
    .notEmpty()
    .withMessage('Serial number is required'),
  body('touristId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tourist ID')
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

    const { deviceType, manufacturer, model, serialNumber, touristId } = req.body;

    // If touristId is provided, verify it exists
    let tourist = null;
    if (touristId) {
      tourist = await Tourist.findById(touristId);
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist not found'
        });
      }
    } else if (req.user.role === 'tourist') {
      // For tourists, use their own tourist profile
      tourist = await Tourist.findOne({ userId: req.user._id });
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist profile not found'
        });
      }
    }

    const device = new Device({
      deviceType,
      manufacturer,
      model,
      serialNumber,
      touristId: tourist ? tourist._id : null,
      location: {
        coordinates: {
          type: 'Point',
          coordinates: [0, 0] // Default location
        },
        address: 'Unknown'
      }
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: device
    });
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create device'
    });
  }
});

// @route   PUT /api/devices/:id
// @desc    Update device
// @access  Private
router.put('/:id', authorizeDeviceAccess, [
  body('deviceType')
    .optional()
    .isIn(['smartband', 'tracker', 'phone', 'watch', 'beacon'])
    .withMessage('Invalid device type'),
  body('manufacturer')
    .optional()
    .notEmpty()
    .withMessage('Manufacturer cannot be empty'),
  body('model')
    .optional()
    .notEmpty()
    .withMessage('Model cannot be empty')
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

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'deviceType',
      'manufacturer',
      'model',
      'firmwareVersion',
      'settings',
      'maintenance'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        device[key] = req.body[key];
      }
    });

    await device.save();

    res.json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device'
    });
  }
});

// @route   POST /api/devices/:id/vitals
// @desc    Update device vitals
// @access  Private
router.post('/:id/vitals', authorizeDeviceAccess, [
  body('heartRate')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Heart rate must be between 30 and 200'),
  body('temperature')
    .optional()
    .isFloat({ min: 30, max: 45 })
    .withMessage('Temperature must be between 30 and 45'),
  body('steps')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Steps must be a positive integer')
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

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update vitals
    await device.updateVitals(req.body);

    // Check for abnormal vitals and create alerts if needed
    if (req.body.heartRate) {
      if (req.body.heartRate > 100 || req.body.heartRate < 60) {
        await device.triggerAlert('heartRateAbnormal', { heartRate: req.body.heartRate });
        
        // Create alert
        const alert = new Alert({
          touristId: device.touristId,
          deviceId: device._id,
          type: 'medical',
          severity: req.body.heartRate > 120 || req.body.heartRate < 50 ? 'high' : 'medium',
          title: 'Abnormal Heart Rate Detected',
          description: `Heart rate of ${req.body.heartRate} BPM detected on device ${device.deviceId}`,
          location: device.location,
          data: {
            heartRate: req.body.heartRate,
            deviceId: device.deviceId
          },
          metadata: {
            source: 'device',
            confidence: 90
          }
        });
        await alert.save();
      }
    }

    if (req.body.temperature) {
      if (req.body.temperature > 38 || req.body.temperature < 35) {
        await device.triggerAlert('temperatureAbnormal', { temperature: req.body.temperature });
        
        // Create alert
        const alert = new Alert({
          touristId: device.touristId,
          deviceId: device._id,
          type: 'medical',
          severity: req.body.temperature > 39 || req.body.temperature < 34 ? 'high' : 'medium',
          title: 'Abnormal Temperature Detected',
          description: `Temperature of ${req.body.temperature}°C detected on device ${device.deviceId}`,
          location: device.location,
          data: {
            temperature: req.body.temperature,
            deviceId: device.deviceId
          },
          metadata: {
            source: 'device',
            confidence: 90
          }
        });
        await alert.save();
      }
    }

    // Emit device update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('device_update', {
        deviceId: device._id,
        vitals: req.body,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Device vitals updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Update device vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device vitals'
    });
  }
});

// @route   POST /api/devices/:id/location
// @desc    Update device location
// @access  Private
router.post('/:id/location', authorizeDeviceAccess, [
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

    const { coordinates, address, accuracy, altitude, speed, heading } = req.body;

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Update location
    await device.updateLocation({
      coordinates: {
        type: 'Point',
        coordinates: coordinates
      },
      address,
      accuracy,
      altitude,
      speed,
      heading
    });

    // Update tourist location if device belongs to a tourist
    if (device.touristId) {
      const tourist = await Tourist.findById(device.touristId);
      if (tourist) {
        await tourist.updateLocation(coordinates, address, accuracy);
      }
    }

    // Emit location update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('location_update', {
        deviceId: device._id,
        touristId: device.touristId,
        coordinates,
        address,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Device location updated successfully',
      data: {
        coordinates,
        address,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Update device location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device location'
    });
  }
});

// @route   POST /api/devices/:id/alert
// @desc    Trigger device alert
// @access  Private
router.post('/:id/alert', authorizeDeviceAccess, [
  body('alertType')
    .isIn(['batteryLow', 'signalWeak', 'heartRateAbnormal', 'temperatureAbnormal', 'fallDetected', 'panicButtonPressed', 'geofenceViolation'])
    .withMessage('Invalid alert type'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
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

    const { alertType, data } = req.body;

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Trigger alert on device
    await device.triggerAlert(alertType, data);

    // Create alert record
    const alert = new Alert({
      touristId: device.touristId,
      deviceId: device._id,
      type: 'device',
      severity: alertType === 'panicButtonPressed' || alertType === 'fallDetected' ? 'critical' : 'medium',
      title: `Device Alert - ${alertType}`,
      description: `Alert triggered on device ${device.deviceId}: ${alertType}`,
      location: device.location,
      data: {
        alertType,
        deviceId: device.deviceId,
        ...data
      },
      metadata: {
        source: 'device',
        confidence: 95
      }
    });

    await alert.save();

    // Emit alert via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('device_alert', {
        deviceId: device._id,
        touristId: device.touristId,
        alertType,
        data,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Device alert triggered successfully',
      data: alert
    });
  } catch (error) {
    console.error('Trigger device alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger device alert'
    });
  }
});

// @route   DELETE /api/devices/:id
// @desc    Delete device
// @access  Private
router.delete('/:id', authorizeDeviceAccess, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Soft delete
    device.isActive = false;
    await device.save();

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device'
    });
  }
});

module.exports = router;
