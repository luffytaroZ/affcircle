const express = require('express');
const path = require('path');
require('dotenv').config();

// Import configuration
const { testSupabaseConnection } = require('./config/database');
const { initRemotionBundle } = require('./config/remotion');

// Import middleware
const corsMiddleware = require('./middleware/cors');

// Import routes
const healthRoutes = require('./routes/healthRoutes');
const videoRoutes = require('./routes/videoRoutes');
const threadRoutes = require('./routes/threadRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (videos) under /api path for proper routing
app.use('/api/videos', express.static(path.join(__dirname, '../videos')));

// API Routes
app.use('/api', healthRoutes);
app.use('/api', videoRoutes);
app.use('/api', threadRoutes);
app.use('/api', authRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize application
async function initializeApp() {
  try {
    console.log('🚀 Starting AI Content Creator Backend...');
    
    // Test database connection
    await testSupabaseConnection();
    
    // Initialize Remotion bundle
    await initRemotionBundle();
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
  await initializeApp();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});