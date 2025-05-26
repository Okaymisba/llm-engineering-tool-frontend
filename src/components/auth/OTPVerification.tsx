
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Mail, Clock, CheckCircle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  username: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  username,
  onVerificationSuccess,
  onBack
}) => {
  const { verifyOTP, requestOTP, isLoading } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    handleSendOTP();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    setError('');
    setSuccess('');
    try {
      await requestOTP(email, username);
      setSuccess('Verification code sent to your email!');
      setCanResend(false);
      setCountdown(300);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    try {
      await verifyOTP(email, otp);
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
        <CardDescription className="text-gray-600">
          We've sent a 6-digit verification code to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-700 font-medium">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={success.includes('successfully')}
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" 
            disabled={isLoading || otp.length !== 6 || success.includes('successfully')}
          >
            {isLoading ? (
              'Verifying...'
            ) : (
              <>
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {!success.includes('successfully') && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {!canResend && countdown > 0 && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Resend code in {formatTime(countdown)}</span>
              </div>
            )}

            {canResend && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full border-gray-200 hover:bg-gray-50"
              >
                Resend Verification Code
              </Button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors text-sm"
                disabled={isLoading}
              >
                Back to previous step
              </button>
            </div>
          </div>
        )}

        {success.includes('successfully') && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">
              Your email has been verified successfully!
            </p>
            <p className="text-xs text-green-600 mt-1">
              You can now sign in with your credentials.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
