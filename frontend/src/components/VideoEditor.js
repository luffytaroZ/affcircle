import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VideoEditor = ({ isOpen, onClose, videoData }) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const videoRef = useRef(null)
  
  const [editingOptions, setEditingOptions] = useState({
    trim: { start: 0, end: 30 },
    text: {
      content: 'Sample Text Overlay',
      position: { x: 50, y: 50 },
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial'
    },
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0
    },
    transitions: {
      fadeIn: true,
      fadeOut: true,
      slideDirection: 'left'
    },
    audio: {
      backgroundMusic: null,
      volume: 50,
      fadeInOut: true
    }
  })

  const [activeEditTab, setActiveEditTab] = useState('timeline')

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveEdit = () => {
    // Here you would send the editing data to the backend
    console.log('Saving edits:', editingOptions)
    alert('Video edits saved successfully!')
  }

  const handleExport = (format) => {
    // Here you would trigger the export process
    console.log('Exporting video in format:', format)
    alert(`Exporting video as ${format.toUpperCase()}...`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-2xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">Video Editor</h2>
              <p className="text-gray-400">{videoData?.title || 'Untitled Video'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all"
              >
                Save Changes
              </motion.button>
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

          <div className="flex flex-1 overflow-hidden">
            {/* Video Preview Area */}
            <div className="flex-1 flex flex-col p-6">
              {/* Video Player */}
              <div className="flex-1 bg-black rounded-xl relative overflow-hidden mb-4">
                {videoData?.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoData.videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <p>Video Preview</p>
                    </div>
                  </div>
                )}

                {/* Text Overlay Preview */}
                {editingOptions.text.content && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${editingOptions.text.position.x}%`,
                      top: `${editingOptions.text.position.y}%`,
                      fontSize: `${editingOptions.text.fontSize}px`,
                      color: editingOptions.text.color,
                      fontFamily: editingOptions.text.fontFamily,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {editingOptions.text.content}
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayPause}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </motion.button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div
                      className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
                      onClick={handleTimelineClick}
                    >
                      <div
                        className="h-2 bg-red-500 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                        <div className="absolute right-0 top-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-y-1/2 translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343a9 9 0 000 14.142m2.829-9.9a5 5 0 000 7.071" />
                    </svg>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-20 h-2 bg-gray-700 rounded-full appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Editing Panel */}
            <div className="w-80 border-l border-gray-700/50 flex flex-col">
              {/* Edit Tabs */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'text', label: 'Text', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                    { id: 'filters', label: 'Filters', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
                    { id: 'export', label: 'Export', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveEditTab(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                        activeEditTab === tab.id
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="text-xs">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Edit Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeEditTab === 'timeline' && (
                    <motion.div
                      key="timeline"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-white">Timeline</h3>
                      
                      {/* Trim Controls */}
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Trim Video</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-300">Start Time</label>
                            <input
                              type="number"
                              min="0"
                              max={duration}
                              value={editingOptions.trim.start}
                              onChange={(e) => setEditingOptions(prev => ({
                                ...prev,
                                trim: { ...prev.trim, start: Number(e.target.value) }
                              }))}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-300">End Time</label>
                            <input
                              type="number"
                              min="0"
                              max={duration}
                              value={editingOptions.trim.end}
                              onChange={(e) => setEditingOptions(prev => ({
                                ...prev,
                                trim: { ...prev.trim, end: Number(e.target.value) }
                              }))}
                              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Transitions */}
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Transitions</h4>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingOptions.transitions.fadeIn}
                              onChange={(e) => setEditingOptions(prev => ({
                                ...prev,
                                transitions: { ...prev.transitions, fadeIn: e.target.checked }
                              }))}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-300">Fade In</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingOptions.transitions.fadeOut}
                              onChange={(e) => setEditingOptions(prev => ({
                                ...prev,
                                transitions: { ...prev.transitions, fadeOut: e.target.checked }
                              }))}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-300">Fade Out</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeEditTab === 'text' && (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-white">Text Overlay</h3>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                        <div>
                          <label className="text-sm text-gray-300">Text Content</label>
                          <input
                            type="text"
                            value={editingOptions.text.content}
                            onChange={(e) => setEditingOptions(prev => ({
                              ...prev,
                              text: { ...prev.text, content: e.target.value }
                            }))}
                            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                            placeholder="Enter text overlay..."
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-300">Font Size</label>
                          <input
                            type="range"
                            min="12"
                            max="48"
                            value={editingOptions.text.fontSize}
                            onChange={(e) => setEditingOptions(prev => ({
                              ...prev,
                              text: { ...prev.text, fontSize: Number(e.target.value) }
                            }))}
                            className="w-full mt-1"
                          />
                          <span className="text-xs text-gray-400">{editingOptions.text.fontSize}px</span>
                        </div>

                        <div>
                          <label className="text-sm text-gray-300">Text Color</label>
                          <input
                            type="color"
                            value={editingOptions.text.color}
                            onChange={(e) => setEditingOptions(prev => ({
                              ...prev,
                              text: { ...prev.text, color: e.target.value }
                            }))}
                            className="w-full mt-1 h-10 rounded"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-300">Font Family</label>
                          <select
                            value={editingOptions.text.fontFamily}
                            onChange={(e) => setEditingOptions(prev => ({
                              ...prev,
                              text: { ...prev.text, fontFamily: e.target.value }
                            }))}
                            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-gray-300">Position</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <label className="text-xs text-gray-400">X (%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={editingOptions.text.position.x}
                                onChange={(e) => setEditingOptions(prev => ({
                                  ...prev,
                                  text: { ...prev.text, position: { ...prev.text.position, x: Number(e.target.value) } }
                                }))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Y (%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={editingOptions.text.position.y}
                                onChange={(e) => setEditingOptions(prev => ({
                                  ...prev,
                                  text: { ...prev.text, position: { ...prev.text.position, y: Number(e.target.value) } }
                                }))}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeEditTab === 'filters' && (
                    <motion.div
                      key="filters"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-white">Visual Filters</h3>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
                        {Object.entries(editingOptions.filters).map(([filter, value]) => (
                          <div key={filter}>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-sm text-gray-300 capitalize">{filter}</label>
                              <span className="text-xs text-gray-400">{value}{filter === 'blur' ? 'px' : '%'}</span>
                            </div>
                            <input
                              type="range"
                              min={filter === 'blur' ? '0' : '0'}
                              max={filter === 'blur' ? '10' : '200'}
                              value={value}
                              onChange={(e) => setEditingOptions(prev => ({
                                ...prev,
                                filters: { ...prev.filters, [filter]: Number(e.target.value) }
                              }))}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeEditTab === 'export' && (
                    <motion.div
                      key="export"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-bold text-white">Export Video</h3>
                      
                      <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
                        <h4 className="text-white font-medium">Export Formats</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { format: 'mp4', label: 'MP4 (Recommended)', description: 'Best compatibility', icon: '🎬' },
                            { format: 'webm', label: 'WebM', description: 'Web optimized', icon: '🌐' },
                            { format: 'gif', label: 'Animated GIF', description: 'Perfect for sharing', icon: '🎭' }
                          ].map((option) => (
                            <motion.button
                              key={option.format}
                              onClick={() => handleExport(option.format)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                            >
                              <span className="text-2xl mr-3">{option.icon}</span>
                              <div>
                                <div className="text-white font-medium">{option.label}</div>
                                <div className="text-gray-400 text-sm">{option.description}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-600">
                          <h4 className="text-white font-medium mb-3">Quality Settings</h4>
                          <div className="space-y-2">
                            {[
                              { quality: '1080p', label: '1080p HD', size: '~15MB' },
                              { quality: '720p', label: '720p HD', size: '~8MB' },
                              { quality: '480p', label: '480p SD', size: '~4MB' }
                            ].map((option) => (
                              <label key={option.quality} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                                <div className="flex items-center">
                                  <input type="radio" name="quality" className="mr-2" defaultChecked={option.quality === '720p'} />
                                  <span className="text-white text-sm">{option.label}</span>
                                </div>
                                <span className="text-gray-400 text-xs">{option.size}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default VideoEditor