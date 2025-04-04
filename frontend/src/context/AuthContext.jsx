// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(name, email, password);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      setError(err.message || 'Password reset request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.resetPassword(token, password);
      return data;
    } catch (err) {
      setError(err.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};