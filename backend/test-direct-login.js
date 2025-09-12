const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testDirectLogin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tourist_safety_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const email = 'tourist@test.com';
    const password = 'password123';
    
    // Find user directly from database
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Role: ${user.role}`);
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password valid: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
    
    if (isValidPassword) {
      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      console.log('🎫 Login successful!');
      console.log(`   Token: ${token.substring(0, 20)}...`);
      
      // Return success response
      const response = {
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      };
      
      console.log('\n📋 Response:', JSON.stringify(response, null, 2));
    }

    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectLogin();
