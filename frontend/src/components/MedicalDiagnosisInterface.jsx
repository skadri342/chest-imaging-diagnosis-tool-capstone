import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { medicalService } from "../lib/api";

/**
 * MedicalDiagnosisInterface Component
 * 
 * A React component that provides a user interface for uploading and analyzing medical images.
 * The interface consists of two main panels:
 * 1. Left panel for image upload
 * 2. Right panel for displaying analysis results
 */
export default function MedicalDiagnosisInterface() {
    // State management for component
    const [uploadedImage, setUploadedImage] = useState(null);      // Stores the uploaded image data
    const [imageFile, setImageFile] = useState(null);             // Stores the actual file object
    const [analysisResult, setAnalysisResult] = useState(null);    // Stores the analysis results
    const [isAnalyzing, setIsAnalyzing] = useState(false);         // Tracks analysis processing state
    const [error, setError] = useState(null);                      // Stores any error messages

    /**
     * Handles the image upload process
     * Converts the uploaded file to a base64 string and stores it in state
     * Resets any existing analysis results when a new image is uploaded
     * 
     * @param {Event} event - The file input change event
     */
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.match('image.*')) {
                setError('Please select an image file (JPEG, PNG)');
                return;
            }
            
            // Check file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit');
                return;
            }
            
            setError(null);
            setImageFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                setAnalysisResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Handles the image analysis process
     * Calls the backend API to analyze the uploaded image
     */
    const handleAnalyze = async () => {
        if (!imageFile) return;
        
        setIsAnalyzing(true);
        setError(null);
        
        try {
            const results = await medicalService.analyzeImage(imageFile);
            setAnalysisResult(results);
        } catch (err) {
            setError(err.message || 'Analysis failed. Please try again.');
            console.error('Analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Resets the analysis state to allow for a new analysis
     * Called when user clicks "Analyze Again"
     */
    const handleAnalyzeAgain = () => {
        setAnalysisResult(null);
        setError(null);
    };

    /**
     * Reset everything to the initial state
     */
    const handleReset = () => {
        setUploadedImage(null);
        setImageFile(null);
        setAnalysisResult(null);
        setError(null);
    };

    // Button styling configurations
    const enabledButtonClass = "bg-medical-600 hover:bg-medical-700 text-white";  // Blue color for active state
    const disabledButtonClass = "bg-gray-300 text-gray-500 cursor-not-allowed"; // Gray color for disabled state
    const commonButtonClass = "px-8 py-2 rounded-md";                         // Shared button styling

    /**
     * Determines the appropriate CSS classes for the analyze button based on component state
     * Returns disabled styling if no image is uploaded or analysis is in progress
     * @returns {string} Combined CSS classes for the analyze button
     */
    const getAnalyzeButtonClass = () => {
        if (!uploadedImage || isAnalyzing) {
            return `${disabledButtonClass} ${commonButtonClass}`;
        }
        return `${enabledButtonClass} ${commonButtonClass}`;
    };

    return (
        // Main container with full viewport height and centered content
        <div className="w-full bg-white flex items-center justify-center">
            <div className="w-full max-w-[1400px] p-8">
                <h1 className="text-3xl font-bold text-center mb-8">Medical Image Diagnosis Tool</h1>
                
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {/* Grid container for two panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Left Panel - Image Upload */}
                    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-white">
                        <CardContent className="p-8">
                            {/* Image display area */}
                            <div className="aspect-[4/3] bg-slate-50 rounded-lg mb-6 flex items-center justify-center">
                                {uploadedImage ? (
                                    <img 
                                        src={uploadedImage} 
                                        alt="Uploaded medical image" 
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
                            {/* Upload button and hidden file input */}
                            <div className="flex justify-center space-x-4">
                                <Button 
                                    className={`${uploadedImage ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : enabledButtonClass} ${commonButtonClass}`}
                                    onClick={() => document.getElementById('imageInput').click()}
                                >
                                    {uploadedImage ? 'Change Image' : 'Upload Image'}
                                </Button>
                                <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                
                                {uploadedImage && (
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="border-gray-300 text-gray-700"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Panel - Analysis Results */}
                    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-white">
                        <CardContent className="p-8">
                            {/* Results display area */}
                            <div className="aspect-[4/3] bg-slate-50 rounded-lg mb-6 flex items-center justify-center overflow-auto">
                                {analysisResult ? (
                                    <div className="p-6 w-full">
                                        <h3 className="font-semibold text-xl mb-4">Analysis Result</h3>
                                        
                                        {/* Display the predictions */}
                                        <div className="space-y-3">
                                            {analysisResult.predictions && analysisResult.predictions.map((prediction, index) => (
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
                                        </div>
                                        
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Note:</strong> This analysis is based on AI predictions and should be 
                                                interpreted by a healthcare professional. Results are not a definitive diagnosis.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">Upload an X-ray image and click "Analyze" to get results</p>
                                    </div>
                                )}
                            </div>
                            {/* Analysis control buttons */}
                            <div className="flex justify-center">
                                {!analysisResult ? (
                                    <Button
                                        className={getAnalyzeButtonClass()}
                                        onClick={handleAnalyze}
                                        disabled={!uploadedImage || isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Analyzing...
                                            </div>
                                        ) : 'Analyze Image'}
                                    </Button>
                                ) : (
                                    <Button
                                        className={`${enabledButtonClass} ${commonButtonClass}`}
                                        onClick={handleAnalyzeAgain}
                                    >
                                        Start New Analysis
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}