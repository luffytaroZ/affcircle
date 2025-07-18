import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VideoAnalytics = ({ isOpen, onClose }) => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('views')
  
  // Mock analytics data - in real app, this would come from API
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 12473,
    totalWatchTime: 18652, // minutes
    avgWatchTime: 145, // seconds
    engagementRate: 78.5,
    topVideos: [
      { id: 1, title: 'Marketing Campaign Q4', views: 2341, watchTime: 3456, engagement: 85.2 },
      { id: 2, title: 'Product Launch Video', views: 1987, watchTime: 2876, engagement: 82.1 },
      { id: 3, title: 'Company Overview', views: 1654, watchTime: 2234, engagement: 79.8 },
      { id: 4, title: 'Creative Portfolio', views: 1432, watchTime: 1987, engagement: 77.3 },
      { id: 5, title: 'Executive Summary', views: 1298, watchTime: 1765, engagement: 76.1 }
    ],
    viewsOverTime: [
      { date: '2025-01-12', views: 234, engagement: 78 },
      { date: '2025-01-13', views: 345, engagement: 82 },
      { date: '2025-01-14', views: 456, engagement: 75 },
      { date: '2025-01-15', views: 567, engagement: 88 },
      { date: '2025-01-16', views: 432, engagement: 79 },
      { date: '2025-01-17', views: 398, engagement: 84 },
      { date: '2025-01-18', views: 521, engagement: 91 }
    ],
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 22 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 28 },
        { range: '45-54', percentage: 12 },
        { range: '55+', percentage: 3 }
      ],
      geography: [
        { country: 'United States', percentage: 45 },
        { country: 'United Kingdom', percentage: 18 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Germany', percentage: 7 },
        { country: 'Others', percentage: 10 }
      ]
    },
    deviceTypes: [
      { type: 'Desktop', percentage: 52 },
      { type: 'Mobile', percentage: 38 },
      { type: 'Tablet', percentage: 10 }
    ]
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        totalViews: prev.totalViews + Math.floor(Math.random() * 5)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    } else {
      return `${remainingMinutes}m`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-3xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Video Analytics</h2>
              <p className="text-gray-400">Track your video performance and audience insights</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: 'Total Views', 
                value: analyticsData.totalViews.toLocaleString(), 
                change: '+12.5%', 
                icon: '👁️',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                title: 'Watch Time', 
                value: formatDuration(analyticsData.totalWatchTime), 
                change: '+8.3%', 
                icon: '⏱️',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                title: 'Avg. Duration', 
                value: formatWatchTime(analyticsData.avgWatchTime), 
                change: '+5.7%', 
                icon: '📊',
                color: 'from-purple-500 to-violet-500'
              },
              { 
                title: 'Engagement', 
                value: `${analyticsData.engagementRate}%`, 
                change: '+2.1%', 
                icon: '❤️',
                color: 'from-red-500 to-pink-500'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all cursor-pointer"
                onClick={() => setSelectedMetric(metric.title.toLowerCase().replace(' ', ''))}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${metric.color} rounded-t-2xl`}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{metric.icon}</div>
                  <div className="text-xs text-green-400 font-medium">{metric.change}</div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.title}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Views Over Time Chart */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Views Over Time</h3>
              <div className="relative h-64">
                {/* Simple Chart Visualization */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-full">
                  {analyticsData.viewsOverTime.map((data, index) => {
                    const height = (data.views / Math.max(...analyticsData.viewsOverTime.map(d => d.views))) * 100
                    return (
                      <motion.div
                        key={data.date}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-t from-red-500 to-pink-500 rounded-t-lg flex-1 mx-1 min-h-[20px] relative group"
                        style={{ maxWidth: '40px' }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.views} views<br />{data.engagement}% engagement
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between transform translate-y-6">
                  {analyticsData.viewsOverTime.map((data) => (
                    <span key={data.date} className="text-xs text-gray-400 transform -rotate-45 origin-left">
                      {new Date(data.date).getMonth() + 1}/{new Date(data.date).getDate()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Videos */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Top Videos</h3>
              <div className="space-y-4">
                {analyticsData.topVideos.slice(0, 5).map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{video.title}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{video.views.toLocaleString()} views</span>
                        <span>{video.engagement}% engagement</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics and Device Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Age Demographics */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Age Groups</h3>
              <div className="space-y-4">
                {analyticsData.demographics.ageGroups.map((group, index) => (
                  <div key={group.range} className="flex items-center justify-between">
                    <span className="text-gray-300">{group.range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${group.percentage}%` }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-white font-medium w-8">{group.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geography */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Geography</h3>
              <div className="space-y-4">
                {analyticsData.demographics.geography.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="text-gray-300">{country.country}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${country.percentage}%` }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-white font-medium w-8">{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Types */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Devices</h3>
              <div className="space-y-6">
                {analyticsData.deviceTypes.map((device, index) => (
                  <motion.div
                    key={device.type}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-2">
                      {device.type === 'Desktop' ? '💻' : device.type === 'Mobile' ? '📱' : '📱'}
                    </div>
                    <div className="text-2xl font-bold text-white">{device.percentage}%</div>
                    <div className="text-sm text-gray-400">{device.type}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="flex justify-between items-center">
              <div className="text-gray-400">
                <p className="text-sm">Last updated: {new Date().toLocaleString()}</p>
              </div>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export PDF</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Generate Report</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default VideoAnalytics