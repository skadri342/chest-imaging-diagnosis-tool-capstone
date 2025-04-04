// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { EMAIL_REGEX } from '../lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      console.log('RegisterPage: Starting registration process...');
      
      // Add a timeout to prevent the button from staying disabled indefinitely
      const registerPromise = register(name, email, password);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Registration request timed out. Please try again.'));
        }, 15000); // 15 seconds timeout
      });
      
      // Race between registration and timeout
      await Promise.race([registerPromise, timeoutPromise]);
      
      // Redirect to login page after successful registration
      console.log('Registration successful, redirecting to login');
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      console.error('Registration error in component:', err);
      
      // Display a more user-friendly error message
      if (err.message && err.message.includes('timeout')) {
        setError('Connection to server timed out. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check if the server is running and try again.');
      } else if (err.message && err.message.includes('User already exists')) {
        setError('An account with this email already exists. Please use a different email or try to log in.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      console.log('RegisterPage: Registration process finished, setting isLoading to false');
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
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

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
                <p className="text-xs text-gray-500">
                  Must be a valid email address (e.g., name@example.com)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
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
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
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
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-medical-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}