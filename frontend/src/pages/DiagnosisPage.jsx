// src/pages/DiagnosisPage.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { medicalService } from '../lib/api';

export default function DiagnosisPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG)');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      
      setError('');
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setAnalysisResults(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAnalyze = async () => {
    if (!imageFile) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const results = await medicalService.analyzeImage(imageFile);
      setAnalysisResults(results);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleReset = () => {
    setUploadedImage(null);
    setImageFile(null);
    setAnalysisResults(null);
    setError('');
  };

  // Button styling
  const primaryButtonClass = "bg-medical-600 hover:bg-medical-700 text-white";
  const disabledButtonClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">X-Ray Diagnosis</h1>
        <p className="text-gray-600">Upload a chest X-ray image for AI-powered analysis</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Upload X-Ray</CardTitle>
            <CardDescription>Select a chest X-ray image to analyze</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="w-full aspect-square max-h-80 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded X-ray"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Upload your X-ray image</p>
                  <p className="text-xs text-gray-400 mt-1">Supported formats: JPEG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex space-x-4 w-full">
              <Button
                onClick={() => document.getElementById('x-ray-upload').click()}
                className={`flex-1 ${uploadedImage ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : primaryButtonClass}`}
              >
                {uploadedImage ? 'Change Image' : 'Upload Image'}
              </Button>
              <input
                id="x-ray-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {uploadedImage && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 border-gray-300 text-gray-700"
                >
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center px-6 pb-6">
            <Button
              onClick={handleAnalyze}
              disabled={!uploadedImage || isAnalyzing}
              className={`w-full ${!uploadedImage || isAnalyzing ? disabledButtonClass : primaryButtonClass}`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Results Panel */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-powered diagnostic insights</CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-130px)] flex flex-col">
            {analysisResults ? (
              <div className="space-y-4 h-full overflow-auto">
                <div className="bg-medical-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-medical-800 mb-2">Diagnosis</h3>
                  
                  {/* Display the top findings */}
                  <div className="space-y-3">
                    {analysisResults.predictions && analysisResults.predictions.map((prediction, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="font-medium">{prediction.label}</div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-medical-600 h-2.5 rounded-full" 
                              style={{ width: `${prediction.probability * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* If no predictions are available */}
                    {(!analysisResults.predictions || analysisResults.predictions.length === 0) && (
                      <p className="text-gray-600">No specific conditions detected.</p>
                    )}
                  </div>
                </div>
                
                {/* Additional information or interpretation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-600 text-sm">
                    This analysis is based on AI predictions and should be interpreted by a healthcare professional.
                    The percentages indicate the confidence level of the model in its predictions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Upload an X-ray image and click "Analyze" to get results</p>
              </div>
            )}
          </CardContent>
          {analysisResults && (
            <div className="p-6 pt-0 border-t mt-auto w-full">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full border-medical-300 text-medical-700 hover:bg-medical-50 overflow-hidden"
              >
                Start New Analysis
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>About X-Ray Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Our AI model is trained to detect multiple conditions in chest X-rays, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Pneumonia</li>
              <li>Pleural Effusion</li>
              <li>Atelectasis</li>
              <li>Cardiomegaly</li>
              <li>Infiltration</li>
              <li>Mass</li>
              <li>Nodule</li>
              <li>Pneumothorax</li>
              <li>Consolidation</li>
              <li>Edema</li>
              <li>Emphysema</li>
              <li>Fibrosis</li>
              <li>Hernia</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                  <div className="text-sm text-yellow-700 mt-1">
                    <p>
                      The AI analysis is not a substitute for professional medical advice, diagnosis, or treatment.
                      Always consult with a qualified healthcare provider for proper interpretation of your X-ray results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}