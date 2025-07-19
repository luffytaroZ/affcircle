const express = require('express');
const router = express.Router();
const videoService = require('../services/videoService');
const authService = require('../services/authService');
const { validateSlideshowData } = require('../middleware/validation');

// Get all videos
router.get('/videos', async (req, res) => {
  try {
    const videos = await videoService.listVideos();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Generate new slideshow
router.post('/generate-slideshow', validateSlideshowData, async (req, res) => {
  try {
    const { title, text, images, theme, duration } = req.body;
    const userId = req.user?.id || null; // Optional user ID if authenticated

    const result = await videoService.createVideo({
      title,
      text,
      images,
      theme,
      duration,
      userId
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating slideshow:', error);
    res.status(500).json({ error: 'Failed to generate slideshow' });
  }
});

// Get video status
router.get('/video-status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoService.getVideo(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Construct full URL for video downloads
    const backendUrl = process.env.BACKEND_URL || 'https://583cf182-02fd-44b5-810f-1005bc946497.preview.emergentagent.com';
    const fullVideoUrl = video.output_location ? `${backendUrl}${video.output_location}` : null;

    res.json({
      id: video.id,
      title: video.title,
      status: video.status,
      progress: 0, // Default progress since column doesn't exist
      output_url: video.output_location,
      videoUrl: fullVideoUrl, // Full URL for frontend compatibility
      error_message: video.error,
      created_at: video.created_at,
      updated_at: video.updated_at
    });
  } catch (error) {
    console.error('Error fetching video status:', error);
    res.status(500).json({ error: 'Failed to fetch video status' });
  }
});

// Delete video
router.delete('/video/:videoId', authService.verifyToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    await videoService.deleteVideo(videoId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Get user's videos (protected route)
router.get('/my-videos', authService.verifyToken, async (req, res) => {
  try {
    const videos = await videoService.listVideos(req.user.id);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ error: 'Failed to fetch user videos' });
  }
});

module.exports = router;