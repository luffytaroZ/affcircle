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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (videos)
app.use('/videos', express.static(path.join(__dirname, '../videos')));

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
  res.json({ message: 'Slideshow Generator API - Node.js Backend with Supabase' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    bundleReady: !!bundleLocation
  });
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

    // Create video record in Supabase
    const videoId = uuidv4();
    const { data, error } = await supabase
      .from('videos')
      .insert([{
        id: videoId,
        title,
        text: text || '',
        images: images || [],
        theme,
        duration,
        status: 'processing',
        output_location: null,
        error: null
      }])
      .select();

    if (error) {
      console.error('Error creating video record:', error);
      return res.status(500).json({ error: 'Database error' });
    }

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
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error || !video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const response = {
      id: video.id,
      title: video.title,
      theme: video.theme,
      duration: video.duration,
      status: video.status,
      createdAt: video.created_at
    };

    if (video.status === 'completed' && video.output_location) {
      response.videoUrl = `${req.protocol}://${req.get('host')}/videos/${path.basename(video.output_location)}`;
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
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching videos:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const videosWithUrls = videos.map(video => ({
      id: video.id,
      title: video.title,
      theme: video.theme,
      duration: video.duration,
      status: video.status,
      createdAt: video.created_at,
      videoUrl: video.status === 'completed' && video.output_location
        ? `${req.protocol}://${req.get('host')}/videos/${path.basename(video.output_location)}`
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
      console.log('Waiting for Remotion bundle...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const compositionId = getCompositionForTheme(videoData.theme);
    const outputPath = path.join(videosDir, `${videoId}.mp4`);

    console.log(`Rendering composition: ${compositionId}`);
    console.log(`Output path: ${outputPath}`);
    console.log(`Video data:`, videoData);

    // Render the video
    await renderMedia({
      composition: {
        id: compositionId,
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: videoData.duration * 30, // Convert seconds to frames
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        title: videoData.title,
        text: videoData.text,
        images: videoData.images,
        duration: videoData.duration
      },
      onProgress: (progress) => {
        console.log(`Rendering progress for ${videoId}: ${Math.round(progress.progress * 100)}%`);
      },
    });

    console.log(`Video generation completed for ID: ${videoId}`);

    // Update database with success
    const { error } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        output_location: outputPath
      })
      .eq('id', videoId);

    if (error) {
      console.error('Error updating video status:', error);
    }

  } catch (error) {
    console.error(`Error generating video ${videoId}:`, error);
    
    // Update database with error
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'failed',
        error: error.message
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Error updating video error status:', updateError);
    }
  }
}

// Helper function to get composition for theme
function getCompositionForTheme(theme) {
  const themeMap = {
    minimal: 'MinimalTheme',
    corporate: 'CorporateTheme',
    storytelling: 'StorytellingTheme',
    modern: 'ModernTheme',
    creative: 'CreativeTheme',
    professional: 'ProfessionalTheme',
    elegant: 'ElegantTheme',
    cinematic: 'CinematicTheme'
  };
  return themeMap[theme] || 'MinimalTheme';
}

// Thread Maker API Endpoints
app.post('/api/generate-thread', async (req, res) => {
  try {
    const { topic, style, thread_length, platform } = req.body;

    // Validate input
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!style || !['engaging', 'educational', 'storytelling', 'professional', 'viral'].includes(style)) {
      return res.status(400).json({ error: 'Style must be one of: engaging, educational, storytelling, professional, viral' });
    }

    if (!thread_length || thread_length < 1 || thread_length > 20) {
      return res.status(400).json({ error: 'Thread length must be between 1 and 20' });
    }

    if (!platform || !['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Platform must be one of: twitter, linkedin, instagram' });
    }

    // Generate thread ID
    const threadId = uuidv4();

    // Create thread record in Supabase
    const { data, error } = await supabase
      .from('threads')
      .insert([{
        id: threadId,
        topic,
        style,
        thread_length,
        platform,
        status: 'generating'
      }])
      .select();

    if (error) {
      console.error('Error creating thread record:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    // Generate thread in background
    generateThreadAsync(threadId, apiKey, topic, style, thread_length, platform);

    res.json({
      success: true,
      thread_id: threadId,
      message: 'Thread generation started'
    });

  } catch (error) {
    console.error('Error starting thread generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get thread status endpoint
app.get('/api/thread-status/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { data: thread, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error || !thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);

  } catch (error) {
    console.error('Error fetching thread status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all threads endpoint
app.get('/api/threads', async (req, res) => {
  try {
    const { data: threads, error } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching threads:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(threads);

  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete thread endpoint
app.delete('/api/thread/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      console.error('Error deleting thread:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true, message: 'Thread deleted successfully' });

  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Background thread generation function
async function generateThreadAsync(threadId, apiKey, topic, style, threadLength, platform) {
  try {
    console.log(`Starting thread generation for ID: ${threadId}`);

    // Call Python LLM service
    const pythonScript = path.join(__dirname, '../llm_service.py');
    const execAsync = util.promisify(require('child_process').exec);
    
    const command = `python "${pythonScript}" generate_thread "${apiKey}" "${topic}" "${style}" "${threadLength}" "${platform}"`;
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }
    
    console.log('Python script output:', stdout);
    
    try {
      const result = JSON.parse(stdout);
      
      if (result.success) {
        // Update database with generated thread
        const { error } = await supabase
          .from('threads')
          .update({
            status: 'completed',
            content: result.thread
          })
          .eq('id', threadId);

        if (error) {
          console.error('Error updating thread:', error);
        } else {
          console.log(`Thread generation completed for ID: ${threadId}`);
        }
      } else {
        // Update database with error
        const { error } = await supabase
          .from('threads')
          .update({
            status: 'failed',
            error: result.error || 'Unknown error'
          })
          .eq('id', threadId);

        if (error) {
          console.error('Error updating thread error status:', error);
        }
      }
    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      
      // Update database with error
      const { error } = await supabase
        .from('threads')
        .update({
          status: 'failed',
          error: 'Failed to parse thread generation result'
        })
        .eq('id', threadId);

      if (error) {
        console.error('Error updating thread error status:', error);
      }
    }

  } catch (error) {
    console.error(`Error generating thread ${threadId}:`, error);
    
    // Update database with error
    const { error: updateError } = await supabase
      .from('threads')
      .update({
        status: 'failed',
        error: error.message
      })
      .eq('id', threadId);

    if (updateError) {
      console.error('Error updating thread error status:', updateError);
    }
  }
}

// Funnel Builder API Endpoints
app.post('/api/funnels', async (req, res) => {
  try {
    const { name, description, templateId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const funnelId = uuidv4();
    const { data, error } = await supabase
      .from('funnels')
      .insert([{
        id: funnelId,
        name,
        description: description || '',
        template_id: templateId || 'basic',
        html_content: '',
        css_styles: '',
        published_url: null,
        subdomain: null,
        is_published: false,
        analytics: { views: 0, conversions: 0, conversionRate: 0 },
        seo: { 
          title: name,
          description: description || `${name} - Landing Page`,
          keywords: ''
        }
      }])
      .select();

    if (error) {
      console.error('Error creating funnel:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      success: true,
      funnel_id: funnelId,
      message: 'Funnel created successfully',
      funnel: data[0]
    });

  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all funnels endpoint
app.get('/api/funnels', async (req, res) => {
  try {
    const { data: funnels, error } = await supabase
      .from('funnels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching funnels:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(funnels);

  } catch (error) {
    console.error('Error fetching funnels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get funnel by ID endpoint
app.get('/api/funnels/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    const { data: funnel, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', funnelId)
      .single();

    if (error || !funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json(funnel);

  } catch (error) {
    console.error('Error fetching funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update funnel endpoint
app.put('/api/funnels/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;
    const { name, description, htmlContent, cssStyles, seo } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (htmlContent !== undefined) updateData.html_content = htmlContent;
    if (cssStyles !== undefined) updateData.css_styles = cssStyles;
    if (seo) updateData.seo = seo;

    const { error } = await supabase
      .from('funnels')
      .update(updateData)
      .eq('id', funnelId);

    if (error) {
      console.error('Error updating funnel:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const { data: updatedFunnel } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', funnelId)
      .single();

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

// Delete funnel endpoint
app.delete('/api/funnels/:funnelId', async (req, res) => {
  try {
    const { funnelId } = req.params;

    const { error } = await supabase
      .from('funnels')
      .delete()
      .eq('id', funnelId);

    if (error) {
      console.error('Error deleting funnel:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      success: true,
      message: 'Funnel deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Using Supabase as the database`);
});