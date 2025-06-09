
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  username: string;
  email: string;
  is_verified: boolean;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  requestOTP: (email: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        await handleUserSession(session.user, session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
    });

    // THEN check for existing session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      if (session?.user) {
        await handleUserSession(session.user, session.access_token);
      }
    };

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (supabaseUser: SupabaseUser, accessToken: string) => {
    try {
      // Get or create user profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const username = supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '';
        const first_name = supabaseUser.user_metadata?.first_name || supabaseUser.user_metadata?.full_name?.split(' ')[0] || '';
        const last_name = supabaseUser.user_metadata?.last_name || supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';
        
        // Handle Google avatar
        let avatar_url = supabaseUser.user_metadata?.avatar_url || null;
        if (avatar_url && supabaseUser.app_metadata?.provider === 'google') {
          try {
            avatar_url = await downloadAndUploadGoogleAvatar(avatar_url, supabaseUser.id);
          } catch (err) {
            console.error('Error uploading Google avatar:', err);
          }
        }

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            username,
            first_name,
            last_name,
            avatar_url
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
        avatar_url: profile?.avatar_url,
        first_name: profile?.first_name,
        last_name: profile?.last_name
      };
      
      setUser(userData);
      setToken(accessToken);
    } catch (error) {
      console.error('Error handling user session:', error);
    }
  };

  const downloadAndUploadGoogleAvatar = async (googleAvatarUrl: string, userId: string): Promise<string> => {
    try {
      // Download the image from Google
      const response = await fetch(googleAvatarUrl);
      const blob = await response.blob();
      
      // Create a file object
      const file = new File([blob], `avatar-${userId}.jpg`, { type: 'image/jpeg' });
      
      // Upload to Supabase storage
      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error processing Google avatar:', error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in');

    const fileName = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setUser({ ...user, ...updates });
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

      // Navigate to chat page after successful login
      navigate('/chat');
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
          redirectTo: `${window.location.origin}/chat`
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

      // Navigate to chat page after verification
      navigate('/chat');
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    verifyOTP,
    requestOTP,
    signInWithGoogle,
    updateProfile,
    uploadAvatar,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
