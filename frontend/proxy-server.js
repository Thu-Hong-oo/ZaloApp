const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy configuration
const proxyOptions = {
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // rewrite path
  },
  onProxyRes: function(proxyRes, req, res) {
    // Log proxy responses
    console.log('Proxying request to:', req.method, req.url);
    console.log('Response status:', proxyRes.statusCode);
  },
  onError: function(err, req, res) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
};

// Use proxy for all /api routes
app.use('/api', createProxyMiddleware(proxyOptions));

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to http://localhost:8000`);
}); 