import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (accessToken: string, newPassword: string) => Promise<void>;
  verifyOtp: (email: string, token: string, type: 'email') => Promise<any>;
  resendOtp: (email: string, type: 'email') => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, username: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username,
            email: email,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setUser(null);
        setProfile(null);
        return null;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setUser(user);
      setProfile(profileData);
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      setUser(null);
      setProfile(null);
      return null;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during password reset:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (accessToken: string, newPassword: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error during password update:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'email') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error during OTP verification:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string, type: 'email') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resend({
        email,
        type,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error during OTP resend:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        await getCurrentUser();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }
      await fetchUser();
    });
  }, []);

  const value = {
    user,
    profile,
    loading,
    login,
    signup,
    logout,
    getCurrentUser,
    resetPassword,
    updatePassword,
    verifyOtp,
    resendOtp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
