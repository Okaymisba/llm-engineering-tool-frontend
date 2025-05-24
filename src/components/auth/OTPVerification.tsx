
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    // Auto-send OTP when component mounts
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
      setSuccess('OTP sent to your email!');
      setCanResend(false);
      setCountdown(300);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    try {
      await verifyOTP(email, otp);
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        onVerificationSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to {email}. Enter it below to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">Enter 6-digit code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
              disabled={success.includes('successfully')}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || otp.length !== 6 || success.includes('successfully')}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>

          {!success.includes('successfully') && (
            <div className="text-center space-y-2">
              {!canResend && countdown > 0 && (
                <p className="text-sm text-gray-600">
                  Resend OTP in {formatTime(countdown)}
                </p>
              )}

              {canResend && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              )}

              <button
                type="button"
                onClick={onBack}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                Back to signup
              </button>
            </div>
          )}

          {success.includes('successfully') && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You can now login with your credentials on the login page.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
