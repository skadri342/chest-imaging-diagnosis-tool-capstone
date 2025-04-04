// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-medical-800">NG-08</h1>
          <p className="text-medical-600">Medical Chest X-Ray Analysis</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create New Password</CardTitle>
            <CardDescription className="text-center">
              Enter and confirm your new password
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <div className="text-center py-4">
                <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
                  <p>Your password has been successfully reset!</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  You will be redirected to the login page in a few seconds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-medical-600 hover:bg-medical-700"
                  disabled={isLoading || !token}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              <Link to="/login" className="text-medical-600 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}