const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleUsers = [
  {
    name: 'John Smith',
    email: 'tourist@test.com',
    password: 'password123',
    role: 'tourist',
    status: 'active'
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    status: 'active'
  },
  {
    name: 'Officer Rajesh Kumar',
    email: 'police@test.com',
    password: 'police123',
    role: 'police',
    status: 'active'
  },
  {
    name: 'Amit Patel',
    email: 'idissuer@test.com',
    password: 'issuer123',
    role: 'id_issuer',
    status: 'active'
  }
];

async function createUsers() {
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

    // Drop and recreate users table to fix any issues
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Users table created fresh');

    // Create sample users
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      const result = await client.query(
        'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user.name, user.email, hashedPassword, user.role, user.status]
      );
      
      console.log(`✅ Created ${user.role}: ${user.email} (ID: ${result.rows[0].id})`);
    }

    console.log('\n🎉 Sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('='.repeat(50));
    
    sampleUsers.forEach(user => {
      console.log(`${user.role.toUpperCase().padEnd(12)} | ${user.email.padEnd(25)} | ${user.password}`);
    });

    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

createUsers();
