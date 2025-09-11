const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database first
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create database if it doesn't exist
    try {
      await client.query('CREATE DATABASE tourist_safety_platform');
      console.log('✅ Created database tourist_safety_platform');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('✅ Database tourist_safety_platform already exists');
      } else {
        console.log('❌ Error creating database:', error.message);
      }
    }
    
    await client.end();
    console.log('✅ Database connection test successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD ? '***' : 'not set'
    });
  }
}

testConnection();
