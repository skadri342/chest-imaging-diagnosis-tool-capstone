// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Display a loading spinner
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('Access denied: User not authenticated. Redirecting to login.');
    // Pass the current location to the login page so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};