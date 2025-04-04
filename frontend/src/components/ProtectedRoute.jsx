// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You could render a loading spinner here
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};