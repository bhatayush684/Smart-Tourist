console.log('Starting simple test server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'Server is running' }));
    return;
  }
  
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login attempt:', data);
        
        // Test all four user types
        const users = {
          'tourist@test.com': { password: 'password123', role: 'tourist', name: 'John Smith' },
          'admin@test.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
          'police@test.com': { password: 'police123', role: 'police', name: 'Officer Rajesh Kumar' },
          'idissuer@test.com': { password: 'issuer123', role: 'id_issuer', name: 'Amit Patel' }
        };
        
        const user = users[data.email];
        if (user && user.password === data.password) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            token: `test-token-${user.role}`,
            refreshToken: `refresh-token-${user.role}`,
            user: { id: 1, email: data.email, role: user.role, name: user.name }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
