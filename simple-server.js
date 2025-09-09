const http = require('http');
const url = require('url');

const PORT = 5000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Simple server is running!' }));
  } else if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else if (parsedUrl.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('Login attempt:', { email, password });
        
        // Define all test users
        const testUsers = {
          'tourist@test.com': {
            password: 'password123',
            user: {
              id: '1',
              email: 'tourist@test.com',
              name: 'John Smith',
              role: 'tourist',
              status: 'active'
            }
          },
          'admin@test.com': {
            password: 'admin123',
            user: {
              id: '2',
              email: 'admin@test.com',
              name: 'Admin User',
              role: 'admin',
              status: 'active'
            }
          },
          'police@test.com': {
            password: 'police123',
            user: {
              id: '3',
              email: 'police@test.com',
              name: 'Officer Rajesh Kumar',
              role: 'police',
              status: 'active',
              department: 'Delhi Police',
              badgeNumber: 'DP12345'
            }
          },
          'idissuer@test.com': {
            password: 'issuer123',
            user: {
              id: '4',
              email: 'idissuer@test.com',
              name: 'Amit Patel',
              role: 'id_issuer',
              status: 'active',
              location: 'IGI Airport Terminal 3',
              idType: 'Airport Immigration'
            }
          }
        };
        
        const testUser = testUsers[email];
        
        if (testUser && testUser.password === password) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            token: `test-token-${testUser.user.id}`,
            refreshToken: `test-refresh-token-${testUser.user.id}`,
            user: testUser.user
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Test login: POST http://localhost:${PORT}/api/auth/login`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
