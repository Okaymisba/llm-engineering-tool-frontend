
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectedAccount {
  provider: string;
  email?: string;
  connected: boolean;
}

export const useConnectedAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      try {
        // Get user's identities to see connected providers
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) throw error;

        const connectedProviders = authUser?.identities?.map(identity => identity.provider) || [];
        
        const accountsList: ConnectedAccount[] = [
          {
            provider: 'email',
            email: user.email,
            connected: true
          },
          {
            provider: 'google',
            connected: connectedProviders.includes('google')
          },
          {
            provider: 'github',
            connected: connectedProviders.includes('github')
          }
        ];

        setAccounts(accountsList);
      } catch (error) {
        console.error('Error fetching connected accounts:', error);
        setAccounts([
          {
            provider: 'email',
            email: user.email,
            connected: true
          },
          {
            provider: 'google',
            connected: false
          },
          {
            provider: 'github',
            connected: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedAccounts();
  }, [user]);

  const connectGitHub = async () => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error connecting GitHub:', error);
      throw error;
    }
  };

  return {
    accounts,
    loading,
    connectGitHub
  };
};
