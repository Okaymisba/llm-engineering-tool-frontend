
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { OTPVerification } from '@/components/auth/OTPVerification';

type AuthStep = 'login' | 'signup' | 'verify-otp';

export const AuthPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [signupData, setSignupData] = useState<{ email: string; username: string } | null>(null);

  const handleSwitchToSignup = () => setCurrentStep('signup');
  const handleSwitchToLogin = () => setCurrentStep('login');

  const handleSignupSuccess = (email: string, username: string) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {currentStep === 'login' && (
        <LoginForm onSwitchToSignup={handleSwitchToSignup} />
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
          onBack={handleBackToSignup}
        />
      )}
    </div>
  );
};
