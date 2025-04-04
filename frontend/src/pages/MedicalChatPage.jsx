// src/pages/MedicalChatPage.jsx
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function MedicalChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your medical assistant. How can I help you today? You can ask me about general medical information, symptoms, or health advice.',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // This is a placeholder response since the LLM will be implemented later
      // In a real implementation, this would be an API call
      setTimeout(() => {
        const placeholderResponses = [
          "I understand you're asking about that. While I'm being developed to provide more specific medical information, I can tell you that it's best to consult with a healthcare provider for personalized advice.",
          "That's an important health question. When fully implemented, I'll be able to provide evidence-based information on this topic. For now, I recommend discussing this with your doctor.",
          "Thank you for your question. In the future, I'll be able to offer detailed information about this medical topic. Currently, I'm in development mode.",
          "I appreciate your interest in this health topic. Once fully implemented, I'll provide information based on medical literature. For now, please consult reliable sources like the CDC or WHO websites.",
          "That's a good question about your health. The full version of this medical assistant will offer evidence-based information. Currently, I recommend speaking with a healthcare professional for guidance."
        ];
        
        const randomResponse = placeholderResponses[Math.floor(Math.random() * placeholderResponses.length)];
        
        const assistantMessage = {
          id: Date.now(),
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Failed to get response. Please try again.');
      setIsLoading(false);
    }
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Assistant</h1>
        <p className="text-gray-600">Ask health questions and get evidence-based information</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="h-[calc(100vh-220px)] flex flex-col">
        <CardHeader className="px-6">
          <CardTitle>Medical Chat</CardTitle>
          <CardDescription>Chat with our AI medical assistant</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto px-6 py-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-medical-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-medical-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t mt-auto">
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your health question..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-medical-600 hover:bg-medical-700"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </CardFooter>
      </Card>
      
      {/* Information card */}
      <Card>
        <CardHeader>
          <CardTitle>About Medical Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              The Medical Assistant is an AI-powered chatbot designed to provide evidence-based information about health topics.
              It can help with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>General medical information and terminology</li>
              <li>Understanding symptoms and conditions</li>
              <li>Learning about treatments and medications</li>
              <li>Finding health resources and guidance</li>
              <li>Answering questions about preventive care</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Important Note</h3>
                  <div className="text-sm text-blue-700 mt-1">
                    <p>
                      This Medical Assistant is currently in development mode. Future implementations will provide more 
                      detailed and personalized responses based on medical literature. 
                      Always consult with a healthcare professional for medical advice, diagnosis, or treatment.
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