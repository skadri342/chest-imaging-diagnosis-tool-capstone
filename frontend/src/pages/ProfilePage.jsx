// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  
  // For the demo, we'll use some placeholder data if currentUser isn't available
  const user = currentUser || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Patient',
    created_at: new Date().toISOString()
  };
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Update toggle display on state change
  useEffect(() => {
    const emailToggle = document.getElementById('email-toggle-span');
    if (emailToggle) {
      emailToggle.style.transform = emailNotifications ? 'translateX(16px)' : 'translateX(0)';
      document.getElementById('email-toggle-bg').className = emailNotifications 
        ? 'block h-6 rounded-full cursor-pointer bg-medical-600' 
        : 'block h-6 rounded-full cursor-pointer bg-gray-300';
    }
    
    const twoFaToggle = document.getElementById('2fa-toggle-span');
    if (twoFaToggle) {
      twoFaToggle.style.transform = twoFactorAuth ? 'translateX(16px)' : 'translateX(0)';
      document.getElementById('2fa-toggle-bg').className = twoFactorAuth 
        ? 'block h-6 rounded-full cursor-pointer bg-medical-600' 
        : 'block h-6 rounded-full cursor-pointer bg-gray-300';
    }
  }, [emailNotifications, twoFactorAuth]);
  
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Here you would make an API call to update the profile
    // For now, we'll just simulate success
    setTimeout(() => {
      setSuccessMessage('Profile updated successfully!');
      setIsEditingProfile(false);
    }, 1000);
  };
  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Here you would make an API call to change the password
    // For now, we'll just simulate success
    setTimeout(() => {
      setSuccessMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  // Format date function
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>
      
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-medical-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-medical-600">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-4 w-full">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium">{user.role || 'User'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {formatMemberSince(user.created_at)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              }}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
        
        {/* Profile Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>
              
              {isEditingProfile ? (
                <div className="mt-6 flex space-x-4">
                  <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setName(user.name);
                      setEmail(user.email);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <Button
                    type="button"
                    className="bg-medical-600 hover:bg-medical-700"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </form>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                      Change Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    className="bg-medical-600 hover:bg-medical-700"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </Button>
                  <Link to="/forgot-password">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300"
                    >
                      Forgot Password?
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email updates about your account activity</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle-email"
                    className="sr-only"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />
                  <label
                    htmlFor="toggle-email"
                    id="email-toggle-bg"
                    className={`block h-6 rounded-full cursor-pointer ${
                      emailNotifications ? 'bg-medical-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                  >
                    <span
                      id="email-toggle-span"
                      className="absolute left-0 inline-block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out"
                      style={{ transform: emailNotifications ? 'translateX(16px)' : 'translateX(0)' }}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="toggle-2fa"
                    className="sr-only"
                    checked={twoFactorAuth}
                    onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                  />
                  <label
                    htmlFor="toggle-2fa"
                    id="2fa-toggle-bg"
                    className={`block h-6 rounded-full cursor-pointer ${
                      twoFactorAuth ? 'bg-medical-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  >
                    <span
                      id="2fa-toggle-span"
                      className="absolute left-0 inline-block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out"
                      style={{ transform: twoFactorAuth ? 'translateX(16px)' : 'translateX(0)' }}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Data Privacy</h4>
                  <p className="text-sm text-gray-500">Manage how your data is used and stored</p>
                </div>
                <Button
                  variant="outline"
                  className="text-sm border-gray-300 text-gray-700"
                  onClick={() => {
                    setSuccessMessage('Privacy settings page will be available soon.');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                >
                  Manage Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}