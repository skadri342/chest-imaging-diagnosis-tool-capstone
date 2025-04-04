// src/pages/DashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { medicalService } from '../lib/api';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the history data on component mount to get counts
  useEffect(() => {
    const fetchHistoryCounts = async () => {
      try {
        setIsLoading(true);
        console.log('Dashboard: Fetching history for counters...');
        const response = await medicalService.getHistory();
        console.log('Dashboard: History response for counters:', response);
        
        if (response && response.analyses) {
          const count = response.analyses.length;
          console.log(`Dashboard: Setting analysis count to ${count}`);
          setAnalysisCount(count);
        } else {
          console.warn('Dashboard: No analyses array in response');
          setAnalysisCount(0);
        }
      } catch (error) {
        console.error('Dashboard: Error fetching history counts:', error);
        // Keep count at 0 on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryCounts();
    
    // Set up refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      console.log('Dashboard: Auto-refreshing counters');
      fetchHistoryCounts();
    }, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.name || 'User'}</h1>
        <p className="text-gray-600">Here's an overview of your medical dashboard</p>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">X-Ray Analysis</CardTitle>
            <CardDescription>Chest X-ray diagnosis tool</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-medical-600">
                {isLoading ? '...' : analysisCount}
              </div>
              <div className="p-2 rounded-full bg-medical-100 text-medical-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Previous analyses</p>
            <Link to="/diagnosis" className="block mt-4 text-sm text-medical-600 hover:underline">
              Analyze new X-ray →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Medical Assistant</CardTitle>
            <CardDescription>AI-powered medical chat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-medical-600">0</div>
              <div className="p-2 rounded-full bg-medical-100 text-medical-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Previous consultations</p>
            <Link to="/medical-chat" className="block mt-4 text-sm text-medical-600 hover:underline">
              Start new conversation →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your recent analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-medical-600">
                {isLoading ? '...' : analysisCount}
              </div>
              <div className="p-2 rounded-full bg-medical-100 text-medical-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total activities</p>
            <Link to="/history" className="block mt-4 text-sm text-medical-600 hover:underline">
              View full history →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Features section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-medical-100 text-medical-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">X-Ray Diagnosis</h3>
                <p className="text-gray-600 mt-1">Upload chest X-ray images and get AI-powered diagnosis for various conditions.</p>
                <Link to="/diagnosis" className="block mt-3 text-sm text-medical-600 hover:underline">
                  Start diagnosis →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-medical-100 text-medical-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Medical Assistant</h3>
                <p className="text-gray-600 mt-1">Ask medical questions and get responses from our AI-powered medical assistant.</p>
                <Link to="/medical-chat" className="block mt-3 text-sm text-medical-600 hover:underline">
                  Start chat →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="mt-8 bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Tips for Using NG-08</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex">
            <span className="mr-2 text-medical-600">•</span>
            <span>Upload clear, high-resolution X-ray images for more accurate diagnoses</span>
          </li>
          <li className="flex">
            <span className="mr-2 text-medical-600">•</span>
            <span>Our AI model can identify multiple conditions in a single X-ray</span>
          </li>
          <li className="flex">
            <span className="mr-2 text-medical-600">•</span>
            <span>Use the Medical Assistant for general health questions and guidance</span>
          </li>
          <li className="flex">
            <span className="mr-2 text-medical-600">•</span>
            <span>While our AI provides high-quality analysis, always consult with a medical professional for definitive diagnosis</span>
          </li>
        </ul>
      </div>
    </div>
  );
}