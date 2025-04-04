// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosisPage from './pages/DiagnosisPage';
import MedicalChatPage from './pages/MedicalChatPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes with Dashboard Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/diagnosis" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DiagnosisPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/medical-chat" element={
            <ProtectedRoute>
              <DashboardLayout>
                <MedicalChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <DashboardLayout>
                <HistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;