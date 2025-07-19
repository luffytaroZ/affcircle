const { renderMedia } = require('@remotion/renderer');
const { supabase } = require('../config/database');
const { getBundleLocation } = require('../config/remotion');
const { v4: uuidv4 } = require('uuid');
const aiService = require('./aiService');
const path = require('path');
const fs = require('fs');

class VideoService {
  constructor() {
    this.videosDir = path.join(__dirname, '../../videos');
    this.ensureVideosDirectory();
  }

  ensureVideosDirectory() {
    if (!fs.existsSync(this.videosDir)) {
      fs.mkdirSync(this.videosDir, { recursive: true });
    }
  }

  async createVideo(videoData) {
    try {
      const { title, text, images, theme, duration, userId } = videoData;
      const videoId = uuidv4();

      // Insert into database
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          id: videoId,
          title,
          text: text || '',
          images: images || [],
          theme,
          duration,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Start video processing in background
      this.processVideoAsync(videoId, { 
        title, 
        text: text || '', 
        images: images || [], 
        theme, 
        duration
      });

      return { videoId, status: 'pending' };
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error('Failed to create video');
    }
  }

  async processVideoAsync(videoId, videoData) {
    try {
      // Update status to processing
      await this.updateVideoStatus(videoId, 'processing', 10);

      const bundleLocation = getBundleLocation();
      if (!bundleLocation) {
        throw new Error('Remotion bundle not ready');
      }

      const outputPath = path.join(this.videosDir, `${videoId}.mp4`);
      
      // Get theme composition
      const compositionId = this.getCompositionId(videoData.theme);
      
      await renderMedia({
        composition: {
          id: compositionId,
          width: 1920,
          height: 1080,
          fps: 30,
          durationInFrames: Math.round(videoData.duration * 30), // 30 fps
        },
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: {
          title: videoData.title,
          text: videoData.text || '',
          images: videoData.images || [],
          duration: videoData.duration
        },
        onProgress: ({ progress }) => {
          const progressPercent = Math.round(progress * 90) + 10; // 10-100%
          this.updateVideoStatus(videoId, 'processing', progressPercent);
        },
      });

      // Update status to completed
      await this.updateVideoStatus(videoId, 'completed', 100, outputPath);
      console.log(`✅ Video ${videoId} completed successfully`);

    } catch (error) {
      console.error(`❌ Error processing video ${videoId}:`, error);
      await this.updateVideoStatus(videoId, 'failed', 0, null, error.message);
    }
  }

  getCompositionId(theme) {
    const themeMap = {
      'minimal': 'MinimalTheme',
      'corporate': 'CorporateTheme',
      'storytelling': 'StorytellingTheme',
      'modern': 'ModernTheme',
      'creative': 'CreativeTheme',
      'professional': 'ProfessionalTheme',
      'elegant': 'ElegantTheme',
      'cinematic': 'CinematicTheme'
    };
    return themeMap[theme] || 'MinimalTheme';
  }

  async updateVideoStatus(videoId, status, progress, outputPath = null, errorMessage = null) {
    try {
      const updateData = {
        status
      };

      if (outputPath) {
        updateData.output_location = `/videos/${path.basename(outputPath)}`;
      }

      if (errorMessage) {
        updateData.error = errorMessage;
      }

      await supabase
        .from('videos')
        .update(updateData)
        .eq('id', videoId);
    } catch (error) {
      console.error('Error updating video status:', error);
    }
  }

  async getVideo(videoId) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }

  async listVideos(userId = null, limit = 50) {
    try {
      let query = supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Note: user_id column doesn't exist in current schema
      // if (userId) {
      //   query = query.eq('user_id', userId);
      // }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error listing videos:', error);
      return [];
    }
  }

  async deleteVideo(videoId) {
    try {
      // Get video info first
      const video = await this.getVideo(videoId);
      if (!video) throw new Error('Video not found');

      // Delete file if exists
      if (video.output_location) {
        const filePath = path.join(this.videosDir, path.basename(video.output_location));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
}

module.exports = new VideoService();