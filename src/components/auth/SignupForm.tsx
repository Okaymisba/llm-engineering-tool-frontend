
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Mail, Lock, User, CheckCircle } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (email: string, username: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain letters, numbers, and special characters');
      return;
    }

    try {
      await register(username, email, password);
      onSignupSuccess(email, username);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains letters', met: /[A-Za-z]/.test(password) },
    { text: 'Contains numbers', met: /\d/.test(password) },
    { text: 'Contains special characters', met: /[@$!%*#?&]/.test(password) },
  ];

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-gray-600">
          Join thousands of developers building with AI
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
            <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Choose a username"
                minLength={3}
                maxLength={50}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Create a password"
                minLength={8}
                required
              />
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <CheckCircle className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium" disabled={isLoading}>
            {isLoading ? (
              'Creating account...'
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
