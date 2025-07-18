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
            name: file.name
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
      pollVideoStatus(videoId)

    } catch (error) {
      console.error('Error generating slideshow:', error)
      alert('Failed to generate slideshow: ' + error.message)
      setIsGenerating(false)
    }
  }

  const pollVideoStatus = async (videoId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/video-status/${videoId}`)
      const videoStatus = await response.json()

      if (videoStatus.status === 'completed') {
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
  }

  if (generatedSlideshow) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Slideshow Generated!</h2>
            <p className="text-gray-400 mb-6">Your slideshow has been successfully created</p>
            
            {/* Video Player */}
            {generatedSlideshow.videoUrl && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <video
                  controls
                  className="w-full max-w-2xl mx-auto rounded-lg"
                  poster="/api/placeholder/800/450"
                >
                  <source src={generatedSlideshow.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">{generatedSlideshow.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>Type: {generatedSlideshow.type}</div>
                <div>Theme: {generatedSlideshow.theme}</div>
                <div>Duration: {generatedSlideshow.duration}s</div>
                <div>Status: {generatedSlideshow.status}</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Another
              </button>
              <a
                href={generatedSlideshow.videoUrl}
                download={`${generatedSlideshow.title}.mp4`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
              >
                Download Video
              </a>
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Slideshow</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Slideshow Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slideshow Title
            </label>
            <input
              type="text"
              value={slideshowTitle}
              onChange={(e) => setSlideshowTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter slideshow title..."
              maxLength={100}
            />
          </div>

          {/* Input Type Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'text', label: 'Text to Slideshow', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
              { id: 'images', label: 'Images to Slideshow', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Input */}
          <div className="mb-6">
            {activeTab === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-40 resize-none"
                  placeholder="Enter the text content for your slideshow..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {textContent.length}/2000 characters
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Images
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-gray-300">Click to upload images</p>
                  <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB each</p>
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
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedTheme === theme.id
                      ? 'border-red-500 bg-red-600/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 ${theme.color} rounded-full mx-auto mb-2`}></div>
                  <h3 className="text-white font-medium">{theme.name}</h3>
                  <p className="text-gray-400 text-xs">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <div className="flex space-x-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    duration === d.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={generateSlideshow}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Generate Slideshow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SlideshowGenerator