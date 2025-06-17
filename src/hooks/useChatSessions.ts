
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatSession {
  id: string;
  chat_title: string;
  created_at: string;
  last_used_at: string;
  total_tokens?: number;
  total_cost?: number;
  avg_latency_ms?: number;
}

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, chat_title, created_at, last_used_at, total_tokens, total_cost, avg_latency_ms')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (title: string = 'New Chat') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          chat_title: title,
          last_used_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      await fetchSessions();
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ chat_title: title })
        .eq('id', sessionId);

      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  const updateSessionLastUsed = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session last used:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    fetchSessions,
    createSession,
    updateSessionTitle,
    updateSessionLastUsed
  };
};
