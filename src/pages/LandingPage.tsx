
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, DollarSign, Code, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Access Multiple AI Models",
      description: "Choose from a wide variety of AI models including GPT, Claude, and more. Switch between models based on your specific needs."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Pay-As-You-Go",
      description: "No monthly subscriptions or hidden fees. Pay only for what you use with transparent, usage-based pricing."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime. Your data and conversations are protected and never stored."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Developer-Friendly",
      description: "Simple API integration, comprehensive documentation, and SDKs for popular programming languages."
    }
  ];

  const pricingBenefits = [
    "No setup fees or monthly commitments",
    "Real-time usage tracking and billing",
    "Volume discounts for heavy usage",
    "Transparent pricing per model and token"
  ];

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AIHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          Now supporting 15+ AI models
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Access Any AI Model,
          <span className="text-blue-600 block">Pay Only for What You Use</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Choose from the best AI models available. No subscriptions, no commitments. 
          Just powerful AI tools at your fingertips with transparent, usage-based pricing.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={handleGetStarted} className="px-8 py-3">
            Start Building Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-3">
            View Pricing
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          No credit card required • Free tier available • Cancel anytime
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with powerful AI models in just three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign Up & Choose</h3>
            <p className="text-gray-600">Create your account and select from our library of AI models</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Integrate & Build</h3>
            <p className="text-gray-600">Use our simple API or web interface to start building your applications</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Pay As You Go</h3>
            <p className="text-gray-600">Only pay for the requests you make with transparent, real-time billing</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AIHub?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for developers, by developers. Everything you need to integrate AI into your applications.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              No hidden fees, no surprise charges. Pay only for the AI requests you make with 
              clear, upfront pricing for each model.
            </p>
            
            <div className="space-y-4">
              {pricingBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            
            <Button size="lg" className="mt-8" onClick={handleGetStarted}>
              View Detailed Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <Card className="p-8 border-0 shadow-xl">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Example Usage</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>GPT-4 (1,000 tokens)</span>
                  <span className="font-semibold">$0.03</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Claude-3 (1,000 tokens)</span>
                  <span className="font-semibold">$0.025</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>GPT-3.5 (1,000 tokens)</span>
                  <span className="font-semibold">$0.002</span>
                </div>
                <div className="flex justify-between items-center py-2 font-bold text-lg border-t pt-4">
                  <span>Total for today</span>
                  <span className="text-green-600">$0.057</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers already building with our AI platform. 
            Start for free and scale as you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="px-8 py-3">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">AIHub</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The simplest way to access and use multiple AI models with transparent, 
                pay-as-you-go pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Models</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API Reference</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AIHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
