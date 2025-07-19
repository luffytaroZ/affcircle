const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { renderMedia } = require('@remotion/renderer');
const { bundle } = require('@remotion/bundler');
const { spawn } = require('child_process');
const util = require('util');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('videos').select('count', { count: 'exact' });
    if (error) throw error;
    console.log('✅ Connected to Supabase successfully');
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    console.log('Please ensure you have run the migration SQL script in your Supabase dashboard');
  }
}

// Test connection on startup
testSupabaseConnection();

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
      entryPoint: path.join(__dirname, 'remotion/index.ts'),
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

    if (!['minimal', 'corporate', 'storytelling', 'modern', 'creative', 'professional', 'elegant', 'cinematic'].includes(theme)) {
      return res.status(400).json({ error: 'Theme must be one of: minimal, corporate, storytelling, modern, creative, professional, elegant, cinematic' });
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

// ============================================================================
// THREAD MAKER API ENDPOINTS
// ============================================================================

// Helper function to call Python LLM service
async function callLLMService(command, ...args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../llm_service.py'),
      command,
      ...args
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python service failed: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse LLM service response: ${error.message}`));
      }
    });
  });
}

// Generate Thread endpoint
app.post('/api/generate-thread', async (req, res) => {
  try {
    const { topic, style = 'engaging', thread_length = 5, platform = 'twitter' } = req.body;

    // Validation
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (thread_length < 1 || thread_length > 20) {
      return res.status(400).json({ error: 'Thread length must be between 1 and 20' });
    }

    if (!['engaging', 'educational', 'storytelling', 'professional', 'viral'].includes(style)) {
      return res.status(400).json({ error: 'Invalid style. Choose from: engaging, educational, storytelling, professional, viral' });
    }

    if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Choose from: twitter, linkedin, instagram' });
    }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Generate thread ID
    const threadId = uuidv4();

    // Create thread record in database
    await db.collection('threads').insertOne({
      id: threadId,
      topic,
      style,
      thread_length,
      platform,
      status: 'generating',
      createdAt: new Date()
    });

    // Generate thread in background
    generateThreadAsync(threadId, apiKey, topic, style, thread_length, platform);

    res.json({
      success: true,
      thread_id: threadId,
      status: 'generating',
      message: 'Thread generation started'
    });

  } catch (error) {
    console.error('Error generating thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Thread Status endpoint
app.get('/api/thread-status/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await db.collection('threads').findOne({ id: threadId });
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);

  } catch (error) {
    console.error('Error fetching thread status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Threads endpoint
app.get('/api/threads', async (req, res) => {
  try {
    const threads = await db.collection('threads')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json({ threads });

  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Thread endpoint
app.delete('/api/thread/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;

    const result = await db.collection('threads').deleteOne({ id: threadId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ success: true, message: 'Thread deleted successfully' });

  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Background thread generation
async function generateThreadAsync(threadId, apiKey, topic, style, threadLength, platform) {
  try {
    console.log(`Generating thread ${threadId}...`);

    // Call Python LLM service
    const result = await callLLMService(
      'generate_thread',
      apiKey,
      topic,
      style,
      threadLength.toString(),
      platform
    );

    if (result.success) {
      // Update database with generated thread
      await db.collection('threads').updateOne(
        { id: threadId },
        {
          $set: {
            status: 'completed',
            tweets: result.tweets,
            generated_at: result.generated_at,
            session_id: result.session_id,
            completedAt: new Date()
          }
        }
      );

      console.log(`Thread generation completed for ID: ${threadId}`);
    } else {
      // Update database with error
      await db.collection('threads').updateOne(
        { id: threadId },
        {
          $set: {
            status: 'failed',
            error: result.error,
            failedAt: new Date()
          }
        }
      );

      console.error(`Thread generation failed for ID: ${threadId}`, result.error);
    }

  } catch (error) {
    console.error(`Error generating thread ${threadId}:`, error);
    
    // Update database with error
    await db.collection('threads').updateOne(
      { id: threadId },
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

// ============================================================================
// END THREAD MAKER API ENDPOINTS  
// ============================================================================

// ============================================================================
// FUNNELS BUILDER API ENDPOINTS
// ============================================================================

// Create Funnel endpoint
app.post('/api/create-funnel', async (req, res) => {
  try {
    const { name, description, template = 'blank', category = 'general' } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Funnel name is required' });
    }

    // Generate funnel ID
    const funnelId = uuidv4();

    // Default funnel structure
    const funnelData = {
      id: funnelId,
      name: name.trim(),
      description: description?.trim() || '',
      template,
      category,
      status: 'draft',
      grapesJsData: getTemplateData(template),
      htmlContent: '',
      cssStyles: '',
      publishedUrl: null,
      subdomain: null,
      isPublished: false,
      analytics: {
        views: 0,
        conversions: 0,
        conversionRate: 0
      },
      seo: {
        title: name,
        description: description || `${name} - Landing Page`,
        keywords: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    await db.collection('funnels').insertOne(funnelData);

    res.json({
      success: true,
      funnel_id: funnelId,
      message: 'Funnel created successfully',
      funnel: funnelData
    });

  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Funnels endpoint
app.get('/api/funnels', async (req, res) => {
  try {
    const funnels = await db.collection('funnels')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    res.json({ funnels });

  } catch (error) {
    console.error('Error fetching funnels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Funnel by ID endpoint
app.get('/api/funnel/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const funnel = await db.collection('funnels').findOne({ id: funnelId });
    
    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json(funnel);

  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Funnel endpoint
app.put('/api/funnel/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    const { name, description, grapesJsData, htmlContent, cssStyles, seo } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    // Update fields if provided
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (grapesJsData) updateData.grapesJsData = grapesJsData;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (cssStyles !== undefined) updateData.cssStyles = cssStyles;
    if (seo) updateData.seo = { ...updateData.seo, ...seo };

    const result = await db.collection('funnels').updateOne(
      { id: funnelId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    // Get updated funnel
    const updatedFunnel = await db.collection('funnels').findOne({ id: funnelId });

    res.json({ 
      success: true, 
      message: 'Funnel updated successfully',
      funnel: updatedFunnel
    });

  } catch (error) {
    console.error('Error updating funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish Funnel endpoint
app.post('/api/funnel/:funnelId/publish', async (req, res) => {
  try {
    const { funnelId } = req.params;
    const { subdomain, customDomain } = req.body;

    const funnel = await db.collection('funnels').findOne({ id: funnelId });
    
    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    // Validate subdomain (basic validation)
    if (subdomain && !/^[a-zA-Z0-9-]+$/.test(subdomain)) {
      return res.status(400).json({ error: 'Invalid subdomain format' });
    }

    // Check if subdomain is already taken
    if (subdomain) {
      const existingFunnel = await db.collection('funnels').findOne({ 
        subdomain, 
        id: { $ne: funnelId } 
      });
      if (existingFunnel) {
        return res.status(400).json({ error: 'Subdomain already taken' });
      }
    }

    // Generate published URL
    const baseUrl = process.env.BASE_URL || 'https://your-app.com';
    const publishedUrl = subdomain 
      ? `https://${subdomain}.${baseUrl.replace('https://', '')}`
      : `${baseUrl}/f/${funnelId}`;

    // Update funnel with publication data
    await db.collection('funnels').updateOne(
      { id: funnelId },
      {
        $set: {
          isPublished: true,
          publishedUrl,
          subdomain: subdomain || null,
          customDomain: customDomain || null,
          publishedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Funnel published successfully',
      published_url: publishedUrl,
      subdomain: subdomain || null
    });

  } catch (error) {
    console.error('Error publishing funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unpublish Funnel endpoint
app.post('/api/funnel/:funnelId/unpublish', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const result = await db.collection('funnels').updateOne(
      { id: funnelId },
      {
        $set: {
          isPublished: false,
          publishedUrl: null,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json({
      success: true,
      message: 'Funnel unpublished successfully'
    });

  } catch (error) {
    console.error('Error unpublishing funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Funnel endpoint
app.delete('/api/funnel/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const result = await db.collection('funnels').deleteOne({ id: funnelId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json({ success: true, message: 'Funnel deleted successfully' });

  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate Funnel endpoint
app.post('/api/funnel/:funnelId/duplicate', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const originalFunnel = await db.collection('funnels').findOne({ id: funnelId });
    
    if (!originalFunnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    // Create duplicate
    const duplicateId = uuidv4();
    const duplicateFunnel = {
      ...originalFunnel,
      id: duplicateId,
      name: `${originalFunnel.name} (Copy)`,
      isPublished: false,
      publishedUrl: null,
      subdomain: null,
      customDomain: null,
      analytics: {
        views: 0,
        conversions: 0,
        conversionRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('funnels').insertOne(duplicateFunnel);

    res.json({
      success: true,
      message: 'Funnel duplicated successfully',
      funnel_id: duplicateId,
      funnel: duplicateFunnel
    });

  } catch (error) {
    console.error('Error duplicating funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Funnel Analytics endpoint
app.get('/api/funnel/:funnelId/analytics', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const funnel = await db.collection('funnels').findOne({ id: funnelId });
    
    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    // Mock analytics data (in a real app, you'd query an analytics service)
    const analytics = {
      ...funnel.analytics,
      traffic: {
        today: Math.floor(Math.random() * 100),
        thisWeek: Math.floor(Math.random() * 500),
        thisMonth: Math.floor(Math.random() * 2000)
      },
      sources: [
        { source: 'Direct', visits: Math.floor(Math.random() * 50), percentage: 35 },
        { source: 'Social Media', visits: Math.floor(Math.random() * 30), percentage: 28 },
        { source: 'Search', visits: Math.floor(Math.random() * 25), percentage: 22 },
        { source: 'Email', visits: Math.floor(Math.random() * 20), percentage: 15 }
      ],
      devices: [
        { device: 'Desktop', visits: Math.floor(Math.random() * 40), percentage: 52 },
        { device: 'Mobile', visits: Math.floor(Math.random() * 35), percentage: 38 },
        { device: 'Tablet', visits: Math.floor(Math.random() * 10), percentage: 10 }
      ]
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get template data
function getTemplateData(template) {
  const templates = {
    blank: {
      html: '<div id="wrapper"><div id="content">Start building your landing page...</div></div>',
      css: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; } #wrapper { max-width: 1200px; margin: 0 auto; } #content { padding: 40px; text-align: center; }'
    },
    business: {
      html: `
        <div id="wrapper">
          <header class="hero">
            <h1>Transform Your Business</h1>
            <p>Professional solutions for modern companies</p>
            <button class="cta-button">Get Started</button>
          </header>
          <section class="features">
            <div class="feature">
              <h3>Feature 1</h3>
              <p>Description of your first feature</p>
            </div>
            <div class="feature">
              <h3>Feature 2</h3>
              <p>Description of your second feature</p>
            </div>
            <div class="feature">
              <h3>Feature 3</h3>
              <p>Description of your third feature</p>
            </div>
          </section>
        </div>
      `,
      css: 'body { font-family: Arial, sans-serif; margin: 0; } .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; } .hero h1 { font-size: 3em; margin-bottom: 20px; } .cta-button { background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.2em; cursor: pointer; } .features { display: flex; padding: 60px 20px; max-width: 1200px; margin: 0 auto; } .feature { flex: 1; padding: 20px; text-align: center; }'
    },
    ecommerce: {
      html: `
        <div id="wrapper">
          <header class="hero">
            <h1>Amazing Product</h1>
            <p>The best solution you've been waiting for</p>
            <div class="price">$99 <span class="old-price">$149</span></div>
            <button class="cta-button">Buy Now</button>
          </header>
          <section class="benefits">
            <h2>Why Choose Us?</h2>
            <ul>
              <li>✓ 30-day money-back guarantee</li>
              <li>✓ Free shipping worldwide</li>
              <li>✓ 24/7 customer support</li>
            </ul>
          </section>
        </div>
      `,
      css: 'body { font-family: Arial, sans-serif; margin: 0; } .hero { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 80px 20px; text-align: center; } .price { font-size: 3em; font-weight: bold; color: #e74c3c; margin: 20px 0; } .old-price { text-decoration: line-through; color: #95a5a6; font-size: 0.6em; } .cta-button { background: #27ae60; color: white; padding: 20px 40px; border: none; border-radius: 5px; font-size: 1.5em; cursor: pointer; } .benefits { padding: 60px 20px; max-width: 800px; margin: 0 auto; } .benefits ul { list-style: none; font-size: 1.2em; }'
    }
  };

  return templates[template] || templates.blank;
}

// ============================================================================
// END FUNNELS BUILDER API ENDPOINTS
// ============================================================================

// ============================================================================
// SUPABASE AUTHENTICATION API ENDPOINTS
// ============================================================================

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Registration successful! Please check your email for verification.',
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    // Get the access token from Authorization header
    const accessToken = authHeader.replace('Bearer ', '');
    
    // Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
});

// Get user profile endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        updated_at: user.updated_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
});

// Password reset endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'Password reset email sent. Please check your email for further instructions.' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error during password reset' });
  }
});

// Update password endpoint
app.put('/api/auth/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Internal server error during password update' });
  }
});

// Middleware for protecting routes
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// ============================================================================
// END SUPABASE AUTHENTICATION API ENDPOINTS
// ============================================================================

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Videos directory: ${videosDir}`);
});