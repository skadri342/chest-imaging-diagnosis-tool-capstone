// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-medical-800">NG-08</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#features" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-medical-600">
                  Features
                </a>
                <a href="#about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-medical-600">
                  About
                </a>
                <a href="#faq" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-medical-600">
                  FAQ
                </a>
              </div>
              <div className="flex items-center ml-6">
                {currentUser ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-medical-600 hover:bg-medical-700"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-medical-700 bg-medical-100 hover:bg-medical-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-medical-600 hover:bg-medical-700"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-medical-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Advanced AI for</span>
                <span className="block text-medical-600">Chest X-Ray Diagnosis</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                NG-08 uses state-of-the-art artificial intelligence to analyze chest X-rays
                and detect various medical conditions with high accuracy, providing healthcare
                professionals with an advanced diagnostic tool.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link
                  to={currentUser ? "/dashboard" : "/register"}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-medical-600 hover:bg-medical-700 md:text-lg"
                >
                  {currentUser ? "Go to Dashboard" : "Get Started"}
                </Link>
                <a
                  href="#features"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-medical-700 bg-medical-100 hover:bg-medical-200 md:text-lg"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:w-1/2">
              <div className="relative h-64 md:h-96 rounded-lg shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-medical-300 to-medical-600 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Key Features
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Our platform provides powerful tools for medical professionals
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-medical-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">AI-Powered X-Ray Analysis</h3>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-600">
                      Upload chest X-rays and receive instant AI-powered analysis for multiple conditions with high accuracy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-medical-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">Medical Assistant</h3>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-600">
                      Access our AI-powered medical assistant for information on diseases, symptoms, treatments, and health guidance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-6 py-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-medical-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-medium text-gray-900">Comprehensive History</h3>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-600">
                      Keep track of all your analyses and consultations with a detailed history and downloadable reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-medical-600 font-semibold tracking-wide uppercase">About</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Advanced Technology for Healthcare
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Learn how our AI-powered platform is transforming medical diagnostics
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">The Technology</h3>
                <p className="mt-4 text-gray-600">
                  NG-08 utilizes a state-of-the-art deep learning model based on EfficientNetB4, trained on a large dataset of chest X-rays. Our model can identify 14 different conditions with high accuracy, providing healthcare professionals with a powerful diagnostic tool.
                </p>
                <p className="mt-4 text-gray-600">
                  The neural network has been carefully tuned and validated using real-world clinical data, ensuring reliable performance across different patient populations.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                <p className="mt-4 text-gray-600">
                  Our mission is to make advanced medical diagnostics accessible and efficient. By leveraging AI technology, we aim to assist healthcare professionals in making faster and more accurate diagnoses, ultimately improving patient outcomes.
                </p>
                <p className="mt-4 text-gray-600">
                  We believe in responsible AI that augments, rather than replaces, human expertise. Our tools are designed to work alongside healthcare professionals, providing valuable insights while leaving the final diagnostic decisions in expert human hands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Common questions about our platform and services
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">How accurate is the AI diagnosis?</h3>
                <p className="mt-2 text-gray-600">
                  Our AI model achieves high accuracy across multiple conditions, with performance comparable to expert radiologists in many cases. However, it's designed to be an assistive tool for healthcare professionals, not a replacement for their expertise.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Is my medical data secure?</h3>
                <p className="mt-2 text-gray-600">
                  Yes, we take data security very seriously. All data is encrypted in transit and at rest, and we adhere to HIPAA compliance standards for handling medical information. Your data is never shared with third parties without explicit consent.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Who can use this platform?</h3>
                <p className="mt-2 text-gray-600">
                  NG-08 is designed for healthcare professionals, including radiologists, pulmonologists, and primary care physicians. It's also accessible to medical researchers and educational institutions for training purposes.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">What file formats are supported for X-ray uploads?</h3>
                <p className="mt-2 text-gray-600">
                  Our platform supports standard medical imaging formats including JPEG, PNG, and DICOM files. For optimal results, we recommend using high-resolution images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-medical-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-medical-100">Join NG-08 today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to={currentUser ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-medical-600 bg-white hover:bg-gray-50"
              >
                {currentUser ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#features"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-medical-700 hover:bg-medical-800"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="text-2xl font-bold text-white">NG-08</div>
              <p className="text-gray-400 text-base">
                Advanced AI-powered chest X-ray analysis for healthcare professionals.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Product
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#features" className="text-base text-gray-300 hover:text-white">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#about" className="text-base text-gray-300 hover:text-white">
                        Technology
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className="text-base text-gray-300 hover:text-white">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2025 NG-08. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}