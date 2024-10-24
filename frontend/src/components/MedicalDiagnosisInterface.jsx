import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function MedicalDiagnosisInterface() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [diagnosisLikelihood, setDiagnosisLikelihood] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const handleAnalyze = async () => {
        if (!uploadedImage) return;
        
        setIsAnalyzing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAnalysisResult("Sample analysis result");
            setDiagnosisLikelihood("85%");
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeAgain = () => {
        setAnalysisResult(null);
        setDiagnosisLikelihood(null);
    };

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
            <div className="w-full max-w-[1400px] p-8">
                <h1 className="text-3xl font-bold text-center mb-12">Medical Image Diagnosis Tool</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Left Panel - Image Upload */}
                    <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-white">
                        <CardContent className="p-8">
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
                            <div className="flex justify-center">
                                <Button 
                                    className="bg-[#8B4513] hover:bg-[#693610] text-white px-8 py-2 rounded-md"
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
                            <div className="flex justify-center">
                                {!analysisResult ? (
                                    <Button
                                        className="bg-[#C4A484] hover:bg-[#B08968] text-white px-8 py-2 rounded-md"
                                        onClick={handleAnalyze}
                                        disabled={!uploadedImage || isAnalyzing}
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-[#C4A484] hover:bg-[#B08968] text-white px-8 py-2 rounded-md"
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