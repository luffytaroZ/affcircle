import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import SlideshowGenerator from '../components/SlideshowGenerator'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('slideshows')
  const [showSlideshowGenerator, setShowSlideshowGenerator] = useState(false)
  const [stats, setStats] = useState({
    totalSlideshows: 12,
    totalViews: 1247,
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
    { id: 2, title: 'Product Launch Video', type: 'Images', status: 'Processing', created: '2025-01-14', theme: 'Minimal', views: 89, thumbnail: '/api/placeholder/300/200' },
    { id: 3, title: 'Company Overview', type: 'Text', status: 'Draft', created: '2025-01-13', theme: 'Storytelling', views: 234, thumbnail: '/api/placeholder/300/200' },
    { id: 4, title: 'Social Media Stories', type: 'Images', status: 'Completed', created: '2025-01-12', theme: 'Minimal', views: 678, thumbnail: '/api/placeholder/300/200' },
    { id: 5, title: 'Brand Presentation', type: 'Text', status: 'Completed', created: '2025-01-11', theme: 'Corporate', views: 423, thumbnail: '/api/placeholder/300/200' },
  ]

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
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">AffRev</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-300">{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Create and manage your slideshow content</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'slideshows', label: 'My Slideshows', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
              { id: 'create', label: 'Create New', icon: 'M12 4v16m8-8H4' },
              { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            {activeTab === 'slideshows' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">My Slideshows</h2>
                  <motion.button
                    onClick={() => setActiveTab('create')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Slideshow</span>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {mockSlideshows.map((slideshow) => (
                    <motion.div
                      key={slideshow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-red-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            slideshow.theme === 'Corporate' ? 'bg-blue-600' :
                            slideshow.theme === 'Minimal' ? 'bg-gray-600' :
                            'bg-purple-600'
                          }`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{slideshow.title}</h3>
                            <p className="text-gray-400 text-sm">{slideshow.type} • {slideshow.theme} • Created {slideshow.created}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slideshow.status === 'Completed' ? 'bg-green-600/20 text-green-400' :
                            slideshow.status === 'Processing' ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {slideshow.status}
                          </span>
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Create New Slideshow</h2>
                <p className="text-gray-400 mb-8">Choose how you want to create your slideshow</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <motion.div
                    onClick={() => handleCreateSlideshow('text')}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 cursor-pointer hover:border-red-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Text to Slideshow</h3>
                    <p className="text-gray-400 text-sm">Convert your text content into engaging video slideshows</p>
                  </motion.div>

                  <motion.div
                    onClick={() => handleCreateSlideshow('images')}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 cursor-pointer hover:border-red-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Images to Slideshow</h3>
                    <p className="text-gray-400 text-sm">Upload images and create beautiful slideshow presentations</p>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Analytics</h2>
                <p className="text-gray-400">Track your slideshow performance and engagement metrics</p>
                <div className="mt-8 text-gray-500">
                  <p>Analytics coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slideshow Generator Modal */}
      {showSlideshowGenerator && (
        <SlideshowGenerator onClose={() => setShowSlideshowGenerator(false)} />
      )}
    </>
  )
}

export default Dashboard