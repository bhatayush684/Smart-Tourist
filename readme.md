# Tourist Safety Platform

A comprehensive MERN stack application for monitoring and ensuring tourist safety in India. This platform provides real-time tracking, emergency alerts, IoT device monitoring, and government oversight capabilities.

## Features

### 🏛 Government Features
- Admin Dashboard: Comprehensive monitoring of all tourists and devices
- Real-time Analytics: Live statistics and performance metrics
- Alert Management: Handle emergency alerts and incidents
- User Management: Manage tourist accounts and permissions
- System Health Monitoring: Monitor platform performance and uptime

### 👥 Tourist Features
- Digital Tourist ID: Blockchain-based secure identification
- Safety App: Mobile-friendly interface with panic button
- Real-time Location Tracking: GPS-based location monitoring
- Emergency Alerts: Instant SOS functionality
- Health Monitoring: IoT device integration for vital signs

### 🔧 Technical Features
- Real-time WebSocket Communication: Live updates and notifications
- IoT Device Integration: Smart bands, trackers, and sensors
- Blockchain Integration: Secure digital ID generation
- Multi-language Support: 10+ Indian languages
- Responsive Design: Works on all devices
- Secure Authentication: JWT-based authentication system

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Shadcn/ui for UI components
- React Router for navigation
- React Query for data fetching
- Socket.io Client for real-time communication

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.io for WebSocket communication
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Helmet for security headers

### Database
- MongoDB with comprehensive schemas for:
  - Users and authentication
  - Tourist profiles and data
  - IoT devices and sensors
  - Alerts and incidents
  - System analytics

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (v6 or higher)
- Git

## Installation

1. Clone the repository
   bash
   git clone https://github.com/gov-india/tourist-safety-platform.git
   cd tourist-safety-platform
   

2. Install dependencies
   bash
   npm run install:all
   

3. Set up environment variables
   
   Create a .env file in the backend directory:
   bash
   cp backend/env.example backend/.env
   
   
   Update the .env file with your configuration:
   env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/tourist-safety-platform
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # WebSocket Configuration
   WS_CORS_ORIGIN=http://localhost:3000
   

4. Start MongoDB
   bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
bash
npm run dev


This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Production Mode

1. Build the application
   bash
   npm run build
   

2. Start the production server
   bash
   npm start
   

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/verify - Verify JWT token
- POST /api/auth/refresh - Refresh access token

### Tourist Endpoints
- GET /api/tourists - Get all tourists (admin only)
- GET /api/tourists/me - Get current user's profile
- PUT /api/tourists/me - Update tourist profile
- POST /api/tourists/me/location - Update location
- POST /api/tourists/me/emergency - Trigger emergency alert

### Device Endpoints
- GET /api/devices - Get all devices
- POST /api/devices - Create new device
- PUT /api/devices/:id - Update device
- POST /api/devices/:id/vitals - Update device vitals
- POST /api/devices/:id/location - Update device location

### Alert Endpoints
- GET /api/alerts - Get all alerts
- GET /api/alerts/:id - Get specific alert
- PUT /api/alerts/:id/acknowledge - Acknowledge alert
- PUT /api/alerts/:id/resolve - Resolve alert
- POST /api/alerts/:id/actions - Add action to alert

### Admin Endpoints
- GET /api/admin/dashboard - Get admin dashboard data
- GET /api/admin/users - Get all users
- GET /api/admin/tourists/analytics - Get tourist analytics
- POST /api/admin/broadcast - Send broadcast message

## Database Schema

### User Schema
- Basic user information and authentication
- Role-based access control (tourist, admin, government)
- Preferences and settings

### Tourist Schema
- Personal information and travel details
- Location tracking and history
- Safety score and risk assessment
- Health information and emergency contacts

### Device Schema
- IoT device information and status
- Real-time vitals and sensor data
- Battery and connectivity status
- Maintenance and configuration

### Alert Schema
- Alert types and severity levels
- Location and timestamp information
- Response tracking and resolution
- Notification and escalation management

## WebSocket Events

### Client to Server
- auth - Authenticate WebSocket connection
- device_update - Send device data updates
- emergency_alert - Trigger emergency alert
- location_update - Send location updates

### Server to Client
- device_update - Receive device updates
- emergency_alert - Receive emergency notifications
- location_update - Receive location updates
- alert_update - Receive alert status changes
- broadcast - Receive system broadcasts

## Testing

Run the test suite:
bash
npm test


Run tests for specific components:
bash
npm run test:client  # Frontend tests
npm run test:server  # Backend tests


## Deployment

### Using Docker

1. Build the Docker image
   bash
   docker build -t tourist-safety-platform .
   

2. Run the container
   bash
   docker run -p 3000:3000 -p 5000:5000 tourist-safety-platform
   

### Using PM2

1. Install PM2
   bash
   npm install -g pm2
   

2. Start the application
   bash
   pm2 start ecosystem.config.js
   

## Security Features

- JWT Authentication: Secure token-based authentication
- Password Hashing: bcryptjs for secure password storage
- Rate Limiting: Prevent brute force attacks
- CORS Protection: Configured for secure cross-origin requests
- Helmet Security: Security headers for protection
- Input Validation: Comprehensive input sanitization
- Role-based Access: Granular permission system

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@touristsafety.gov.in
- Documentation: [docs.touristsafety.gov.in](https://docs.touristsafety.gov.in)
- Issues: [GitHub Issues](https://github.com/gov-india/tourist-safety-platform/issues)

## Acknowledgments

- Government of India - Ministry of Tourism
- Indian Institute of Technology (IIT) - Technical Advisory
- National Informatics Centre (NIC) - Infrastructure Support
- State Tourism Departments - Regional Implementation

---

Note: This is a government project for tourist safety. Please ensure compliance with all applicable laws and regulations when deploying or modifying this system.