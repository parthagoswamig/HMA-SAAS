const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'HMS SaaS API is running - Simple Version',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'HMS SaaS API - Simple Version',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
    },
  });
});

// Auth endpoints (mock)
app.post('/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint - database connection required for full functionality',
    status: 'partial',
  });
});

app.post('/auth/register', (req, res) => {
  console.log('Registration attempt:', req.body);
  res.json({
    message: 'User registered successfully - simple server mode',
    status: 'success',
    data: {
      id: Date.now(),
      email: req.body.email,
      tenantId: req.body.tenantId,
      role: req.body.role,
      createdAt: new Date().toISOString(),
    },
  });
});

// Tenant endpoints (mock)
app.post('/tenants', (req, res) => {
  console.log('Tenant creation attempt:', req.body);
  res.json({
    message: 'Tenant created successfully - simple server mode',
    status: 'success',
    data: {
      id: Date.now(),
      name: req.body.name,
      slug: req.body.slug,
      type: req.body.type,
      email: req.body.email,
      phone: req.body.phone,
      subscriptionPlan: req.body.subscriptionPlan,
      settings: req.body.settings,
      createdAt: new Date().toISOString(),
    },
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HMS SaaS API (Simple) is running on: http://0.0.0.0:${PORT}`);
  console.log(`❤️ Health Check: http://0.0.0.0:${PORT}/health`);
  console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: Not connected (running in simple mode)`);
});
