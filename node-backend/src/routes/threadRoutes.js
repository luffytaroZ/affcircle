const express = require('express');
const router = express.Router();
const threadService = require('../services/threadService');
const authService = require('../services/authService');
const { validateThreadData } = require('../middleware/validation');

// Get all threads
router.get('/threads', async (req, res) => {
  try {
    const threads = await threadService.listThreads();
    res.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// Generate new thread
router.post('/generate-thread', validateThreadData, async (req, res) => {
  try {
    const { topic, style, thread_length, platform } = req.body;
    const userId = req.user?.id || null; // Optional user ID if authenticated

    const result = await threadService.createThread({
      topic,
      style: style || 'educational',
      thread_length: thread_length || 5,
      platform: platform || 'twitter',
      userId
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating thread:', error);
    res.status(500).json({ error: 'Failed to generate thread' });
  }
});

// Get thread status
router.get('/thread-status/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await threadService.getThread(threadId);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      id: thread.id,
      topic: thread.topic,
      style: thread.style,
      platform: thread.platform,
      status: thread.status,
      progress: thread.progress || 0,
      content: thread.content,
      error_message: thread.error_message,
      created_at: thread.created_at,
      updated_at: thread.updated_at
    });
  } catch (error) {
    console.error('Error fetching thread status:', error);
    res.status(500).json({ error: 'Failed to fetch thread status' });
  }
});

// Delete thread
router.delete('/thread/:threadId', authService.verifyToken, async (req, res) => {
  try {
    const { threadId } = req.params;
    await threadService.deleteThread(threadId);
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// Get user's threads (protected route)
router.get('/my-threads', authService.verifyToken, async (req, res) => {
  try {
    const threads = await threadService.listThreads(req.user.id);
    res.json(threads);
  } catch (error) {
    console.error('Error fetching user threads:', error);
    res.status(500).json({ error: 'Failed to fetch user threads' });
  }
});

module.exports = router;