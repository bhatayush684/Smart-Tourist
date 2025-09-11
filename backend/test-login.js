const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
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

    // Test login with tourist account
    const email = 'tourist@test.com';
    const password = 'password123';

    // Find user by email
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = result.rows[0];
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is valid - Login should work');
    } else {
      console.log('❌ Password is invalid');
      
      // Let's check what the stored password hash looks like
      console.log('Stored password hash:', user.password);
      
      // Try to create a new hash and compare
      const newHash = await bcrypt.hash(password, 12);
      console.log('New hash for comparison:', newHash);
    }

    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
