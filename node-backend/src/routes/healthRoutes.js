const express = require('express');
const router = express.Router();
const { getBundleLocation } = require('../config/remotion');
const { testSupabaseConnection } = require('../config/database');

// Basic API info
router.get('/', (req, res) => {
  res.json({ 
    message: 'AI Content Creator API - Node.js Backend with Supabase',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const bundleReady = !!getBundleLocation();
    const dbConnected = await testSupabaseConnection();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        remotion: bundleReady ? 'ready' : 'bundling',
        database: dbConnected ? 'connected' : 'error',
        server: 'running'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.0.0'
    };

    const overallStatus = bundleReady && dbConnected ? 200 : 503;
    res.status(overallStatus).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// System info (for debugging)
router.get('/system-info', (req, res) => {
  res.json({
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;