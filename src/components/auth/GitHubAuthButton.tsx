
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface GitHubAuthButtonProps {
  mode: 'login' | 'signup';
  className?: string;
}

export const GitHubAuthButton: React.FC<GitHubAuthButtonProps> = ({ mode, className }) => {
  const { isLoading } = useAuth();

  const handleGitHubAuth = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('GitHub authentication error:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGitHubAuth}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 h-12 ${className}`}
    >
      <Github className="h-5 w-5" />
      <span>{isLoading ? 'Connecting...' : `${mode === 'login' ? 'Sign in' : 'Sign up'} with GitHub`}</span>
    </Button>
  );
};
