import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SlideshowGenerator = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('text')
  const [selectedTheme, setSelectedTheme] = useState('minimal')
  const [duration, setDuration] = useState(30)
  const [textContent, setTextContent] = useState('')
  const [images, setImages] = useState([])
  const [slideshowTitle, setSlideshowTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSlideshow, setGeneratedSlideshow] = useState(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const themes = [
    { 
      id: 'minimal', 
      name: 'Minimal', 
      color: 'from-gray-500 to-gray-600',
      gradient: 'from-gray-500/20 to-gray-600/20',
      border: 'border-gray-500/30',
      description: 'Clean and simple design with elegant typography',
      preview: '🎨'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      description: 'Professional business style with modern layouts',
      preview: '💼'
    },
    { 
      id: 'storytelling', 
      name: 'Storytelling', 
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30',
      description: 'Narrative-focused layout with emotional appeal',
      preview: '📖'
    },
    { 
      id: 'modern', 
      name: 'Modern', 
      color: 'from-teal-500 to-teal-600',
      gradient: 'from-teal-500/20 to-teal-600/20',
      border: 'border-teal-500/30',
      description: 'Contemporary design with bold visuals and clean lines',
      preview: '✨'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      color: 'from-pink-500 to-pink-600',
      gradient: 'from-pink-500/20 to-pink-600/20',
      border: 'border-pink-500/30',
      description: 'Artistic and vibrant with unique visual elements',
      preview: '🎭'
    },
    { 
      id: 'professional', 
      name: 'Professional', 
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-500/20 to-indigo-600/20',
      border: 'border-indigo-500/30',
      description: 'Sophisticated and refined for executive presentations',
      preview: '🏆'
    },
    { 
      id: 'elegant', 
      name: 'Elegant', 
      color: 'from-rose-500 to-rose-600',
      gradient: 'from-rose-500/20 to-rose-600/20',
      border: 'border-rose-500/30',
      description: 'Luxurious and refined with subtle animations',
      preview: '💎'
    },
    { 
      id: 'cinematic', 
      name: 'Cinematic', 
      color: 'from-amber-500 to-amber-600',
      gradient: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/30',
      description: 'Movie-like experience with dramatic transitions',
      preview: '🎬'
    },
  ]

  const durations = [
    { value: 15, label: '15 seconds', description: 'Quick & snappy' },
    { value: 30, label: '30 seconds', description: 'Perfect balance' },
    { value: 60, label: '60 seconds', description: 'Detailed story' },
  ]

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = []

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push({
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name,
            size: file.size
          })
          
          if (newImages.length === files.length) {
            setImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const generateSlideshow = async () => {
    if (!slideshowTitle.trim()) {
      alert('Please enter a slideshow title')
      return
    }

    if (activeTab === 'text' && !textContent.trim()) {
      alert('Please enter some text content')
      return
    }

    if (activeTab === 'images' && images.length === 0) {
      alert('Please upload at least one image')
      return
    }

    setIsGenerating(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 500)

    try {
      // Prepare the data for the API
      const videoData = {
        title: slideshowTitle,
        text: activeTab === 'text' ? textContent : '',
        images: activeTab === 'images' ? images.map(img => img.url) : [],
        theme: selectedTheme,
        duration: duration
      }

      // Call the Node.js backend API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-slideshow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate slideshow')
      }

      // Start polling for video status
      const videoId = result.videoId
      clearInterval(progressInterval)
      setProgress(95)
      pollVideoStatus(videoId)

    } catch (error) {
      console.error('Error generating slideshow:', error)
      alert('Failed to generate slideshow: ' + error.message)
      setIsGenerating(false)
      setProgress(0)
      clearInterval(progressInterval)
    }
  }

  const pollVideoStatus = async (videoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/video-status/${videoId}`)
      const videoStatus = await response.json()

      if (videoStatus.status === 'completed') {
        setProgress(100)
        const generatedSlideshow = {
          id: videoStatus.id,
          title: videoStatus.title,
          type: activeTab,
          theme: videoStatus.theme,
          duration: videoStatus.duration,
          status: 'completed',
          videoUrl: videoStatus.videoUrl,
          createdAt: videoStatus.createdAt,
        }
        setGeneratedSlideshow(generatedSlideshow)
        setIsGenerating(false)
      } else if (videoStatus.status === 'failed') {
        throw new Error(videoStatus.error || 'Video generation failed')
      } else {
        // Still processing, poll again after 3 seconds
        setTimeout(() => pollVideoStatus(videoId), 3000)
      }
    } catch (error) {
      console.error('Error checking video status:', error)
      alert('Failed to check video status: ' + error.message)
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const resetForm = () => {
    setSlideshowTitle('')
    setTextContent('')
    setImages([])
    setGeneratedSlideshow(null)
    setActiveTab('text')
    setSelectedTheme('minimal')
    setDuration(30)
    setProgress(0)
  }

  // Enhanced success state
  if (generatedSlideshow) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-3"
            >
              🎉 Slideshow Created!
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8 text-lg"
            >
              Your slideshow has been generated successfully
            </motion.p>
            
            {/* Video Player */}
            {generatedSlideshow.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8"
              >
                <video
                  controls
                  className="w-full max-w-3xl mx-auto rounded-xl shadow-lg"
                  poster="/api/placeholder/800/450"
                >
                  <source src={generatedSlideshow.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </motion.div>
            )}
            
            {/* Slideshow Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-4">{generatedSlideshow.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-400">Type</div>
                  <div className="text-white font-medium">{generatedSlideshow.type}</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-400">Theme</div>
                  <div className="text-white font-medium">{generatedSlideshow.theme}</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-400">Duration</div>
                  <div className="text-white font-medium">{generatedSlideshow.duration}s</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-400">Status</div>
                  <div className="text-green-400 font-medium">{generatedSlideshow.status}</div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Another</span>
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={generatedSlideshow.videoUrl}
                download={`${generatedSlideshow.title}.mp4`}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Video</span>
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Back to Dashboard</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Enhanced loading state
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Generating Slideshow</h2>
            <p className="text-gray-400 mb-6">Please wait while we create your video...</p>
            
            {/* Progress Bar */}
            <div className="bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-red-500 to-pink-500"
              />
            </div>
            
            <div className="text-sm text-gray-400">
              {progress < 30 && "Analyzing content..."}
              {progress >= 30 && progress < 60 && "Generating scenes..."}
              {progress >= 60 && progress < 90 && "Rendering video..."}
              {progress >= 90 && "Finalizing..."}
            </div>
            
            <div className="text-lg font-bold text-white mt-2">{Math.round(progress)}%</div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-3xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Slideshow</h2>
              <p className="text-gray-400">Transform your content into engaging videos</p>
            </div>
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

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { step: 1, label: 'Content', active: true },
                { step: 2, label: 'Theme', active: selectedTheme },
                { step: 3, label: 'Generate', active: slideshowTitle && (textContent || images.length > 0) }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    item.active 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {item.step}
                  </div>
                  <div className="ml-2 text-sm text-gray-400">{item.label}</div>
                  {index < 2 && <div className="w-8 h-px bg-gray-700 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Slideshow Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Slideshow Title *
            </label>
            <input
              type="text"
              value={slideshowTitle}
              onChange={(e) => setSlideshowTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="Enter an engaging title for your slideshow..."
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">
                {slideshowTitle.length}/100 characters
              </div>
              {slideshowTitle.length > 0 && (
                <div className="text-xs text-green-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Title added
                </div>
              )}
            </div>
          </motion.div>

          {/* Input Type Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Content Type *
            </label>
            <div className="flex space-x-2">
              {[
                { id: 'text', label: 'Text to Slideshow', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', description: 'Convert text into visual stories' },
                { id: 'images', label: 'Images to Slideshow', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', description: 'Create from your images' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs opacity-80">{tab.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Input */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'text' ? (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Text Content *
                  </label>
                  <div className="relative">
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-40 resize-none transition-all"
                      placeholder="Enter your text content here. Be creative and engaging - this will be transformed into a visual story..."
                      maxLength={2000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                      {textContent.length}/2000
                    </div>
                  </div>
                  {textContent.length > 0 && (
                    <div className="mt-2 text-xs text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Content added ({textContent.split(' ').length} words)
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Upload Images *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-500 hover:bg-gray-800/20 transition-all group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-gray-500 group-hover:to-gray-600 transition-all"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.div>
                    <p className="text-gray-300 text-lg font-medium mb-2">Click to upload images</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB each • Multiple files supported</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {images.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Uploaded Images ({images.length})</h4>
                        <div className="text-xs text-green-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ready to generate
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-xl border border-gray-600"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(image.id)
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              {Math.round(image.size / 1024)}KB
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Theme Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose Theme * <span className="text-xs text-gray-500">({themes.length} themes available)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    selectedTheme === theme.id
                      ? `border-red-500 bg-gradient-to-br ${theme.gradient} shadow-lg`
                      : `${theme.border} hover:border-gray-500 bg-gradient-to-br ${theme.gradient} hover:shadow-md`
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-10 h-10 bg-gradient-to-r ${theme.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-xl shadow-md`}>
                      {theme.preview}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{theme.name}</h3>
                    <p className="text-gray-400 text-xs leading-tight">{theme.description}</p>
                  </div>
                  {selectedTheme === theme.id && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Duration Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Video Duration *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {durations.map((d) => (
                <motion.button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl transition-all ${
                    duration === d.value
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">{d.label}</div>
                    <div className="text-sm opacity-80">{d.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <motion.button
              onClick={generateSlideshow}
              disabled={!slideshowTitle.trim() || (activeTab === 'text' && !textContent.trim()) || (activeTab === 'images' && images.length === 0)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center space-x-3 shadow-lg shadow-red-500/25 disabled:shadow-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Generate Slideshow</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default SlideshowGenerator