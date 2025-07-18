const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { renderMedia } = require('@remotion/renderer');
const { bundle } = require('@remotion/bundler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (videos)
app.use('/videos', express.static(path.join(__dirname, '../videos')));

// MongoDB connection
let db;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Ensure videos directory exists
const videosDir = path.join(__dirname, '../videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Bundle Remotion project (do this once at startup)
let bundleLocation;
const initRemotionBundle = async () => {
  try {
    console.log('Bundling Remotion project...');
    bundleLocation = await bundle({
      entryPoint: path.join(__dirname, 'remotion/Root.tsx'),
      onProgress: (progress) => {
        console.log(`Bundling progress: ${Math.round(progress * 100)}%`);
      },
    });
    console.log('Remotion bundle created at:', bundleLocation);
  } catch (error) {
    console.error('Error bundling Remotion project:', error);
    process.exit(1);
  }
};

// Initialize bundle on startup
initRemotionBundle();

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Slideshow Generator API - Node.js Backend' });
});

// Generate slideshow endpoint
app.post('/api/generate-slideshow', async (req, res) => {
  try {
    const { title, text, images, theme, duration } = req.body;

    // Validate input
    if (!title || !theme || !duration) {
      return res.status(400).json({ error: 'Missing required fields: title, theme, duration' });
    }

    if (![15, 30, 60].includes(duration)) {
      return res.status(400).json({ error: 'Duration must be 15, 30, or 60 seconds' });
    }

    if (!['minimal', 'corporate', 'storytelling'].includes(theme)) {
      return res.status(400).json({ error: 'Theme must be minimal, corporate, or storytelling' });
    }

    // Create video record in database
    const videoId = uuidv4();
    const videoRecord = {
      id: videoId,
      title,
      text: text || '',
      images: images || [],
      theme,
      duration,
      status: 'processing',
      createdAt: new Date(),
      outputLocation: null,
      error: null
    };

    await db.collection('videos').insertOne(videoRecord);

    // Start video generation in background
    generateVideoAsync(videoId, { title, text, images, theme, duration });

    res.json({
      message: 'Video generation started',
      videoId: videoId,
      status: 'processing'
    });

  } catch (error) {
    console.error('Error starting video generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video status endpoint
app.get('/api/video-status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await db.collection('videos').findOne({ id: videoId });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const response = {
      id: video.id,
      title: video.title,
      theme: video.theme,
      duration: video.duration,
      status: video.status,
      createdAt: video.createdAt
    };

    if (video.status === 'completed' && video.outputLocation) {
      response.videoUrl = `${req.protocol}://${req.get('host')}/videos/${path.basename(video.outputLocation)}`;
    }

    if (video.status === 'failed' && video.error) {
      response.error = video.error;
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching video status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all videos endpoint
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await db.collection('videos')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const videosWithUrls = videos.map(video => ({
      id: video.id,
      title: video.title,
      theme: video.theme,
      duration: video.duration,
      status: video.status,
      createdAt: video.createdAt,
      videoUrl: video.status === 'completed' && video.outputLocation
        ? `${req.protocol}://${req.get('host')}/videos/${path.basename(video.outputLocation)}`
        : null
    }));

    res.json(videosWithUrls);

  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Background video generation function
async function generateVideoAsync(videoId, videoData) {
  try {
    console.log(`Starting video generation for ID: ${videoId}`);
    
    // Wait for bundle to be ready
    while (!bundleLocation) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const { title, text, images, theme, duration } = videoData;
    const durationInFrames = duration * 30; // 30 fps
    
    // Output file path
    const outputPath = path.join(videosDir, `${videoId}.mp4`);
    
    // Render the video
    await renderMedia({
      composition: {
        id: theme,
        durationInFrames,
        fps: 30,
        width: 1920,
        height: 1080,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        title,
        text,
        images,
        duration
      },
      onProgress: (progress) => {
        console.log(`Video ${videoId} progress: ${Math.round(progress.progress * 100)}%`);
      },
    });

    // Update database with success
    await db.collection('videos').updateOne(
      { id: videoId },
      {
        $set: {
          status: 'completed',
          outputLocation: outputPath,
          completedAt: new Date()
        }
      }
    );

    console.log(`Video generation completed for ID: ${videoId}`);

  } catch (error) {
    console.error(`Error generating video ${videoId}:`, error);
    
    // Update database with error
    await db.collection('videos').updateOne(
      { id: videoId },
      {
        $set: {
          status: 'failed',
          error: error.message,
          failedAt: new Date()
        }
      }
    );
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    bundleReady: !!bundleLocation
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Videos directory: ${videosDir}`);
});