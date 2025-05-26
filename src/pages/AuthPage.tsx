
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AuthStep = 'login' | 'signup' | 'verify-otp';

export const AuthPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [signupData, setSignupData] = useState<{ email: string; username: string } | null>(null);
  const navigate = useNavigate();

  const handleSwitchToSignup = () => setCurrentStep('signup');
  const handleSwitchToLogin = () => setCurrentStep('login');

  const handleSignupSuccess = (email: string, username: string) => {
    setSignupData({ email, username });
    setCurrentStep('verify-otp');
  };

  const handleNeedVerification = (email: string) => {
    const username = email.split('@')[0];
    setSignupData({ email, username });
    setCurrentStep('verify-otp');
  };

  const handleVerificationSuccess = () => {
    setCurrentStep('login');
    setSignupData(null);
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setSignupData(null);
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setSignupData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AIHub</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {currentStep === 'login' && (
            <LoginForm 
              onSwitchToSignup={handleSwitchToSignup}
              onNeedVerification={handleNeedVerification}
            />
          )}
          
          {currentStep === 'signup' && (
            <SignupForm 
              onSwitchToLogin={handleSwitchToLogin}
              onSignupSuccess={handleSignupSuccess}
            />
          )}
          
          {currentStep === 'verify-otp' && signupData && (
            <OTPVerification
              email={signupData.email}
              username={signupData.username}
              onVerificationSuccess={handleVerificationSuccess}
              onBack={currentStep === 'verify-otp' && signupData.username === signupData.email.split('@')[0] ? handleBackToLogin : handleBackToSignup}
            />
          )}
        </div>
      </div>
    </div>
  );
};
