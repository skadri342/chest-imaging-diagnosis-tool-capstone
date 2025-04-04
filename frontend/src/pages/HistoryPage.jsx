// src/pages/HistoryPage.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function HistoryPage() {
  // In the future, this would be fetched from the API
  const [analyses, setAnalyses] = useState([]);
  // Placeholder for demonstration
  const placeholderAnalyses = [
    {
      id: 1,
      date: new Date('2023-12-15T14:32:00'),
      imageUrl: 'https://via.placeholder.com/100',
      conditions: [
        { name: 'Pneumonia', probability: 0.85 },
        { name: 'Pleural Effusion', probability: 0.32 }
      ]
    },
    {
      id: 2,
      date: new Date('2023-12-10T09:45:00'),
      imageUrl: 'https://via.placeholder.com/100',
      conditions: [
        { name: 'No Finding', probability: 0.92 }
      ]
    }
  ];
  
  const [selectedTab, setSelectedTab] = useState('analyses');
  
  // Function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Toggle between real data (empty for now) and placeholder data
  const togglePlaceholder = () => {
    if (analyses.length === 0) {
      setAnalyses(placeholderAnalyses);
    } else {
      setAnalyses([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-600">View your past analyses and consultations</p>
        </div>
        
        {/* Demo toggle button */}
        <Button 
          onClick={togglePlaceholder}
          className="bg-medical-600 hover:bg-medical-700"
        >
          {analyses.length === 0 ? 'Show Demo Data' : 'Hide Demo Data'}
        </Button>
      </div>
      
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
                          alt="X-ray thumbnail"
                          className="h-full w-full object-cover"
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
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Download PDF
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