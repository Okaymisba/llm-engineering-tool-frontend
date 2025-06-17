
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: string;
  chat_title: string;
  last_used_at: string;
  created_at: string;
  total_tokens: number;
  total_cost: number;
}

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('id, chat_title, last_used_at, created_at, total_tokens, total_cost')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (title: string = 'New Chat') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          chat_title: title,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      await fetchSessions(); // Refresh the list
      return data.id;
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

      if (error) {
        console.error('Error updating session title:', error);
        return;
      }

      await fetchSessions(); // Refresh the list
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

      if (error) {
        console.error('Error updating session last used:', error);
      }
    } catch (error) {
      console.error('Error updating session last used:', error);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.chat_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions: filteredSessions,
    loading,
    searchQuery,
    setSearchQuery,
    createNewSession,
    updateSessionTitle,
    updateSessionLastUsed,
    refreshSessions: fetchSessions,
  };
};
