// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { EMAIL_REGEX } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message in location state (e.g., after registration)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after showing it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
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
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-medical-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
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

              <Button
                type="submit"
                className="w-full bg-medical-600 hover:bg-medical-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              {/* Demo credentials notice */}
              <div className="text-xs text-center text-gray-500 mt-2">
                <p>Demo credentials: <span className="font-medium">test@gmail.com / test123</span></p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-medical-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}