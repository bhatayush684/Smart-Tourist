const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeResource = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and government users can access all resources
    if (req.user.role === 'admin' || req.user.role === 'government') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this resource'
      });
    }

    next();
  };
};

// Middleware to check if user can access tourist data
const authorizeTouristAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and government users can access all tourist data
    if (req.user.role === 'admin' || req.user.role === 'government') {
      return next();
    }

    // For tourists, check if they're accessing their own data
    const touristId = req.params.touristId || req.params.id;
    if (touristId) {
      const Tourist = require('../models/Tourist');
      const tourist = await Tourist.findById(touristId);
      
      if (!tourist) {
        return res.status(404).json({
          success: false,
          message: 'Tourist not found'
        });
      }

      if (tourist.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this tourist data'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Tourist access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can access device data
const authorizeDeviceAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and government users can access all device data
    if (req.user.role === 'admin' || req.user.role === 'government') {
      return next();
    }

    // For tourists, check if they own the device
    const deviceId = req.params.deviceId || req.params.id;
    if (deviceId) {
      const Device = require('../models/Device');
      const device = await Device.findById(deviceId).populate('touristId');
      
      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'Device not found'
        });
      }

      if (device.touristId.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this device data'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Device access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can access alert data
const authorizeAlertAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and government users can access all alert data
    if (req.user.role === 'admin' || req.user.role === 'government') {
      return next();
    }

    // For tourists, check if the alert belongs to them
    const alertId = req.params.alertId || req.params.id;
    if (alertId) {
      const Alert = require('../models/Alert');
      const alert = await Alert.findById(alertId);
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      if (alert.touristId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this alert data'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Alert access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to check if user can perform admin actions
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'government') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to check if user can perform government actions
const requireGovernment = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'government') {
    return res.status(403).json({
      success: false,
      message: 'Government access required'
    });
  }

  next();
};

// Middleware to check if user can perform tourist actions
const requireTourist = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'tourist') {
    return res.status(403).json({
      success: false,
      message: 'Tourist access required'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeResource,
  authorizeTouristAccess,
  authorizeDeviceAccess,
  authorizeAlertAccess,
  requireAdmin,
  requireGovernment,
  requireTourist
};
