const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const touristRoutes = require('./routes/tourists');
const deviceRoutes = require('./routes/devices');
const alertRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');


// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = createServer(app);

// Default root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Tourist Safety Platform API is running.' });
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.WS_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tourists', authenticateToken, touristRoutes);
app.use('/api/devices', authenticateToken, deviceRoutes);
app.use('/api/alerts', authenticateToken, alertRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// WebSocket connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  // Verify JWT token
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected via WebSocket`);
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Join admin users to admin room
  if (socket.userRole === 'admin' || socket.userRole === 'government') {
    socket.join('admin_room');
  }
  
  // Handle IoT device updates
  socket.on('device_update', (data) => {
    // Broadcast to admin room
    socket.to('admin_room').emit('device_update', data);
  });
  
  // Handle emergency alerts
  socket.on('emergency_alert', (data) => {
    // Broadcast to all admin users
    socket.to('admin_room').emit('emergency_alert', data);
    
    // Also send to specific user if they have family/contacts
    if (data.contacts) {
      data.contacts.forEach(contact => {
        socket.to(`user_${contact}`).emit('emergency_notification', data);
      });
    }
  });
  
  // Handle location updates
  socket.on('location_update', (data) => {
    // Broadcast to admin room for monitoring
    socket.to('admin_room').emit('location_update', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected from WebSocket`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety-platform';
      
    console.log('Connecting to MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Starting server without database connection...');
    console.log('💡 To fix this, install MongoDB or use MongoDB Atlas');
    // Don't exit, just continue without database
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    const Tourist = require('./models/Tourist');
    const Device = require('./models/Device');
    const Alert = require('./models/Alert');
    
    // Tourist indexes
    await Tourist.collection.createIndex({ email: 1 }, { unique: true });
    await Tourist.collection.createIndex({ touristId: 1 }, { unique: true });
    await Tourist.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Tourist.collection.createIndex({ status: 1 });
    await Tourist.collection.createIndex({ createdAt: -1 });
    
    // Device indexes
    await Device.collection.createIndex({ deviceId: 1 }, { unique: true });
    await Device.collection.createIndex({ touristId: 1 });
    await Device.collection.createIndex({ status: 1 });
    await Device.collection.createIndex({ lastUpdate: -1 });
    
    // Alert indexes
    await Alert.collection.createIndex({ touristId: 1 });
    await Alert.collection.createIndex({ type: 1 });
    await Alert.collection.createIndex({ severity: 1 });
    await Alert.collection.createIndex({ createdAt: -1 });
    await Alert.collection.createIndex({ status: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🔄 Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
<<<<<<< HEAD
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
=======
<<<<<<< HEAD
    sequelize.close().then(() => {
      console.log('✅ PostgreSQL connection closed');
      process.exit(0);
    }).catch((err) => {
      console.error('❌ Error closing PostgreSQL connection:', err);
      process.exit(1);
=======
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
>>>>>>> cce787370a13878a3a10ef8f2239e60890db898f
>>>>>>> b473e31 (Resolve merge conflicts)
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start server first, then try to connect to DB
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 WebSocket server ready`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
  
  // Connect to database after server starts
  await connectDB();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
