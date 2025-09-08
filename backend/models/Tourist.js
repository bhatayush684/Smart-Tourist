const mongoose = require('mongoose');

const touristSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  touristId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^TST-\d{4}-[A-Z]{3}-\d{4}$/, 'Invalid tourist ID format']
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: true
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true
    },
    passportNumber: {
      type: String,
      required: [true, 'Passport number is required'],
      unique: true,
      uppercase: true
    },
    passportExpiry: {
      type: Date,
      required: [true, 'Passport expiry date is required']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        required: true,
        trim: true
      },
      phoneNumber: {
        type: String,
        required: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      }
    }
  },
  travelInfo: {
    arrivalDate: {
      type: Date,
      required: true
    },
    departureDate: {
      type: Date,
      required: true
    },
    purposeOfVisit: {
      type: String,
      enum: ['tourism', 'business', 'education', 'medical', 'family', 'other'],
      required: true
    },
    accommodation: {
      type: {
        type: String,
        enum: ['hotel', 'hostel', 'guesthouse', 'apartment', 'family', 'other'],
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      phoneNumber: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
      }
    },
    itinerary: [{
      date: {
        type: Date,
        required: true
      },
      location: {
        type: String,
        required: true,
        trim: true
      },
      activity: {
        type: String,
        required: true,
        trim: true
      },
      estimatedTime: {
        start: String,
        end: String
      }
    }]
  },
  location: {
    current: {
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
      timestamp: {
        type: Date,
        default: Date.now
      },
      accuracy: {
        type: Number,
        default: null
      }
    },
    history: [{
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number]
        }
      },
      address: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      accuracy: Number
    }]
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'missing', 'emergency', 'safe'],
    default: 'active'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: null
    },
    allergies: [{
      type: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      }
    }],
    medicalConditions: [{
      condition: String,
      medication: String,
      notes: String
    }],
    emergencyMedicalInfo: String
  },
  digitalId: {
    qrCode: {
      type: String,
      default: null
    },
    blockchainHash: {
      type: String,
      default: null
    },
    issuedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'bn', 'te', 'ml', 'ta', 'kn', 'gu', 'mr', 'pa']
    },
    notifications: {
      emergency: {
        type: Boolean,
        default: true
      },
      location: {
        type: Boolean,
        default: true
      },
      weather: {
        type: Boolean,
        default: true
      },
      safety: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareLocation: {
        type: Boolean,
        default: true
      },
      shareHealthData: {
        type: Boolean,
        default: false
      }
    }
  },
  statistics: {
    totalDistanceTraveled: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    alertsTriggered: {
      type: Number,
      default: 0
    },
    emergencyCalls: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
touristSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for age
touristSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for travel duration
touristSchema.virtual('travelDuration').get(function() {
  if (!this.travelInfo.arrivalDate || !this.travelInfo.departureDate) return null;
  const arrival = new Date(this.travelInfo.arrivalDate);
  const departure = new Date(this.travelInfo.departureDate);
  return Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
touristSchema.index({ touristId: 1 });
touristSchema.index({ userId: 1 });
touristSchema.index({ 'location.current.coordinates': '2dsphere' });
touristSchema.index({ status: 1 });
touristSchema.index({ riskLevel: 1 });
touristSchema.index({ safetyScore: 1 });
touristSchema.index({ lastSeen: -1 });
touristSchema.index({ createdAt: -1 });
touristSchema.index({ 'personalInfo.nationality': 1 });
touristSchema.index({ 'travelInfo.arrivalDate': 1 });
touristSchema.index({ 'travelInfo.departureDate': 1 });

// Pre-save middleware to generate tourist ID
touristSchema.pre('save', async function(next) {
  if (this.isNew && !this.touristId) {
    const year = new Date().getFullYear();
    const countryCode = this.personalInfo.nationality.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    this.touristId = `TST-${year}-${countryCode}-${randomNum}`;
  }
  next();
});

// Instance method to update location
touristSchema.methods.updateLocation = function(coordinates, address, accuracy = null) {
  // Add current location to history
  if (this.location.current.coordinates.coordinates.length > 0) {
    this.location.history.push({
      coordinates: this.location.current.coordinates,
      address: this.location.current.address,
      timestamp: this.location.current.timestamp,
      accuracy: this.location.current.accuracy
    });
  }
  
  // Update current location
  this.location.current = {
    coordinates: {
      type: 'Point',
      coordinates: coordinates
    },
    address: address,
    timestamp: new Date(),
    accuracy: accuracy
  };
  
  this.lastSeen = new Date();
  return this.save();
};

// Instance method to calculate safety score
touristSchema.methods.calculateSafetyScore = function() {
  let score = 100;
  
  // Reduce score based on risk factors
  if (this.riskLevel === 'high') score -= 30;
  else if (this.riskLevel === 'medium') score -= 15;
  
  // Reduce score for inactive status
  if (this.status === 'missing') score -= 50;
  else if (this.status === 'emergency') score -= 80;
  
  // Reduce score for recent alerts
  if (this.statistics.alertsTriggered > 0) {
    score -= Math.min(this.statistics.alertsTriggered * 5, 30);
  }
  
  // Ensure score is within bounds
  this.safetyScore = Math.max(0, Math.min(100, score));
  return this.safetyScore;
};

// Static method to find tourists by location
touristSchema.statics.findNearby = function(coordinates, maxDistance = 1000) {
  return this.find({
    'location.current.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to find tourists by status
touristSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to find tourists by risk level
touristSchema.statics.findByRiskLevel = function(riskLevel) {
  return this.find({ riskLevel, isActive: true });
};

module.exports = mongoose.model('Tourist', touristSchema);
