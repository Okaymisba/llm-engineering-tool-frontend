
import React from 'react';
import { Search, Plus, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatSessions } from '@/hooks/useChatSessions';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  className?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentSessionId,
  onNewChat,
  onSelectSession,
  className = "",
}) => {
  const {
    sessions,
    loading,
    searchQuery,
    setSearchQuery,
  } = useChatSessions();

  if (loading) {
    return (
      <div className={`flex flex-col h-full bg-gray-50 border-r ${className}`}>
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <Button
          onClick={onNewChat}
          className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-white/60 group ${
                  currentSessionId === session.id
                    ? 'bg-white shadow-sm border border-gray-200'
                    : 'hover:bg-white/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                      {session.chat_title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(session.last_used_at), { addSuffix: true })}
                      </span>
                    </div>
                    {session.total_tokens > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {session.total_tokens.toLocaleString()} tokens
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
