import React, { useState, useEffect } from "react";

// Navigation Component
export const Navigation = () => {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">AffRev</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => setIsExploreOpen(!isExploreOpen)}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center space-x-1"
              >
                <span>Explore</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExploreOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 border border-gray-700">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Dashboard</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Analytics</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Campaigns</a>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center space-x-1"
              >
                <span>Features</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isFeaturesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 border border-gray-700">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">AI Marketing</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Automation</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">Analytics</a>
                </div>
              )}
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
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
    </nav>
  );
};

// Hero Component
export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* AI Badge */}
        <div className="inline-flex items-center space-x-2 bg-red-600/20 border border-red-600/30 rounded-full px-4 py-2 mb-8">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-red-400 text-sm font-medium">AI Powered Marketing</span>
        </div>

        {/* Main Headlines */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-white">All your affiliate tools,</span>
            <br />
            <span className="text-white">finally </span>
            <span className="text-red-500">in one place.</span>
          </h1>

          <div className="mt-8 space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Creating </span>
              <span className="text-red-500">smarter</span>
              <br />
              <span className="text-white">marketing solutions.</span>
            </h2>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          An affiliate marketing platform that actually helps you
          <br />
          scale and cares about marketers.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2">
            <span>Sign Up</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2">
            <span>Get Started</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Countdown Timer Component
export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 11,
    minutes: 25,
    seconds: 23
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative py-20 bg-black">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-red-500 mb-4">AffRev Release</h2>
        <p className="text-gray-300 mb-12">Launching July 19th at 1PM BST</p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-w-[120px]">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Days</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-w-[120px]">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Hours</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-w-[120px]">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Minutes</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-w-[120px]">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Preview Component
export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('workflows');

  return (
    <div className="relative py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900/70 border-r border-gray-700 p-4">
              <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">AffRev</span>
              </div>

              <nav className="space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">ACTIVITY</div>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Performance</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Affiliate</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Admin Panel</span>
                </a>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Staff Panel</span>
                </a>

                <div className="text-xs text-gray-400 uppercase tracking-wide mb-3 mt-6">TOOLS</div>
                <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Integrations</span>
                </a>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
                    </svg>
                    <span>Workflows</span>
                  </h2>
                  <p className="text-gray-400">Connect, watch and post to your accounts.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Create Slideshows
                  </button>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workflow Cards */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">JB</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">JBusiness</h3>
                      <p className="text-gray-400 text-sm">@jbusiness</p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">Connected platforms and status indicators</div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">WP</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">WebsitePay</h3>
                      <p className="text-gray-400 text-sm">@websitepay</p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">Payment processing and affiliate tracking</div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  + Add Platform
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5zM12 4.2L19 7.5v8.5c0 4.18-3.35 7.5-7 7.5s-7-3.32-7-7.5V7.5l7-3.3z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">AffRev</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 AffRev. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};