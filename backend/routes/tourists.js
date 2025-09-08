const express = require('express');
const { body, validationResult } = require('express-validator');
const Tourist = require('../models/Tourist');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { authorizeTouristAccess } = require('../middleware/auth');
const QRCode = require('qrcode');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const router = express.Router();
// File upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG images or PDF documents are allowed'));
  }
});

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

// Helper: generate unique serial for digital ID
function generateDigitalIdSerial(touristId) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
  return `DID-${new Date().getFullYear()}-${touristId.slice(-4)}-${random}`;
}

// @route   POST /api/tourists/me/digital-id
// @desc    Issue a new digital ID card (immutable)
// @access  Private
router.post('/me/digital-id', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), [
  body('documentType').isIn(['passport', 'aadhaar', 'other']).withMessage('Invalid document type'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
  body('validDays').optional().isInt({ min: 1, max: 365 }).withMessage('validDays must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    let tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      // Create a minimal tourist profile with safe defaults to allow ID issuance
      try {
        const nameParts = (req.user.name || 'Tourist User').split(' ');
        const firstName = nameParts[0] || 'Tourist';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        const now = new Date();

        // Generate a unique temporary passport number with retries to avoid unique constraint conflicts
        let tempPassport = '';
        for (let attempt = 0; attempt < 5; attempt++) {
          tempPassport = `TEMP-${now.getFullYear()}-${Math.floor(Math.random() * 1e9).toString().padStart(9, '0')}`;
          const exists = await Tourist.findOne({ 'personalInfo.passportNumber': tempPassport }).lean();
          if (!exists) break;
          if (attempt === 4) throw new Error('Could not generate unique temporary passport number');
        }

        tourist = new Tourist({
          userId: req.user._id,
          personalInfo: {
            firstName,
            lastName,
            dateOfBirth: new Date('1990-01-01T00:00:00Z'),
            gender: 'other',
            nationality: 'Unknown',
            passportNumber: tempPassport,
            passportExpiry: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
            phoneNumber: '+10000000000',
            emergencyContact: {
              name: 'Emergency Contact',
              relationship: 'Unknown',
              phoneNumber: '+10000000001',
              email: 'contact@example.com'
            }
          },
          travelInfo: {
            arrivalDate: now,
            departureDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            purposeOfVisit: 'tourism',
            accommodation: {
              type: 'hotel',
              name: 'Unknown',
              address: 'Unknown',
              phoneNumber: '+10000000002'
            }
          },
          location: {
            current: {
              coordinates: { type: 'Point', coordinates: [0, 0] },
              address: 'Unknown',
              timestamp: now,
              accuracy: 0
            },
            history: []
          }
        });
        await tourist.save();
      } catch (createErr) {
        console.error('Auto-create tourist failed:', createErr);
        // Fallback: generate a temporary dummy digital ID without persisting
        try {
          const now = new Date();
          const validDays = parseInt(req.body.validDays, 10) || 30;
          const issuedAt = now;
          const expiresAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
          const serial = `DUMMY-${now.getFullYear()}-${Math.floor(Math.random() * 1e6)
            .toString()
            .padStart(6, '0')}`;
          const name = req.user.name || 'Guest User';
          const qrPayload = {
            serial,
            touristId: 'TEMP',
            name,
            expiresAt
          };
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
            errorCorrectionLevel: 'M',
            margin: 1,
            scale: 6
          });
          const blockchainHash = crypto
            .createHash('sha256')
            .update(serial + JSON.stringify(qrPayload))
            .digest('hex');

          const card = {
            serial,
            version: 1,
            photoUrl: null,
            documentType: req.body.documentType || 'other',
            documentNumber: req.body.documentNumber || 'TEMP',
            name,
            nationality: 'Unknown',
            qrDataUrl,
            issuedAt,
            expiresAt,
            status: 'active',
            immutable: true,
            temporary: true
          };

          return res.status(201).json({
            success: true,
            message: 'Temporary Digital ID generated',
            data: { card, blockchainHash, temporary: true }
          });
        } catch (dummyErr) {
          return res.status(400).json({
            success: false,
            message: 'Could not create tourist profile automatically',
            error: dummyErr.message
          });
        }
      }
    }

    const validDays = req.body.validDays || 30;
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + validDays * 24 * 60 * 60 * 1000);

    const serial = generateDigitalIdSerial(tourist.touristId || tourist._id.toString());

    // Payload for QR: minimal verification info
    const qrPayload = {
      serial,
      touristId: tourist.touristId,
      name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
      expiresAt
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { errorCorrectionLevel: 'M', margin: 1, scale: 6 });

    const blockchainHash = crypto
      .createHash('sha256')
      .update(serial + JSON.stringify(qrPayload))
      .digest('hex');

    const photoFile = req.files?.photo?.[0];
    const docFile = req.files?.document?.[0];
    const photoUrl = photoFile ? `/uploads/${path.basename(photoFile.path)}` : (req.body.photoUrl || null);

    const card = {
      serial,
      version: 1,
      photoUrl,
      documentType: req.body.documentType,
      documentNumber: req.body.documentNumber,
      name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
      nationality: tourist.personalInfo.nationality,
      qrDataUrl,
      issuedAt,
      expiresAt,
      status: 'active',
      immutable: true
    };

    // Append immutable card to history
    tourist.digitalIdCards.push(card);

    // Update current digitalId snapshot for convenience
    tourist.digitalId = {
      qrCode: qrDataUrl,
      blockchainHash,
      issuedAt,
      expiresAt,
      isActive: true
    };

    await tourist.save();

    return res.status(201).json({ success: true, message: 'Digital ID issued successfully', data: { card, blockchainHash } });
  } catch (error) {
    console.error('Issue digital ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to issue digital ID' });
  }
});

// @route   GET /api/tourists/me/digital-id
// @desc    Get current digital ID snapshot
// @access  Private
router.get('/me/digital-id', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id });
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist profile not found' });
    }
    // auto-expire snapshot if needed
    if (tourist.digitalId && tourist.digitalId.expiresAt && new Date(tourist.digitalId.expiresAt) < new Date()) {
      tourist.digitalId.isActive = false;
      await tourist.save();
    }
    return res.json({ success: true, data: tourist.digitalId });
  } catch (error) {
    console.error('Get digital ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch digital ID' });
  }
});

// @route   GET /api/tourists/me/digital-id/history
// @desc    Get history of issued digital ID cards
// @access  Private
router.get('/me/digital-id/history', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userId: req.user._id }).lean();
    if (!tourist) {
      return res.status(404).json({ success: false, message: 'Tourist profile not found' });
    }

    // Mark expired
    const now = new Date();
    const history = (tourist.digitalIdCards || []).map(c => ({
      ...c,
      status: new Date(c.expiresAt) < now ? 'expired' : c.status
    }));

    return res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get digital ID history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch digital ID history' });
  }
});

// Immutability guard: prevent direct updates to existing digitalIdCards entries
router.put('/me/digital-id/:serial', async (req, res) => {
  return res.status(403).json({ success: false, message: 'Digital ID cards are immutable and cannot be edited' });
});
