import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs-preset-webpage'
import 'grapesjs-blocks-basic'
import 'grapesjs-preset-newsletter'
import 'grapesjs-component-countdown'

const FunnelBuilder = ({ onBack }) => {
  const [funnels, setFunnels] = useState([])
  const [currentFunnel, setCurrentFunnel] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newFunnelData, setNewFunnelData] = useState({
    name: '',
    description: '',
    template: 'blank',
    category: 'general'
  })
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)

  // Backend URL with fallback
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'

  // Fetch funnels on component mount
  useEffect(() => {
    fetchFunnels()
  }, [])

  const fetchFunnels = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/funnels`)
      if (response.ok) {
        const data = await response.json()
        setFunnels(data.funnels || [])
      }
    } catch (error) {
      console.error('Error fetching funnels:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFunnel = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/create-funnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFunnelData),
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels([...funnels, data.funnel])
        setNewFunnelData({ name: '', description: '', template: 'blank', category: 'general' })
        setShowCreateModal(false)
      } else {
        console.error('Failed to create funnel')
      }
    } catch (error) {
      console.error('Error creating funnel:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFunnel = async (funnelId) => {
    if (!window.confirm('Are you sure you want to delete this funnel?')) return

    try {
      const response = await fetch(`${BACKEND_URL}/api/funnel/${funnelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFunnels(funnels.filter(f => f.id !== funnelId))
      }
    } catch (error) {
      console.error('Error deleting funnel:', error)
    }
  }

  const editFunnel = (funnel) => {
    setCurrentFunnel(funnel)
    setShowEditor(true)
  }

  const publishFunnel = async (funnelId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/funnel/${funnelId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: `funnel-${funnelId.substring(0, 8)}`
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels(funnels.map(f => 
          f.id === funnelId 
            ? { ...f, isPublished: true, publishedUrl: data.funnel.publishedUrl }
            : f
        ))
      }
    } catch (error) {
      console.error('Error publishing funnel:', error)
    }
  }

  const duplicateFunnel = async (funnelId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/funnel/${funnelId}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels([...funnels, data.funnel])
      }
    } catch (error) {
      console.error('Error duplicating funnel:', error)
    }
  }

  // Initialize GrapesJS editor
  useEffect(() => {
    if (showEditor && editorRef.current && !editor) {
      const grapesEditor = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: 'auto',
        plugins: ['gjs-preset-webpage', 'gjs-blocks-basic', 'gjs-preset-newsletter', 'gjs-component-countdown'],
        pluginsOpts: {
          'gjs-preset-webpage': {
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
          },
        },
        storageManager: false,
        canvas: {
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
          ],
        },
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '768px',
            },
          ]
        },
        panels: {
          defaults: [
            {
              id: 'layers',
              el: '.panel__right',
              resizable: {
                maxDim: 350,
                minDim: 200,
                tc: 0,
                cl: 1,
                cr: 0,
                bc: 0,
                keyWidth: 'flex-basis',
              },
            },
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [
                {
                  id: 'show-layers',
                  active: true,
                  label: 'Layers',
                  command: 'show-layers',
                  togglable: false,
                },
                {
                  id: 'show-style',
                  active: true,
                  label: 'Styles',
                  command: 'show-styles',
                  togglable: false,
                }
              ],
            }
          ]
        },
        layerManager: {
          appendTo: '.layers-container'
        },
        selectorManager: {
          appendTo: '.styles-container'
        },
        styleManager: {
          appendTo: '.styles-container',
          sectors: [
            {
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'min-height', 'padding'],
              properties: [
                {
                  type: 'integer',
                  name: 'The width',
                  property: 'width',
                  units: ['px', '%'],
                  defaults: 'auto',
                  min: 0,
                }
              ]
            },
            {
              name: 'Extra',
              open: false,
              buildProps: ['background-color', 'box-shadow', 'custom-prop'],
              properties: [
                {
                  id: 'custom-prop',
                  name: 'Custom Label',
                  property: 'font-size',
                  type: 'select',
                  defaults: '32px',
                  options: [
                    { value: '12px', name: 'Tiny' },
                    { value: '18px', name: 'Medium' },
                    { value: '32px', name: 'Big' },
                  ],
                }
              ]
            }
          ]
        },
        blockManager: {
          appendTo: '.blocks-container',
          blocks: [
            {
              id: 'section',
              label: '<b>Section</b>',
              attributes: { class: 'gjs-block-section' },
              content: `<section>
                <h1>This is a simple title</h1>
                <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
              </section>`,
            },
            {
              id: 'text',
              label: 'Text',
              content: '<div data-gjs-type="text">Insert your text here</div>',
            },
            {
              id: 'image',
              label: 'Image',
              select: true,
              content: { type: 'image' },
              activate: true,
            },
            {
              id: 'hero',
              label: 'Hero Section',
              content: `
                <section style="padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
                  <h1 style="font-size: 3em; margin-bottom: 20px;">Your Amazing Headline</h1>
                  <p style="font-size: 1.2em; margin-bottom: 30px;">Describe your product or service with compelling copy</p>
                  <button style="background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.2em; cursor: pointer;">Get Started</button>
                </section>
              `
            },
            {
              id: 'features',
              label: 'Features',
              content: `
                <section style="padding: 60px 20px;">
                  <h2 style="text-align: center; margin-bottom: 40px;">Features</h2>
                  <div style="display: flex; max-width: 1200px; margin: 0 auto;">
                    <div style="flex: 1; padding: 20px; text-align: center;">
                      <h3>Feature One</h3>
                      <p>Description of your first amazing feature</p>
                    </div>
                    <div style="flex: 1; padding: 20px; text-align: center;">
                      <h3>Feature Two</h3>
                      <p>Description of your second amazing feature</p>
                    </div>
                    <div style="flex: 1; padding: 20px; text-align: center;">
                      <h3>Feature Three</h3>
                      <p>Description of your third amazing feature</p>
                    </div>
                  </div>
                </section>
              `
            }
          ]
        },
      })

      // Load funnel content if editing existing funnel
      if (currentFunnel && currentFunnel.content) {
        grapesEditor.setComponents(currentFunnel.content.html || '')
        grapesEditor.setStyle(currentFunnel.content.css || '')
      }

      setEditor(grapesEditor)
    }

    return () => {
      if (editor) {
        editor.destroy()
        setEditor(null)
      }
    }
  }, [showEditor, currentFunnel])

  const saveFunnel = async () => {
    if (!editor || !currentFunnel) return

    try {
      setLoading(true)
      const html = editor.getHtml()
      const css = editor.getCss()
      
              const response = await fetch(`${BACKEND_URL}/api/funnel/${currentFunnel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: { html, css },
          lastModified: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFunnels(funnels.map(f => f.id === currentFunnel.id ? data.funnel : f))
        alert('Funnel saved successfully!')
      }
    } catch (error) {
      console.error('Error saving funnel:', error)
      alert('Error saving funnel')
    } finally {
      setLoading(false)
    }
  }

  const previewFunnel = () => {
    if (!editor) return
    const html = editor.getHtml()
    const css = editor.getCss()
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${currentFunnel?.name || 'Funnel Preview'}</title>
          <style>${css}</style>
        </head>
        <body>${html}</body>
      </html>
    `
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const templates = [
    { id: 'blank', name: 'Blank', description: 'Start from scratch' },
    { id: 'landing', name: 'Landing Page', description: 'Standard landing page template' },
    { id: 'ecommerce', name: 'E-commerce', description: 'Product sales page' },
    { id: 'sales', name: 'Sales Page', description: 'High-converting sales funnel' },
  ]

  if (showEditor) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Editor Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setShowEditor(false)
                setCurrentFunnel(null)
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Funnels</span>
            </button>
            <h1 className="text-xl font-bold">{currentFunnel?.name}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={previewFunnel}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Preview
            </button>
            <button
              onClick={saveFunnel}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Blocks */}
          <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col">
            <div className="p-4 bg-gray-200 border-b border-gray-300">
              <h3 className="font-semibold text-gray-800">Blocks</h3>
            </div>
            <div className="blocks-container flex-1 p-2"></div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            <div ref={editorRef} className="flex-1"></div>
          </div>

          {/* Right Panel - Layers & Styles */}
          <div className="w-64 bg-gray-100 border-l border-gray-300 flex flex-col">
            <div className="panel__switcher bg-gray-200 border-b border-gray-300"></div>
            <div className="layers-container flex-1 p-2"></div>
            <div className="styles-container flex-1 p-2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Funnel Builder
          </h1>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Funnel</span>
        </motion.button>
      </motion.div>

      {/* Funnels Grid */}
      {loading && funnels.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {funnels.map((funnel) => (
            <motion.div
              key={funnel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{funnel.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{funnel.description}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      funnel.isPublished 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {funnel.isPublished ? 'Published' : 'Draft'}
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                      {funnel.template}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => editFunnel(funnel)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => duplicateFunnel(funnel.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Copy
                </button>
                {!funnel.isPublished ? (
                  <button
                    onClick={() => publishFunnel(funnel.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Publish
                  </button>
                ) : (
                  <a
                    href={funnel.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm text-center"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => deleteFunnel(funnel.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  Created: {new Date(funnel.createdAt).toLocaleDateString()}
                </div>
                {funnel.analytics && (
                  <div className="text-xs text-gray-400 mt-1">
                    Views: {funnel.analytics.views} | Conversions: {funnel.analytics.conversions}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {funnels.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-white mb-4">No funnels yet</h3>
          <p className="text-gray-400 mb-6">Create your first funnel to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl"
          >
            Create Your First Funnel
          </button>
        </motion.div>
      )}

      {/* Create Funnel Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Funnel</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Funnel Name
                  </label>
                  <input
                    type="text"
                    value={newFunnelData.name}
                    onChange={(e) => setNewFunnelData({...newFunnelData, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="My Awesome Funnel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFunnelData.description}
                    onChange={(e) => setNewFunnelData({...newFunnelData, description: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Describe your funnel..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Template
                  </label>
                  <select
                    value={newFunnelData.template}
                    onChange={(e) => setNewFunnelData({...newFunnelData, template: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createFunnel}
                  disabled={!newFunnelData.name || loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Funnel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FunnelBuilder