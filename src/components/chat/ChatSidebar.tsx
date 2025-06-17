
import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSessions, ChatSession } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentSessionId,
  onNewChat,
  onSelectSession,
  isOpen,
  onToggle
}) => {
  const { sessions, loading } = useChatSessions();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.chat_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out",
        "w-80 md:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={onNewChat}
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">Loading chats...</div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
                  <div className="text-sm text-gray-500">
                    {searchTerm ? 'No chats found' : 'No chats yet'}
                  </div>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg mb-1 transition-colors",
                      "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                      currentSessionId === session.id ? "bg-blue-50 border border-blue-200" : ""
                    )}
                  >
                    <div className="font-medium text-sm text-gray-900 truncate mb-1">
                      {session.chat_title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(session.last_used_at)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};
