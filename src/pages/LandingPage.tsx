
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Brain, CreditCard, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ModelsShowcase } from '@/components/ModelsShowcase';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/chat');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AIHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Access Any AI Model,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Pay As You Go</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose from the world's best AI models including GPT-4, Claude, and Gemini. 
            No subscriptions, no commitments — just transparent, usage-based pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Unlock the Power of AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Updated icon */}
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse AI Models</h3>
              <p className="text-gray-600">Access a wide range of AI models, each optimized for different tasks.</p>
            </div>
            {/* Feature 2 - Updated icon */}
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pay-As-You-Go Pricing</h3>
              <p className="text-gray-600">Only pay for what you use. No subscriptions, no hidden fees.</p>
            </div>
            {/* Feature 3 - Updated icon */}
            <div className="text-center">
              <Plug className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-gray-600">Simple API makes it easy to integrate AI into your existing workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create an account to start using AIHub.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose a Model</h3>
              <p className="text-gray-600">Select the AI model that best fits your needs.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Creating</h3>
              <p className="text-gray-600">Integrate the AI model into your project and start creating.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Models Showcase */}
      <ModelsShowcase />

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">AIHub</span>
              </div>
              <p className="text-gray-600 max-w-md">
                The simplest way to access and use the world's best AI models. 
                Pay only for what you use, no hidden fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600">Models</a></li>
                <li><a href="#" className="hover:text-blue-600">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">About</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 AIHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
