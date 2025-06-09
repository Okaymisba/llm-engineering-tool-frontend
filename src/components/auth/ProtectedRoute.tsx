
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">AIHub</span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Complete Verification
            </Button>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Email Verification Required</CardTitle>
              <CardDescription className="text-gray-600">
                Please verify your email address to continue using AIHub and access all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700">
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
