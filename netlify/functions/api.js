const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS
app.use(cors());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CryptLink API is running on Netlify!' });
});

// Proxy to Render backend for all other API calls
app.use('/api', createProxyMiddleware({
  target: 'https://cryptlink-backend-k1jl.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
}));

// Export for Netlify Functions
module.exports.handler = serverless(app);
