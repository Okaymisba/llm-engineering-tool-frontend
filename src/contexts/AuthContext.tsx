import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  email: string;
  is_verified: boolean;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  requestOTP: (email: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
  refreshSession: () => Promise<boolean>;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Check if current token is valid (not expired)
  const isTokenValid = React.useCallback(() => {
    if (!session) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Add 5 minute buffer before expiration
    const isValid = expiresAt > (now + 300);
    
    if (!isValid) {
      console.log('Token expired or expiring soon:', {
        expiresAt: new Date(expiresAt * 1000),
        now: new Date(now * 1000),
        timeLeft: expiresAt - now
      });
    }
    
    return isValid;
  }, [session]);

  // Refresh session manually
  const refreshSession = React.useCallback(async (): Promise<boolean> => {
    try {
      console.log('Manually refreshing session...');
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }
      
      if (newSession) {
        console.log('Session refreshed successfully');
        setSession(newSession);
        setToken(newSession.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          if (session?.user) {
            console.log('Found existing session, setting user');
            await handleUserSession(session.user, session);
          } else {
            console.log('No existing session found');
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        setUser(null);
        setSession(null);
        setToken(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed automatically');
        if (session) {
          setSession(session);
          setToken(session.access_token);
        }
      } else if (session?.user) {
        await handleUserSession(session.user, session);
      } else {
        setUser(null);
        setSession(null);
        setToken(null);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (supabaseUser: SupabaseUser, userSession: Session) => {
    try {
      console.log('Handling user session for:', supabaseUser.id);
      
      // Set session and token first
      setSession(userSession);
      setToken(userSession.access_token);
      
      // Get or create user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id,username,first_name,last_name')
        .eq('id', supabaseUser.id)
        .single();

      let profile = profileData;

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
            first_name: supabaseUser.user_metadata?.first_name || '',
            last_name: supabaseUser.user_metadata?.last_name || ''
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        profile = newProfile;
      } else if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      const userData: User = {
        id: supabaseUser.id,
        username: profile?.username || supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
        email: supabaseUser.email || '',
        is_verified: supabaseUser.email_confirmed_at !== null,
        first_name: profile?.first_name || supabaseUser.user_metadata?.first_name,
        last_name: profile?.last_name || supabaseUser.user_metadata?.last_name
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          const errorWithVerification = new Error('Please verify your email first');
          (errorWithVerification as any).status = 403;
          throw errorWithVerification;
        }
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('User registered successfully. Please check your email for verification.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async (email: string, username: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('OTP request error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setIsLoading(true);
    try {
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
      console.error('GitHub sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logging out user...');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        throw error;
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setToken(null);
      
      // Clear any remaining local storage items
      localStorage.removeItem('supabase.auth.token');
      
      console.log('Logout successful');
      
      // Navigate to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    token,
    login,
    register,
    logout,
    verifyOTP,
    requestOTP,
    signInWithGoogle,
    signInWithGitHub,
    isLoading,
    isInitialized,
    refreshSession,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
