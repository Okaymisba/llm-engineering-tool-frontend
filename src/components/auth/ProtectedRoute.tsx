
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <AuthPage />;
  }

  if (!user.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
          <p className="text-gray-600">
            Please verify your email address to continue using the application.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
