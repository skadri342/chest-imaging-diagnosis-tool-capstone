// src/pages/HistoryPage.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { medicalService } from '../lib/api';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('analyses');
  
  // Fetch history from API on component mount
  useEffect(() => {
    fetchHistory();
  }, []);
  
  // Function to fetch history from API
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching diagnosis history...');
      
      const response = await medicalService.getHistory();
      console.log('History response:', response);
      
      if (response && response.analyses) {
        if (response.analyses.length === 0) {
          console.log('No analyses found in response (empty array)');
          setAnalyses([]);
          return;
        }
        
        // Map API response to component state format
        const formattedAnalyses = response.analyses.map(analysis => {
          console.log('Processing analysis:', analysis);
          
          // Use image URL from response if available, otherwise use a local SVG data URI
          const fallbackImageUrl = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23888888%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2212%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EX-Ray%3C%2Ftext%3E%3C%2Fsvg%3E';
          const imageUrl = analysis.image_url || fallbackImageUrl;
          
          // Handle possible missing or malformed predictions
          let conditions = [];
          if (analysis.predictions && Array.isArray(analysis.predictions)) {
            conditions = analysis.predictions.map(pred => ({
              name: pred.label || "Unknown",
              probability: pred.probability || 0
            }));
          } else {
            console.warn('Missing or invalid predictions for analysis:', analysis.id);
          }
          
          return {
            id: analysis.id || 'unknown-id',
            date: analysis.timestamp || new Date().toISOString(),
            filename: analysis.filename || 'unknown-file',
            imageUrl: imageUrl,
            conditions: conditions
          };
        });
        
        setAnalyses(formattedAnalyses);
        console.log(`Loaded ${formattedAnalyses.length} analyses from history`);
      } else {
        console.warn('No analyses array found in response');
        setAnalyses([]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to view analysis details
  const viewDetails = (analysisId) => {
    console.log('Viewing details for analysis:', analysisId);
    
    // Open details in a new tab/window for now
    // In a more complete implementation, this could open a modal with details
    medicalService.getAnalysisDetails(analysisId)
      .then(response => {
        if (response && response.status === 'success' && response.analysis) {
          // For now just open the image directly as a simple implementation
          if (response.analysis.image_url) {
            window.open(response.analysis.image_url, '_blank');
          } else {
            alert('No image available for this analysis');
          }
        } else {
          alert('Could not load analysis details');
        }
      })
      .catch(error => {
        console.error('Error loading analysis details:', error);
        alert('Error loading analysis details: ' + error.message);
      });
  };
  
  // Function to download analysis report
  const downloadReport = (analysisId) => {
    console.log('Downloading report for analysis:', analysisId);
    medicalService.downloadReport(analysisId);
  };
  
  // Function to format date
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return date; // Return original if formatting fails
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-600">View your past analyses and consultations</p>
        </div>
        
        {/* Refresh button */}
        <Button 
          onClick={fetchHistory}
          className="bg-medical-600 hover:bg-medical-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh History'}
        </Button>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('analyses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'analyses'
                ? 'border-medical-600 text-medical-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            X-Ray Analyses
          </button>
          <button
            onClick={() => setSelectedTab('consultations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'consultations'
                ? 'border-medical-600 text-medical-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medical Consultations
          </button>
        </div>
      </div>
      
      {/* Content based on selected tab */}
      {selectedTab === 'analyses' ? (
        <div className="space-y-6">
          {analyses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={analysis.imageUrl}
                          alt={`X-ray: ${analysis.filename}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', analysis.imageUrl);
                            // Use a data URI for the fallback image instead of an external service
                            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23888888%22%20font-family%3D%22Arial%2CSans-serif%22%20font-size%3D%2212%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EX-Ray%3C%2Ftext%3E%3C%2Fsvg%3E';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Analysis Result</h3>
                          <span className="text-sm text-gray-500">{formatDate(analysis.date)}</span>
                        </div>
                        <div className="mt-2 space-y-2">
                          {analysis.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center">
                              <span className="text-gray-700 flex-1">{condition.name}</span>
                              <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-medical-600 h-2.5 rounded-full"
                                  style={{ width: `${condition.probability * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {(condition.probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <Button 
                            variant="outline" 
                            className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => viewDetails(analysis.id)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => downloadReport(analysis.id)}
                          >
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No analyses yet</h3>
                <p className="text-gray-500 mb-4">You haven't performed any X-ray analyses yet.</p>
                <Button className="bg-medical-600 hover:bg-medical-700" onClick={() => window.location.href = '/diagnosis'}>
                  Analyze an X-Ray
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No consultations yet</h3>
              <p className="text-gray-500 mb-4">You haven't had any medical assistant consultations yet.</p>
              <Button className="bg-medical-600 hover:bg-medical-700" onClick={() => window.location.href = '/medical-chat'}>
                Start a Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}