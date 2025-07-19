import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const Navigation = () => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthMode('signin');
      setAuthModalOpen(true);
    }
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/95 backdrop-blur-md' : 'bg-black/90 backdrop-blur-sm'
        } border-b border-gray-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">AffRev</span>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative">
                <button
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>Explore</span>
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: isExploreOpen ? 180 : 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {isExploreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 border border-gray-700"
                    >
                      <button 
                        onClick={() => user ? navigate('/dashboard') : handleGetStarted()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        Dashboard
                      </button>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Analytics</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Campaigns</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <span>Features</span>
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: isFeaturesOpen ? 180 : 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                <AnimatePresence>
                  {isFeaturesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 border border-gray-700"
                    >
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Slideshow Generator</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">AI Marketing</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Analytics</a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button 
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </motion.button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
      />
    </>
  );
};

export default Navigation; 