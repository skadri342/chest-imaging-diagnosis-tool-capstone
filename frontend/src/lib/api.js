// src/lib/api.js
import axios from 'axios';

// Get environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'mediscan_auth_token';
const USER_STORAGE_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'mediscan_user';

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
export const authService = {
  login: async (email, password) => {
    try {
      // Validate email format
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      const response = await apiClient.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem(JWT_STORAGE_KEY, response.data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed. Please check your credentials.' };
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
      
      const response = await apiClient.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed. Please try again.' };
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
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.post(`${API_URL}/api/ml/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem(JWT_STORAGE_KEY)}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Image analysis failed. Please try again.' };
    }
  },
  
  getHistory: async () => {
    try {
      const response = await apiClient.get('/api/ml/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch history' };
    }
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