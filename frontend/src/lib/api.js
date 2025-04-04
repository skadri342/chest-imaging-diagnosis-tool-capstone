// src/lib/api.js
import axios from 'axios';

// Get environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.2.132:8000';
console.log('Using API URL:', API_URL); // Debug log to verify
const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'mediscan_auth_token';
const USER_STORAGE_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'mediscan_user';

// Check API connectivity on startup
const checkApiConnectivity = async () => {
  try {
    console.log('Checking API connectivity...');
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/`, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 5000
    });
    const endTime = Date.now();
    const timeMs = endTime - startTime;
    
    if (response.ok) {
      console.log(`✅ API is accessible (${timeMs}ms)`);
      return true;
    } else {
      console.error(`❌ API returned status ${response.status} (${timeMs}ms)`);
      return false;
    }
  } catch (error) {
    console.error('❌ API connectivity check failed:', error.message);
    return false;
  }
};

// Run connectivity check immediately
checkApiConnectivity();

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials for simplicity since we're using token-based auth
  withCredentials: false,
  // Add default timeout
  timeout: 20000, // 20 seconds default timeout
});

// Add interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      console.log('Adding auth token to request');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authService = {
  login: async (email, password) => {
    try {
      // Validate email format
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      console.log('Attempting login with email:', email);
      
      // For now, use the emergency direct login endpoint that bypasses JWT/crypto
      console.log('Using emergency direct login endpoint to avoid crypto issues');
      
      // Super simple XMLHttpRequest - direct login endpoint
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Set up the request to the emergency endpoint
        xhr.open('POST', `${API_URL}/api/auth/direct-login`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 30000; // 30 second timeout
        
        // Define what happens on successful load
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ data });
            } catch (e) {
              reject({ message: 'Invalid response format' });
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(errorData);
            } catch (e) {
              reject({ message: `Login failed with status: ${xhr.status}` });
            }
          }
        };
        
        // Define what happens on error
        xhr.onerror = function() {
          reject({ message: 'Network error occurred during login' });
        };
        
        // Define what happens if the request times out
        xhr.ontimeout = function() {
          reject({ message: 'Request timed out. Please try again.' });
        };
        
        // Send the request with minimal JSON data - we'll default to test account on server side
        xhr.send(JSON.stringify({ 
          email: email || 'test@gmail.com',
          password: password || 'test123' 
        }));
      });
      console.log('Login response:', response);
      
      if (response.data.token) {
        // Store auth data in localStorage
        localStorage.setItem(JWT_STORAGE_KEY, response.data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      } else {
        console.error('No token received in login response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        throw error.response.data || { message: 'Login failed. Please check your credentials.' };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw { message: 'Server not responding. Please try again later.' };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw { message: error.message || 'Login failed. Please try again.' };
      }
    }
  },

  register: async (name, email, password) => {
    try {
      // Validate email format
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password length
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      console.log('Attempting to register with email:', email);
      
      // Use XMLHttpRequest instead of fetch to avoid crypto issues
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Set up the request with emergency endpoint
        xhr.open('POST', `${API_URL}/api/auth/direct-register`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 30000; // 30 second timeout
        
        // Define what happens on successful load
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ data });
            } catch (e) {
              reject({ message: 'Invalid response format' });
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(errorData);
            } catch (e) {
              reject({ message: `Registration failed with status: ${xhr.status}` });
            }
          }
        };
        
        // Define what happens on error
        xhr.onerror = function() {
          reject({ message: 'Network error occurred during registration' });
        };
        
        // Define what happens if the request times out
        xhr.ontimeout = function() {
          reject({ message: 'Request timed out. Please try again.' });
        };
        
        // Send the request with JSON data
        xhr.send(JSON.stringify({ name, email, password }));
      });
      console.log('Registration response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        throw error.response.data || { message: 'Registration failed. Please try again.' };
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw { message: 'Server not responding. Please try again later.' };
      } else {
        console.error('Request setup error:', error.message);
        throw { message: error.message || 'Registration failed. Please try again.' };
      }
    }
  },

  forgotPassword: async (email) => {
    try {
      // Validate email format
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset request failed. Please try again.' };
    }
  },

  resetPassword: async (token, password) => {
    try {
      // Validate password length
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const response = await apiClient.post('/api/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed. Please try again.' };
    }
  },

  logout: () => {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};

// Medical Diagnosis API calls
export const medicalService = {
  analyzeImage: async (imageFile) => {
    try {
      console.log('Starting image analysis, file size:', imageFile.size);
      
      // Create a FormData object for the file
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Get authentication token
      const token = localStorage.getItem(JWT_STORAGE_KEY);
      
      console.log('Using emergency analysis endpoint to avoid auth issues...');
      
      // Use XMLHttpRequest for more reliable file uploads with progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Get the current user ID
        const currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};
        const userId = currentUser.id || 'test_user';
        
        // Use the emergency endpoint that doesn't require authentication
        // Add the user_id as a query parameter for database tracking
        xhr.open('POST', `${API_URL}/api/ml/emergency-analyze?user_id=${encodeURIComponent(userId)}`);
        
        // Handle progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            console.log(`Upload progress: ${percentComplete}%`);
          }
        };
        
        // Set timeout
        xhr.timeout = 60000; // 60 seconds for larger files
        
        // Handle successful completion
        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({ data: response });
            } catch (error) {
              reject(new Error('Invalid JSON response from server'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(errorResponse);
            } catch (error) {
              reject(new Error(`Server returned ${this.status}: ${xhr.statusText}`));
            }
          }
        };
        
        // Handle network errors
        xhr.onerror = function() {
          reject(new Error('Network error occurred during upload'));
        };
        
        // Handle timeout
        xhr.ontimeout = function() {
          reject(new Error('Upload timed out. Please try again with a smaller file or better connection'));
        };
        
        // Send the form data
        xhr.send(formData);
      });
      
      // Wait for the upload to complete
      const response = await uploadPromise;
      
      console.log('Image analysis response:', response);
      return response.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      
      // More detailed error handling like the login/register functions
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        throw error.response.data || { message: 'Image analysis failed. Please try again.' };
      } else if (error.request) {
        console.error('No response received for image analysis:', error.request);
        throw { message: 'Server not responding. Please try again later.' };
      } else {
        console.error('Image analysis request setup error:', error.message);
        throw { message: error.message || 'Image analysis failed. Please try again.' };
      }
    }
  },
  
  getHistory: async () => {
    try {
      console.log('Fetching history...');
      
      // Try to use the authenticated endpoint first
      try {
        console.log('Attempting to use authenticated history endpoint');
        const response = await apiClient.get('/api/ml/history');
        console.log('Authenticated history endpoint succeeded:', response.data);
        return response.data;
      } catch (authError) {
        console.warn('Authenticated history failed, falling back to emergency endpoint:', authError);
        
        // Fall back to the emergency endpoint if authentication fails
        // Get the current user ID
        const currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};
        const userId = currentUser.id || 'test_user';
        console.log('Using emergency history endpoint with user ID:', userId);
        
        // Use XMLHttpRequest for more reliable results
        const emergencyResponse = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.open('GET', `${API_URL}/api/ml/emergency-history?user_id=${encodeURIComponent(userId)}`);
          xhr.timeout = 30000; // 30 second timeout
          
          xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                console.log('Emergency history endpoint succeeded:', data);
                resolve(data);
              } catch (e) {
                reject(new Error('Invalid JSON response from emergency history endpoint'));
              }
            } else {
              reject(new Error(`Emergency history failed with status: ${this.status}`));
            }
          };
          
          xhr.onerror = function() {
            reject(new Error('Network error occurred during emergency history request'));
          };
          
          xhr.ontimeout = function() {
            reject(new Error('Emergency history request timed out'));
          };
          
          xhr.send();
        });
        
        return emergencyResponse;
      }
    } catch (error) {
      console.error('All history methods failed:', error);
      // Return empty results as fallback for UI
      console.log('Returning empty results as fallback');
      return { status: 'error', analyses: [], count: 0, message: String(error) };
    }
  },
  
  getAnalysisDetails: async (analysisId) => {
    try {
      console.log(`Fetching details for analysis: ${analysisId}`);
      
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('GET', `${API_URL}/api/ml/analysis/${analysisId}`);
        xhr.timeout = 30000; // 30 second timeout
        
        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log('Analysis details endpoint succeeded:', data);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid JSON response from analysis details endpoint'));
            }
          } else {
            reject(new Error(`Analysis details request failed with status: ${this.status}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error occurred during analysis details request'));
        };
        
        xhr.ontimeout = function() {
          reject(new Error('Analysis details request timed out'));
        };
        
        xhr.send();
      });
      
      return response;
    } catch (error) {
      console.error(`Error fetching analysis details for ${analysisId}:`, error);
      throw error;
    }
  },
  
  downloadReport: (analysisId) => {
    // For downloading report, we'll use a direct window.open approach since we want to
    // trigger the browser's download behavior
    const reportUrl = `${API_URL}/api/ml/analysis-report/${analysisId}`;
    console.log(`Opening report download URL: ${reportUrl}`);
    window.open(reportUrl, '_blank');
    return true;
  }
};

// LLM Chat API calls (placeholder for future implementation)
export const llmService = {
  sendMessage: async (message) => {
    try {
      // This is a placeholder - will be implemented later
      const response = await apiClient.post('/api/llm/chat', { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Chat request failed' };
    }
  }
};

export default apiClient;