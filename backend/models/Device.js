const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2}-\d{3}-\d{4}$/, 'Invalid device ID format']
  },
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    required: true
  },
  deviceType: {
    type: String,
    enum: ['smartband', 'tracker', 'phone', 'watch', 'beacon'],
    required: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  firmwareVersion: {
    type: String,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'warning', 'offline', 'maintenance'],
    default: 'active'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  signalStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  lastUpdate: {
    type: Date,
    default: Date.now
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
    },
    altitude: {
      type: Number,
      default: null
    },
    speed: {
      type: Number,
      default: null
    },
    heading: {
      type: Number,
      default: null
    }
  },
  vitals: {
    heartRate: {
      type: Number,
      min: 30,
      max: 200,
      default: null
    },
    temperature: {
      type: Number,
      min: 30,
      max: 45,
      default: null
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: 70,
        max: 250,
        default: null
      },
      diastolic: {
        type: Number,
        min: 40,
        max: 150,
        default: null
      }
    },
    oxygenSaturation: {
      type: Number,
      min: 70,
      max: 100,
      default: null
    },
    steps: {
      type: Number,
      min: 0,
      default: 0
    },
    calories: {
      type: Number,
      min: 0,
      default: 0
    },
    sleep: {
      duration: {
        type: Number,
        default: null
      },
      quality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: null
      }
    }
  },
  sensors: {
    accelerometer: {
      x: Number,
      y: Number,
      z: Number,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    gyroscope: {
      x: Number,
      y: Number,
      z: Number,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    magnetometer: {
      x: Number,
      y: Number,
      z: Number,
      enabled: {
        type: Boolean,
        default: true
      }
    },
    gps: {
      enabled: {
        type: Boolean,
        default: true
      },
      accuracy: Number
    },
    heartRate: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    temperature: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  alerts: {
    batteryLow: {
      type: Boolean,
      default: false
    },
    signalWeak: {
      type: Boolean,
      default: false
    },
    heartRateAbnormal: {
      type: Boolean,
      default: false
    },
    temperatureAbnormal: {
      type: Boolean,
      default: false
    },
    fallDetected: {
      type: Boolean,
      default: false
    },
    panicButtonPressed: {
      type: Boolean,
      default: false
    },
    geofenceViolation: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    dataTransmissionInterval: {
      type: Number,
      default: 30, // seconds
      min: 5,
      max: 300
    },
    batteryOptimization: {
      type: Boolean,
      default: true
    },
    emergencyMode: {
      type: Boolean,
      default: false
    },
    silentMode: {
      type: Boolean,
      default: false
    },
    autoSOS: {
      enabled: {
        type: Boolean,
        default: true
      },
      triggerConditions: [{
        type: String,
        enum: ['fall', 'heartRate', 'temperature', 'manual', 'geofence']
      }]
    }
  },
  connectivity: {
    wifi: {
      connected: {
        type: Boolean,
        default: false
      },
      ssid: String,
      signalStrength: Number
    },
    bluetooth: {
      connected: {
        type: Boolean,
        default: false
      },
      pairedDevices: [String]
    },
    cellular: {
      connected: {
        type: Boolean,
        default: false
      },
      carrier: String,
      signalStrength: Number
    }
  },
  maintenance: {
    lastMaintenance: {
      type: Date,
      default: null
    },
    nextMaintenance: {
      type: Date,
      default: null
    },
    maintenanceHistory: [{
      date: Date,
      type: {
        type: String,
        enum: ['routine', 'repair', 'upgrade', 'calibration']
      },
      description: String,
      technician: String,
      cost: Number
    }]
  },
  statistics: {
    totalUptime: {
      type: Number,
      default: 0 // in hours
    },
    dataTransmitted: {
      type: Number,
      default: 0 // in MB
    },
    alertsGenerated: {
      type: Number,
      default: 0
    },
    emergencyCalls: {
      type: Number,
      default: 0
    },
    batteryCycles: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for device health score
deviceSchema.virtual('healthScore').get(function() {
  let score = 100;
  
  // Battery level impact
  if (this.batteryLevel < 20) score -= 30;
  else if (this.batteryLevel < 50) score -= 15;
  
  // Signal strength impact
  if (this.signalStrength < 30) score -= 25;
  else if (this.signalStrength < 60) score -= 10;
  
  // Status impact
  if (this.status === 'offline') score -= 50;
  else if (this.status === 'warning') score -= 20;
  else if (this.status === 'maintenance') score -= 10;
  
  // Alert impact
  const alertCount = Object.values(this.alerts).filter(alert => alert === true).length;
  score -= alertCount * 5;
  
  return Math.max(0, Math.min(100, score));
});

// Virtual for time since last update
deviceSchema.virtual('timeSinceLastUpdate').get(function() {
  if (!this.lastUpdate) return null;
  return Date.now() - this.lastUpdate.getTime();
});

// Indexes for better query performance
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ touristId: 1 });
deviceSchema.index({ deviceType: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ 'location.coordinates': '2dsphere' });
deviceSchema.index({ lastUpdate: -1 });
deviceSchema.index({ batteryLevel: 1 });
deviceSchema.index({ signalStrength: 1 });
deviceSchema.index({ isActive: 1 });

// Pre-save middleware to generate device ID
deviceSchema.pre('save', async function(next) {
  if (this.isNew && !this.deviceId) {
    const typeCode = this.deviceType.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const year = new Date().getFullYear().toString().substring(2);
    this.deviceId = `${typeCode}-${randomNum}-${year}`;
  }
  next();
});

// Instance method to update vitals
deviceSchema.methods.updateVitals = function(vitalsData) {
  Object.keys(vitalsData).forEach(key => {
    if (this.vitals[key] !== undefined) {
      this.vitals[key] = vitalsData[key];
    }
  });
  
  this.lastUpdate = new Date();
  return this.save();
};

// Instance method to update location
deviceSchema.methods.updateLocation = function(locationData) {
  this.location = {
    ...this.location,
    ...locationData,
    timestamp: new Date()
  };
  
  this.lastUpdate = new Date();
  return this.save();
};

// Instance method to trigger alert
deviceSchema.methods.triggerAlert = function(alertType, data = {}) {
  if (this.alerts[alertType] !== undefined) {
    this.alerts[alertType] = true;
  }
  
  this.statistics.alertsGenerated += 1;
  this.lastUpdate = new Date();
  
  return this.save();
};

// Instance method to clear alert
deviceSchema.methods.clearAlert = function(alertType) {
  if (this.alerts[alertType] !== undefined) {
    this.alerts[alertType] = false;
  }
  
  this.lastUpdate = new Date();
  return this.save();
};

// Instance method to check if device needs maintenance
deviceSchema.methods.needsMaintenance = function() {
  if (!this.maintenance.nextMaintenance) return false;
  return new Date() >= this.maintenance.nextMaintenance;
};

// Static method to find devices by status
deviceSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to find devices by type
deviceSchema.statics.findByType = function(deviceType) {
  return this.find({ deviceType, isActive: true });
};

// Static method to find devices with low battery
deviceSchema.statics.findLowBattery = function(threshold = 20) {
  return this.find({ 
    batteryLevel: { $lt: threshold }, 
    isActive: true 
  });
};

// Static method to find offline devices
deviceSchema.statics.findOffline = function(minutes = 30) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.find({ 
    lastUpdate: { $lt: cutoffTime }, 
    isActive: true 
  });
};

module.exports = mongoose.model('Device', deviceSchema);
