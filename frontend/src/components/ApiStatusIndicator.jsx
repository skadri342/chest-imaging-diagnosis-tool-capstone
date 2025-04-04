import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState('loading');
  const [latency, setLatency] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.2.132:8000';

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setStatus('loading');
        const startTime = Date.now();
        
        const response = await axios.get(`${API_URL}/test`, {
          timeout: 5000
        });
        
        const endTime = Date.now();
        setLatency(endTime - startTime);
        
        if (response.status === 200) {
          setStatus('online');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('API Status Check Error:', error);
        setStatus('offline');
      }
    };

    // Check immediately and then every 30 seconds
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, [API_URL]);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="font-medium">API:</div>
      <div className="flex items-center">
        {status === 'loading' && (
          <>
            <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
            <span className="ml-1 text-yellow-600">Checking...</span>
          </>
        )}
        {status === 'online' && (
          <>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="ml-1 text-green-700">Online {latency && `(${latency}ms)`}</span>
          </>
        )}
        {status === 'offline' && (
          <>
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="ml-1 text-red-700">Offline</span>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <span className="ml-1 text-orange-700">Error</span>
          </>
        )}
      </div>
    </div>
  );
}