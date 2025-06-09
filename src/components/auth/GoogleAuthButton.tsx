
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome } from 'lucide-react';

interface GoogleAuthButtonProps {
  mode: 'signin' | 'signup';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode }) => {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full h-11 border-gray-200 hover:bg-gray-50"
    >
      <Chrome className="w-5 h-5 mr-2 text-blue-600" />
      {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  );
};
