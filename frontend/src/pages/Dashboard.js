import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import SlideshowGenerator from '../components/SlideshowGenerator'
import ThreadMaker from '../components/ThreadMaker'
import UserProfile from '../components/UserProfile'
import VideoAnalytics from '../components/VideoAnalytics'
import VideoEditor from '../components/VideoEditor'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('slideshows')
  const [showSlideshowGenerator, setShowSlideshowGenerator] = useState(false)
  const [showThreadMaker, setShowThreadMaker] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showVideoAnalytics, setShowVideoAnalytics] = useState(false)
  const [showVideoEditor, setShowVideoEditor] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [stats, setStats] = useState({
    totalSlideshows: 12,
    totalViews: 1247,
    totalThreads: 8,
    completedToday: 3,
    processingCount: 1
  })

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalViews: prev.totalViews + Math.floor(Math.random() * 5)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleCreateSlideshow = (type) => {
    setShowSlideshowGenerator(true)
  }

  const mockSlideshows = [
    { id: 1, title: 'Marketing Campaign Q4', type: 'Text', status: 'Completed', created: '2025-01-15', theme: 'Corporate', views: 145, thumbnail: '/api/placeholder/300/200' },
    { id: 2, title: 'Product Launch Video', type: 'Images', status: 'Processing', created: '2025-01-14', theme: 'Modern', views: 89, thumbnail: '/api/placeholder/300/200' },
    { id: 3, title: 'Company Overview', type: 'Text', status: 'Draft', created: '2025-01-13', theme: 'Storytelling', views: 234, thumbnail: '/api/placeholder/300/200' },
    { id: 4, title: 'Creative Portfolio', type: 'Images', status: 'Completed', created: '2025-01-12', theme: 'Creative', views: 678, thumbnail: '/api/placeholder/300/200' },
    { id: 5, title: 'Executive Summary', type: 'Text', status: 'Completed', created: '2025-01-11', theme: 'Professional', views: 423, thumbnail: '/api/placeholder/300/200' },
    { id: 6, title: 'Wedding Highlights', type: 'Images', status: 'Completed', created: '2025-01-10', theme: 'Elegant', views: 891, thumbnail: '/api/placeholder/300/200' },
    { id: 7, title: 'Movie Trailer', type: 'Images', status: 'Processing', created: '2025-01-09', theme: 'Cinematic', views: 0, thumbnail: '/api/placeholder/300/200' },
  ]

  // Helper function to get theme colors
  const getThemeColor = (theme) => {
    const themeColors = {
      'Corporate': 'bg-blue-500/20 text-blue-400',
      'Minimal': 'bg-gray-500/20 text-gray-400', 
      'Storytelling': 'bg-purple-500/20 text-purple-400',
      'Modern': 'bg-teal-500/20 text-teal-400',
      'Creative': 'bg-pink-500/20 text-pink-400',
      'Professional': 'bg-indigo-500/20 text-indigo-400',
      'Elegant': 'bg-rose-500/20 text-rose-400',
      'Cinematic': 'bg-amber-500/20 text-amber-400'
    }
    return themeColors[theme] || 'bg-gray-500/20 text-gray-400'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
                  </svg>
                </motion.div>
                <div>
                  <span className="text-xl font-bold text-white">AffRev</span>
                  <div className="text-xs text-gray-400">Dashboard</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Stats Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden md:flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700/50"
                >
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-400">{stats.totalSlideshows}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="w-px h-6 bg-gray-700"></div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">{stats.totalViews}</div>
                    <div className="text-xs text-gray-400">Views</div>
                  </div>
                </motion.div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowUserProfile(true)}
                    className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-white">{user?.email}</div>
                    <div className="text-xs text-gray-400">Premium User</div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-400 text-lg">Create amazing slideshows and track your content performance</p>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { title: 'Total Slideshows', value: stats.totalSlideshows, icon: '🎬', color: 'from-blue-500 to-purple-600', change: '+12%' },
              { title: 'Total Views', value: stats.totalViews, icon: '👁️', color: 'from-green-500 to-teal-600', change: '+23%' },
              { title: 'Total Threads', value: stats.totalThreads, icon: '🧵', color: 'from-orange-500 to-red-600', change: '+15%' },
              { title: 'Processing', value: stats.processingCount, icon: '⏳', color: 'from-purple-500 to-pink-600', change: '-2%' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative overflow-hidden"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{stat.icon}</div>
                    <div className="text-xs text-green-400 font-medium">{stat.change}</div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.title}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex space-x-1 mb-8"
          >
            {[
              { id: 'slideshows', label: 'My Slideshows', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', count: stats.totalSlideshows },
              { id: 'threads', label: 'Thread Maker', icon: 'M7 8h10m-10 4h4m6 0h-6m2 4h4', count: stats.totalThreads },
              { id: 'create', label: 'Create New', icon: 'M12 4v16m8-8H4', count: null },
              { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', count: stats.totalViews },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="font-medium">{tab.label}</span>
                {tab.count && (
                  <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Content Area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'slideshows' && (
                <motion.div
                  key="slideshows"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">My Slideshows</h2>
                    <motion.button
                      onClick={() => setActiveTab('create')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-red-500/25"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>New Slideshow</span>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockSlideshows.map((slideshow) => (
                      <motion.div
                        key={slideshow.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-gray-600/50 transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                          <div className="absolute top-3 left-3 z-20">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              slideshow.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              slideshow.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {slideshow.status}
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 z-20">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getThemeColor(slideshow.theme)}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-white/80">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="text-sm">{slideshow.views}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                            {slideshow.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                              <span>{slideshow.type}</span>
                              <span>•</span>
                              <span>{slideshow.theme}</span>
                            </div>
                            <span>{slideshow.created}</span>
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedVideo(slideshow)
                                setShowVideoEditor(true)
                              }}
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                              title="Edit Video"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                              title="Preview"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                              title="Download"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                              title="More Options"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="text-center py-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Create New Slideshow</h2>
                    <p className="text-gray-400 mb-12 text-lg">Choose how you want to create your slideshow</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                      <motion.div
                        onClick={() => handleCreateSlideshow('text')}
                        whileHover={{ scale: 1.05, y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 cursor-pointer hover:border-blue-400/50 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">Text to Slideshow</h3>
                          <p className="text-gray-400 mb-6">Convert your text content into engaging video slideshows with AI-powered visuals</p>
                          <div className="flex items-center justify-center space-x-2 text-blue-400">
                            <span className="text-sm font-medium">Get Started</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        onClick={() => handleCreateSlideshow('images')}
                        whileHover={{ scale: 1.05, y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 cursor-pointer hover:border-purple-400/50 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">Images to Slideshow</h3>
                          <p className="text-gray-400 mb-6">Upload your images and create beautiful slideshow presentations with smooth transitions</p>
                          <div className="flex items-center justify-center space-x-2 text-purple-400">
                            <span className="text-sm font-medium">Get Started</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'threads' && (
                <motion.div
                  key="threads"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <ThreadMaker />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h2>
                    <p className="text-gray-400 mb-8 text-lg">Track your video performance and audience insights</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                      {[
                        { title: 'Total Views', value: stats.totalViews, icon: '👁️', trend: '+23%' },
                        { title: 'Avg. Watch Time', value: '2:34', icon: '⏱️', trend: '+12%' },
                        { title: 'Engagement Rate', value: '78%', icon: '❤️', trend: '+8%' }
                      ].map((metric, index) => (
                        <motion.div
                          key={metric.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                        >
                          <div className="text-3xl mb-2">{metric.icon}</div>
                          <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                          <div className="text-sm text-gray-400 mb-2">{metric.title}</div>
                          <div className="text-xs text-green-400 font-medium">{metric.trend} this month</div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="max-w-2xl mx-auto"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowVideoAnalytics(true)}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center space-x-3 mx-auto shadow-lg shadow-green-500/25"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Open Advanced Analytics</span>
                      </motion.button>
                      
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mt-8">
                        <h3 className="text-xl font-bold text-white mb-4">Premium Features</h3>
                        <ul className="space-y-2 text-left text-gray-400">
                          <li className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>Real-time view tracking & engagement metrics</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Detailed audience demographics & geography</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Performance insights & trend analysis</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span>Custom reports & data export</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Slideshow Generator Modal */}
      {showSlideshowGenerator && (
        <SlideshowGenerator onClose={() => setShowSlideshowGenerator(false)} />
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile 
          isOpen={showUserProfile} 
          onClose={() => setShowUserProfile(false)} 
        />
      )}

      {/* Video Analytics Modal */}
      {showVideoAnalytics && (
        <VideoAnalytics 
          isOpen={showVideoAnalytics} 
          onClose={() => setShowVideoAnalytics(false)} 
        />
      )}

      {/* Video Editor Modal */}
      {showVideoEditor && selectedVideo && (
        <VideoEditor 
          isOpen={showVideoEditor} 
          onClose={() => {
            setShowVideoEditor(false)
            setSelectedVideo(null)
          }}
          videoData={selectedVideo}
        />
      )}
    </>
  )
}

export default Dashboard