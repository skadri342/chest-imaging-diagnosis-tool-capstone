import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function MLTestComponent() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const testAPI = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch('http://127.0.0.1:7000/test', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-6">
            <CardHeader>
                <CardTitle>ML API Test</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button 
                        onClick={testAPI}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Testing API...' : 'Test API Connection'}
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="p-4 bg-gray-100 rounded-lg">
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}