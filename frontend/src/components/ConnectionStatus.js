import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    backendInfo: null,
    lastChecked: null,
    retryCount: 0
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const CHECK_INTERVAL = 10000; // Check every 10 seconds
  const MAX_RETRIES = 3;

  const checkConnection = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setConnectionStatus(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await fetch(`${BACKEND_URL}/api/connection-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      setConnectionStatus({
        connected: true,
        loading: false,
        error: null,
        backendInfo: data,
        lastChecked: new Date(),
        retryCount: 0
      });

    } catch (error) {
      console.error('Backend connection error:', error);
      
      setConnectionStatus(prev => ({
        connected: false,
        loading: false,
        error: error.message,
        backendInfo: null,
        lastChecked: new Date(),
        retryCount: prev.retryCount + 1
      }));
    }
  };

  const retryConnection = () => {
    if (connectionStatus.retryCount < MAX_RETRIES) {
      checkConnection(true);
    }
  };

  const getBackendUrl = () => {
    if (connectionStatus.backendInfo?.serverUrl) {
      return connectionStatus.backendInfo.serverUrl;
    }
    return BACKEND_URL;
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Auto-retry logic
  useEffect(() => {
    if (!connectionStatus.connected && connectionStatus.retryCount < MAX_RETRIES) {
      const retryTimeout = setTimeout(() => {
        retryConnection();
      }, 2000 * (connectionStatus.retryCount + 1)); // Exponential backoff

      return () => clearTimeout(retryTimeout);
    }
  }, [connectionStatus.connected, connectionStatus.retryCount]);

  if (connectionStatus.loading && connectionStatus.retryCount === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <div>
            <h3 className="text-blue-800 font-medium">Connecting to Backend...</h3>
            <p className="text-blue-600 text-sm">Checking server connection</p>
          </div>
        </div>
      </div>
    );
  }

  if (!connectionStatus.connected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-red-800 font-medium">Backend Connection Lost</h3>
            <div className="text-red-700 text-sm mt-1">
              <p>Cannot connect to backend server at: <code className="bg-red-100 px-1 rounded">{getBackendUrl()}</code></p>
              <p className="mt-1"><strong>Error:</strong> {connectionStatus.error}</p>
              
              <div className="mt-3 p-3 bg-red-100 rounded border">
                <p className="font-medium text-red-800 mb-2">🔧 How to fix this:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Make sure the backend is running: <code className="bg-white px-1 rounded">yarn start</code></li>
                  <li>Check if backend is on a different port (look for console output)</li>
                  <li>Update <code className="bg-white px-1 rounded">REACT_APP_BACKEND_URL</code> in your .env file</li>
                  <li>Restart this frontend after backend is running</li>
                </ol>
              </div>

              {connectionStatus.retryCount < MAX_RETRIES && (
                <div className="mt-3">
                  <button
                    onClick={retryConnection}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Retry Connection ({connectionStatus.retryCount + 1}/{MAX_RETRIES})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected - show success status (minimized)
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="text-green-800 text-sm font-medium">
              ✅ Backend Connected
            </p>
          </div>
        </div>
        <div className="text-xs text-green-600">
          Port: {connectionStatus.backendInfo?.serverPort} | 
          Last checked: {connectionStatus.lastChecked?.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 