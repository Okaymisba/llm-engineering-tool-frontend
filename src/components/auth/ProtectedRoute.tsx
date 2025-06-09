
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  if (!token || !user) {
    return <AuthPage />;
  }

  if (!user.is_verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Email Verification Required</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please verify your email address to continue using AIHub and access all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Check your email inbox for a verification link, or click below to complete the verification process.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Complete Email Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
