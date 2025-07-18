import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ThreadMaker = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('engaging');
  const [threadLength, setThreadLength] = useState(5);
  const [platform, setPlatform] = useState('twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentThread, setCurrentThread] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Load saved threads on component mount
  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/threads`);
      setThreads(response.data.threads || []);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setCurrentThread(null);
    setCopySuccess('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate-thread`, {
        topic,
        style,
        thread_length: threadLength,
        platform
      });

      if (response.data.success) {
        const threadId = response.data.thread_id;
        
        // Poll for thread completion
        pollThreadStatus(threadId);
      } else {
        console.error('Thread generation failed:', response.data.error);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating thread:', error);
      setIsGenerating(false);
    }
  };

  const pollThreadStatus = async (threadId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/thread-status/${threadId}`);
      const thread = response.data;

      if (thread.status === 'completed') {
        setCurrentThread(thread);
        setIsGenerating(false);
        loadThreads(); // Refresh the threads list
      } else if (thread.status === 'failed') {
        console.error('Thread generation failed:', thread.error);
        setIsGenerating(false);
      } else {
        // Still generating, poll again in 2 seconds
        setTimeout(() => pollThreadStatus(threadId), 2000);
      }
    } catch (error) {
      console.error('Error checking thread status:', error);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatThreadForCopy = (tweets) => {
    return tweets.map((tweet, index) => 
      `${index + 1}/${tweets.length} ${tweet.content}`
    ).join('\n\n');
  };

  const styles = [
    { value: 'engaging', label: 'Engaging', description: 'Conversational and interactive' },
    { value: 'educational', label: 'Educational', description: 'Teaching and informative' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative and personal' },
    { value: 'professional', label: 'Professional', description: 'Business and formal' },
    { value: 'viral', label: 'Viral', description: 'Trending and shareable' }
  ];

  const platforms = [
    { value: 'twitter', label: 'Twitter/X', emoji: '🐦', limit: '280 chars' },
    { value: 'linkedin', label: 'LinkedIn', emoji: '💼', limit: '3000 chars' },
    { value: 'instagram', label: 'Instagram', emoji: '📸', limit: '2200 chars' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          🧵 Thread Maker
        </h2>
        <p className="text-gray-400">Generate engaging social media threads with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Create Thread</h3>
            
            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic or Idea
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to create a thread about?"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <div className="grid grid-cols-1 gap-2">
                {platforms.map((p) => (
                  <motion.button
                    key={p.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPlatform(p.value)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      platform === p.value
                        ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                        : 'bg-gray-900/30 border-gray-600/30 text-gray-300 hover:border-gray-500/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="font-medium">{p.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{p.limit}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {styles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} - {s.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Thread Length */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thread Length: {threadLength} posts
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={threadLength}
                onChange={(e) => setThreadLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3</span>
                <span>15</span>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Thread 🚀'
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Thread Display */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentThread && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Generated Thread</h3>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(formatThreadForCopy(currentThread.tweets))}
                      className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all"
                    >
                      📋 Copy All
                    </motion.button>
                  </div>
                </div>

                {copySuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-center border border-green-500/30"
                  >
                    {copySuccess}
                  </motion.div>
                )}

                <div className="space-y-4">
                  {currentThread.tweets?.map((tweet, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/50 border border-gray-600/50 rounded-xl p-4 hover:border-gray-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                              {index + 1}/{currentThread.tweets.length}
                            </span>
                            <span className="text-xs text-gray-400">
                              {tweet.character_count} chars
                            </span>
                          </div>
                          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {tweet.content}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(`${index + 1}/${currentThread.tweets.length} ${tweet.content}`)}
                          className="opacity-0 group-hover:opacity-100 ml-4 text-gray-400 hover:text-gray-200 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-600/30">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Thread Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                    <div>Topic: {currentThread.topic}</div>
                    <div>Style: {currentThread.style}</div>
                    <div>Platform: {currentThread.platform}</div>
                    <div>Generated: {new Date(currentThread.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Threads */}
          {threads.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Recent Threads</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {threads.map((thread) => (
                  <motion.div
                    key={thread.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-4 cursor-pointer hover:border-gray-500/50 transition-all"
                    onClick={() => setCurrentThread(thread)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-200 truncate">
                        {thread.topic}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        thread.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : thread.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {thread.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{thread.platform} • {thread.style}</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadMaker;