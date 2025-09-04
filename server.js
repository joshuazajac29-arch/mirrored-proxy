const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration - use environment variables or defaults
const PRIMARY_TARGET = process.env.PRIMARY_TARGET || 'https://jsonplaceholder.typicode.com';
const MIRROR_TARGET = process.env.MIRROR_TARGET || 'https://reqres.in';

// Enable CORS
app.use(cors());
app.use(express.json());

let primaryHealthy = true;

// Health check function
async function checkPrimaryHealth() {
  try {
    const response = await axios.get(`${PRIMARY_TARGET}/posts/1`, { timeout: 5000 });
    primaryHealthy = response.status === 200;
    console.log('Primary service is HEALTHY');
  } catch (error) {
    console.log('Primary service is UNHEALTHY:', error.message);
    primaryHealthy = false;
  }
}

// Initial health check
checkPrimaryHealth();
// Check every 30 seconds
setInterval(checkPrimaryHealth, 30000);

// Health check endpoint for the proxy itself
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    primary_healthy: primaryHealthy,
    primary_target: PRIMARY_TARGET,
    mirror_target: MIRROR_TARGET,
    message: 'Mirrored proxy server is running'
  });
});

// Proxy info endpoint
app.get('/proxy-info', (req, res) => {
  res.json({
    primary_target: PRIMARY_TARGET,
    mirror_target: MIRROR_TARGET,
    primary_healthy: primaryHealthy,
    last_checked: new Date().toISOString()
  });
});

// Create proxy middleware instances
const primaryProxy = createProxyMiddleware({
  target: PRIMARY_TARGET,
  changeOrigin: true,
  logLevel: 'info',
  onError: (err, req, res) => {
    console.log('Primary target failed, switching to mirror:', err.message);
    primaryHealthy = false;
    mirrorProxy(req, res);
  }
});

const mirrorProxy = createProxyMiddleware({
  target: MIRROR_TARGET,
  changeOrigin: true,
  logLevel: 'info'
});

// Main proxy logic - only proxy non-health endpoints
app.use((req, res, next) => {
  // Don't proxy health endpoints
  if (req.path === '/health' || req.path === '/proxy-info') {
    return next();
  }
  
  console.log(`Proxying request to: ${req.method} ${req.path}`);
  
  // Use primary if healthy, otherwise use mirror
  if (primaryHealthy) {
    primaryProxy(req, res);
  } else {
    mirrorProxy(req, res);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'Available endpoints: /health, /proxy-info'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Mirrored proxy server started successfully');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Primary target: ${PRIMARY_TARGET}`);
  console.log(`📍 Mirror target: ${MIRROR_TARGET}`);
  console.log(`🌐 Health endpoint: http://localhost:${PORT}/health`);
});
