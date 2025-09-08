const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createDefaultUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety-platform');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@touristsafety.gov.in' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email: admin@touristsafety.gov.in');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }

    // Create default admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@touristsafety.gov.in',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      isVerified: true,
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        theme: 'auto'
      }
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@touristsafety.gov.in');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

    // Create a sample tourist user
    const touristUser = new User({
      name: 'John Doe',
      email: 'tourist@example.com',
      password: 'tourist123',
      role: 'tourist',
      isActive: true,
      isVerified: true,
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        theme: 'auto'
      }
    });

    await touristUser.save();
    console.log('✅ Sample tourist user created successfully!');
    console.log('📧 Email: tourist@example.com');
    console.log('🔑 Password: tourist123');
    console.log('👤 Role: tourist');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default user:', error);
    process.exit(1);
  }
};

createDefaultUser();
