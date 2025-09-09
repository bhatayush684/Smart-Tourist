const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tourist = require('../models/Tourist');
require('dotenv').config();

// Sample users for testing all 4 roles
const sampleUsers = [
  // Tourist User
  {
    name: 'John Smith',
    email: 'tourist@test.com',
    password: 'password123',
    role: 'tourist',
    status: 'active'
  },
  
  // Admin User
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    status: 'active'
  },
  
  // Police Officer (Approved)
  {
    name: 'Officer Rajesh Kumar',
    email: 'police@test.com',
    password: 'police123',
    role: 'police',
    status: 'active',
    department: 'Delhi Police',
    badgeNumber: 'DP12345',
    location: 'Connaught Place Station'
  },
  
  // Police Officer (Pending Approval)
  {
    name: 'Inspector Priya Sharma',
    email: 'police.pending@test.com',
    password: 'police123',
    role: 'police',
    status: 'pending',
    department: 'Mumbai Police',
    badgeNumber: 'MP67890',
    location: 'Gateway of India Station'
  },
  
  // ID Issuer (Approved)
  {
    name: 'Amit Patel',
    email: 'idissuer@test.com',
    password: 'issuer123',
    role: 'id_issuer',
    status: 'active',
    location: 'IGI Airport Terminal 3',
    idType: 'Airport Immigration'
  },
  
  // ID Issuer (Pending Approval)
  {
    name: 'Sarah Johnson',
    email: 'idissuer.pending@test.com',
    password: 'issuer123',
    role: 'id_issuer',
    status: 'pending',
    location: 'Taj Palace Hotel',
    idType: 'Hotel Reception'
  }
];

async function createSampleUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ 
      email: { 
        $in: sampleUsers.map(user => user.email) 
      } 
    });

    console.log('Cleared existing test users');

    // Create sample users
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user
        const user = new User(userData);
        await user.save();

        console.log(`✅ Created ${userData.role} user: ${userData.email}`);

        // Create tourist profile if user is a tourist
        if (userData.role === 'tourist') {
          const tourist = new Tourist({
            userId: user._id,
            personalInfo: {
              firstName: userData.name.split(' ')[0],
              lastName: userData.name.split(' ').slice(1).join(' ') || '',
              nationality: 'USA',
              phoneNumber: '+1-555-0123',
              dateOfBirth: new Date('1990-01-01'),
              gender: 'male',
              passportNumber: 'US123456789',
              passportExpiry: new Date('2030-01-01'),
              emergencyContact: {
                name: 'Jane Smith',
                relationship: 'Spouse',
                phoneNumber: '+1-555-0124',
                email: 'jane.smith@email.com'
              }
            },
            travelInfo: {
              arrivalDate: new Date(),
              departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              purposeOfVisit: 'tourism',
              accommodation: {
                type: 'hotel',
                name: 'Sample Hotel',
                address: '123 Tourist Street, Delhi',
                phoneNumber: '+91-11-12345678'
              }
            },
            location: {
              current: {
                coordinates: {
                  type: 'Point',
                  coordinates: [77.2090, 28.6139] // Delhi coordinates
                },
                address: 'Connaught Place, New Delhi',
                timestamp: new Date()
              }
            }
          });

          await tourist.save();
          console.log(`✅ Created tourist profile for: ${userData.email}`);
        }

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('='.repeat(50));
    
    sampleUsers.forEach(user => {
      const statusEmoji = user.status === 'active' ? '✅' : '⏳';
      console.log(`${statusEmoji} ${user.role.toUpperCase().padEnd(12)} | ${user.email.padEnd(25)} | ${user.password}`);
    });

    console.log('\n📝 Notes:');
    console.log('• Users with ✅ can login immediately');
    console.log('• Users with ⏳ need admin approval (login as admin to approve them)');
    console.log('• All passwords are simple for testing purposes');
    console.log('• Tourist user has a complete profile created');

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createSampleUsers();
