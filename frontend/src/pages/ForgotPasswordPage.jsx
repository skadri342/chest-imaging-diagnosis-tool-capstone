// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { EMAIL_REGEX } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to process your request. Please try again.');
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
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted 
                ? "Check your email for a reset link" 
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSubmitted ? (
              <div className="text-center py-4">
                <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
                  <p>If your email exists in our system, you will receive a password reset link shortly.</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  If you don't receive an email within a few minutes, check your spam folder or try again.
                </p>
              </div>
            ) : (
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

                <Button
                  type="submit"
                  className="w-full bg-medical-600 hover:bg-medical-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Remember your password?{' '}
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