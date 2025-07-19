const { spawn } = require('child_process');
const { supabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class ThreadService {
  async createThread(threadData) {
    try {
      const { topic, style = 'educational', thread_length = 5, platform = 'twitter', userId } = threadData;
      const threadId = uuidv4();

      // Insert into database
      const { data, error } = await supabase
        .from('threads')
        .insert([{
          id: threadId,
          topic,
          style,
          thread_length,
          platform,
          status: 'pending',
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Start thread processing in background
      this.processThreadAsync(threadId, { topic, style, thread_length, platform });

      return { threadId, status: 'pending' };
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create thread');
    }
  }

  async processThreadAsync(threadId, threadData) {
    try {
      // Update status to processing
      await this.updateThreadStatus(threadId, 'processing', 25);

      const pythonScriptPath = path.join(__dirname, '../..', 'llm_service_enhanced.py');
      
      const pythonProcess = spawn('python3', [
        pythonScriptPath,
        threadData.topic,
        threadData.style,
        threadData.thread_length.toString(),
        threadData.platform
      ]);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
        // Update progress
        this.updateThreadStatus(threadId, 'processing', 50);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code === 0) {
          try {
            // Parse the generated content
            const content = JSON.parse(outputData.trim());
            
            // Update thread with generated content
            await this.updateThreadStatus(threadId, 'completed', 100, content);
            console.log(`✅ Thread ${threadId} completed successfully`);
          } catch (parseError) {
            console.error('Error parsing thread content:', parseError);
            await this.updateThreadStatus(threadId, 'failed', 0, null, 'Failed to parse generated content');
          }
        } else {
          console.error(`❌ Thread generation failed with code ${code}:`, errorData);
          await this.updateThreadStatus(threadId, 'failed', 0, null, errorData || 'Unknown error');
        }
      });

    } catch (error) {
      console.error(`❌ Error processing thread ${threadId}:`, error);
      await this.updateThreadStatus(threadId, 'failed', 0, null, error.message);
    }
  }

  async updateThreadStatus(threadId, status, progress, content = null, errorMessage = null) {
    try {
      const updateData = {
        status,
        progress
      };

      if (content) {
        updateData.content = JSON.stringify(content);
      }

      if (errorMessage) {
        updateData.error = errorMessage;
      }

      await supabase
        .from('threads')
        .update(updateData)
        .eq('id', threadId);
    } catch (error) {
      console.error('Error updating thread status:', error);
    }
  }

  async getThread(threadId) {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }

  async listThreads(userId = null, limit = 50) {
    try {
      let query = supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error listing threads:', error);
      return [];
    }
  }

  async deleteThread(threadId) {
    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }
}

module.exports = new ThreadService();