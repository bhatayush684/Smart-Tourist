const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^ALT-\d{4}-\d{6}$/, 'Invalid alert ID format']
  },
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: false
  },
  type: {
    type: String,
    enum: [
      'emergency',
      'panic',
      'medical',
      'location',
      'device',
      'geofence',
      'weather',
      'security',
      'system',
      'maintenance'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm', 'escalated'],
    default: 'active'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    accuracy: {
      type: Number,
      default: null
    }
  },
  data: {
    // Additional data specific to alert type
    heartRate: Number,
    temperature: Number,
    batteryLevel: Number,
    signalStrength: Number,
    fallDetected: Boolean,
    panicButtonPressed: Boolean,
    geofenceZone: String,
    weatherCondition: String,
    deviceStatus: String,
    customData: mongoose.Schema.Types.Mixed
  },
  metadata: {
    source: {
      type: String,
      enum: ['device', 'manual', 'system', 'api', 'admin'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    tags: [String],
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  response: {
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution cannot exceed 500 characters']
    },
    actions: [{
      action: {
        type: String,
        required: true
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      performedAt: {
        type: Date,
        default: Date.now
      },
      notes: String
    }]
  },
  notifications: {
    sent: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push', 'call']
      },
      recipient: String,
      sentAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed', 'pending']
      }
    }],
    escalation: {
      level: {
        type: Number,
        default: 1
      },
      escalatedAt: Date,
      escalatedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  },
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    event: {
      type: String,
      required: true
    },
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    data: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for response time
alertSchema.virtual('responseTime').get(function() {
  if (!this.response.acknowledgedAt) return null;
  return this.response.acknowledgedAt.getTime() - this.createdAt.getTime();
});

// Virtual for resolution time
alertSchema.virtual('resolutionTime').get(function() {
  if (!this.response.resolvedAt) return null;
  return this.response.resolvedAt.getTime() - this.createdAt.getTime();
});

// Indexes for better query performance
alertSchema.index({ alertId: 1 });
alertSchema.index({ touristId: 1 });
alertSchema.index({ deviceId: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ 'location.coordinates': '2dsphere' });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ expiresAt: 1 });

// Compound indexes
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ touristId: 1, status: 1 });
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ createdAt: -1, status: 1 });

// Pre-save middleware to generate alert ID
alertSchema.pre('save', async function(next) {
  if (this.isNew && !this.alertId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    this.alertId = `ALT-${year}-${randomNum}`;
  }
  
  // Add to timeline
  if (this.isNew) {
    this.timeline.push({
      event: 'created',
      description: 'Alert created',
      data: {
        type: this.type,
        severity: this.severity
      }
    });
  }
  
  next();
});

// Instance method to acknowledge alert
alertSchema.methods.acknowledge = function(userId, notes = '') {
  this.status = 'acknowledged';
  this.response.acknowledgedBy = userId;
  this.response.acknowledgedAt = new Date();
  
  this.timeline.push({
    event: 'acknowledged',
    description: notes || 'Alert acknowledged',
    user: userId
  });
  
  return this.save();
};

// Instance method to resolve alert
alertSchema.methods.resolve = function(userId, resolution, notes = '') {
  this.status = 'resolved';
  this.response.resolvedBy = userId;
  this.response.resolvedAt = new Date();
  this.response.resolution = resolution;
  
  this.timeline.push({
    event: 'resolved',
    description: notes || 'Alert resolved',
    user: userId,
    data: { resolution }
  });
  
  return this.save();
};

// Instance method to escalate alert
alertSchema.methods.escalate = function(escalatedTo, reason = '') {
  this.notifications.escalation.level += 1;
  this.notifications.escalation.escalatedAt = new Date();
  this.notifications.escalation.escalatedTo.push(...escalatedTo);
  
  this.timeline.push({
    event: 'escalated',
    description: reason || 'Alert escalated',
    data: { 
      level: this.notifications.escalation.level,
      escalatedTo: escalatedTo
    }
  });
  
  return this.save();
};

// Instance method to add action
alertSchema.methods.addAction = function(action, userId, notes = '') {
  this.response.actions.push({
    action,
    performedBy: userId,
    notes
  });
  
  this.timeline.push({
    event: 'action_taken',
    description: notes || `Action: ${action}`,
    user: userId,
    data: { action }
  });
  
  return this.save();
};

// Instance method to mark as false alarm
alertSchema.methods.markFalseAlarm = function(userId, reason = '') {
  this.status = 'false_alarm';
  this.response.resolvedBy = userId;
  this.response.resolvedAt = new Date();
  this.response.resolution = reason || 'Marked as false alarm';
  
  this.timeline.push({
    event: 'false_alarm',
    description: reason || 'Alert marked as false alarm',
    user: userId
  });
  
  return this.save();
};

// Static method to find active alerts
alertSchema.statics.findActive = function() {
  return this.find({ status: 'active', isActive: true });
};

// Static method to find alerts by severity
alertSchema.statics.findBySeverity = function(severity) {
  return this.find({ severity, isActive: true });
};

// Static method to find alerts by type
alertSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find alerts by tourist
alertSchema.statics.findByTourist = function(touristId) {
  return this.find({ touristId, isActive: true });
};

// Static method to find critical alerts
alertSchema.statics.findCritical = function() {
  return this.find({ 
    severity: 'critical', 
    status: { $in: ['active', 'acknowledged'] },
    isActive: true 
  });
};

// Static method to find alerts needing attention
alertSchema.statics.findNeedingAttention = function() {
  return this.find({
    status: { $in: ['active', 'acknowledged'] },
    severity: { $in: ['high', 'critical'] },
    isActive: true
  });
};

// Static method to get alert statistics
alertSchema.statics.getStatistics = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$type',
            severity: '$severity',
            status: '$status'
          }
        },
        bySeverity: {
          $push: '$severity'
        },
        byStatus: {
          $push: '$status'
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Alert', alertSchema);
