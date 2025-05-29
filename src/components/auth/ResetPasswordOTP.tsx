
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, ArrowLeft } from 'lucide-react';

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
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-otp?email=${encodeURIComponent(email)}&otp=${otp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      onOTPVerified(data.reset_token);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Enter Reset Code</CardTitle>
        <CardDescription className="text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-700 font-medium">Reset Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              'Verifying...'
            ) : (
              <>
                Verify Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors text-sm"
            disabled={isLoading}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Reset Form
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
