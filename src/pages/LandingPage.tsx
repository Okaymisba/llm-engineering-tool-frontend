
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  Upload, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'Advanced AI Chat',
      description: 'Engage with multiple AI models including GPT-4, Claude, and Gemini in one unified interface.'
    },
    {
      icon: Upload,
      title: 'Multi-Modal Input',
      description: 'Upload images and documents to enhance your conversations with visual and textual context.'
    },
    {
      icon: Zap,
      title: 'Real-time Streaming',
      description: 'Get instant responses with real-time streaming for a seamless conversational experience.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your conversations are encrypted and secure with enterprise-grade privacy protection.'
    },
    {
      icon: Globe,
      title: 'Multi-Provider Support',
      description: 'Access the best AI models from OpenAI, Anthropic, and Google in one platform.'
    },
    {
      icon: Brain,
      title: 'Smart Context',
      description: 'AI remembers conversation history to provide more relevant and contextual responses.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      content: 'Syncmind has revolutionized how our team collaborates with AI. The multi-modal capabilities are game-changing.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      content: 'Having access to multiple AI models in one place saves me hours every day. The interface is intuitive and powerful.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Creator',
      content: 'The document upload feature and smart context make research and content creation so much more efficient.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Syncmind</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🚀 Powered by the latest AI models
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI Hub for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Intelligent Conversations
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Access multiple AI models, upload documents and images, and have intelligent conversations 
            with context-aware responses. All in one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            >
              Start Chatting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need for AI conversations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to enhance your AI interaction experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl mx-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-xl text-gray-600">
            See what our users are saying about Syncmind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to supercharge your AI conversations?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who are already using Syncmind to have more productive 
            and intelligent conversations with AI.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Syncmind</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>© 2024 Syncmind. All rights reserved.</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
