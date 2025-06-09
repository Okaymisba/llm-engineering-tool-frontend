
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetPasswordOTPProps {
  email: string;
  onOTPVerified: (resetToken: string) => void;
  onBack: () => void;
}

export const ResetPasswordOTP: React.FC<ResetPasswordOTPProps> = ({
  email,
  onOTPVerified,
  onBack
}) => {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // For Supabase, the reset link is sent via email and doesn't require OTP verification
    // Show success message immediately
    setSuccess(true);
  }, []);

  if (success) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a password reset link to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Please check your email and click the reset link to set a new password.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors text-sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
