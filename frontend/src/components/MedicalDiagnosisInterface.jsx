import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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
    const [analysisResult, setAnalysisResult] = useState(null);    // Stores the analysis results
    const [diagnosisLikelihood, setDiagnosisLikelihood] = useState(null);  // Stores the diagnosis probability
    const [isAnalyzing, setIsAnalyzing] = useState(false);         // Tracks analysis processing state

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                setAnalysisResult(null);
                setDiagnosisLikelihood(null);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Handles the image analysis process
     * Currently contains a placeholder implementation with a simulated delay
     * TODO: Replace with actual ML model API call
     */
    const handleAnalyze = async () => {
        if (!uploadedImage) return;
        
        setIsAnalyzing(true);
        try {
            // Placeholder for API call to ML model
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAnalysisResult("Sample analysis result");
            setDiagnosisLikelihood("85%");
        } catch (error) {
            console.error('Analysis failed:', error);
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
        setDiagnosisLikelihood(null);
    };

    // Button styling configurations
    const enabledButtonClass = "bg-[#8B4513] hover:bg-[#693610] text-white";  // Brown color for active state
    const disabledButtonClass = "bg-[#D2B48C] text-white cursor-not-allowed"; // Tan color for disabled state
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
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
            <div className="w-full max-w-[1400px] p-8">
                <h1 className="text-3xl font-bold text-center mb-12">Medical Image Diagnosis Tool</h1>
                
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
                                    <span className="text-slate-400 text-lg">Upload Image</span>
                                )}
                            </div>
                            {/* Upload button and hidden file input */}
                            <div className="flex justify-center">
                                <Button 
                                    className={`${enabledButtonClass} ${commonButtonClass}`}
                                    onClick={() => document.getElementById('imageInput').click()}
                                >
                                    Upload
                                </Button>
                                <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Panel - Analysis Results */}
                    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-white">
                        <CardContent className="p-8">
                            {/* Results display area */}
                            <div className="aspect-[4/3] bg-slate-50 rounded-lg mb-6 flex items-center justify-center">
                                {analysisResult ? (
                                    <div className="p-6 w-full">
                                        <h3 className="font-semibold text-xl mb-4">Analysis Result</h3>
                                        <p className="text-base mb-6">{analysisResult}</p>
                                        <div className="mt-4">
                                            <p className="font-medium text-lg">Diagnosis Result: Likelihood</p>
                                            <p className="text-2xl font-bold text-[#8B4513]">{diagnosisLikelihood}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-lg">Analysis Result</span>
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
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                    </Button>
                                ) : (
                                    <Button
                                        className={`${enabledButtonClass} ${commonButtonClass}`}
                                        onClick={handleAnalyzeAgain}
                                    >
                                        Analyze Again
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