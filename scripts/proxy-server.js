const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Load target URL from config
const configPath = path.join(__dirname, '../config/target-url.json');
let targetUrl = 'https://example.com'; // default

if (fs.existsSync(configPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        targetUrl = config.targetUrl;
    } catch (error) {
        console.error('Error reading config:', error);
    }
}

// Create proxy middleware
const proxyOptions = {
    target: targetUrl,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy Error');
    }
};

// Use proxy for all routes
app.use('/', createProxyMiddleware(proxyOptions));

app.listen(PORT, () => {
    console.log(`Mirror proxy server running on port ${PORT}`);
    console.log(`Proxying requests to: ${targetUrl}`);
});
