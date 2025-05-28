import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  displayedContent?: string;
}

const models = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: 'Free & Fast', description: 'Fast responses, great for general tasks', provider: 'google' },
  { id: 'gpt-4o', name: 'GPT-4o', badge: 'Premium', description: 'Most capable model for complex tasks', provider: 'openai' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Premium', description: 'Excellent for analysis and writing', provider: 'anthropic' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', badge: 'Fast', description: 'Balanced speed and capability', provider: 'openai' },
];

export const ChatPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after AI response completes
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isTyping && !isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  // Faster word-by-word typing animation
  const typeMessage = (messageId: string, fullContent: string) => {
    const words = fullContent.split(' ');
    let currentWordIndex = 0;
    
    // Dynamic speed based on content length - faster for longer content
    const getTypingSpeed = () => {
      if (words.length > 150) return 15; // Very fast for long responses
      if (words.length > 50) return 20;  // Fast for medium responses
      return 25; // Standard speed for short responses
    };
    
    const typingSpeed = getTypingSpeed();
    
    const typeNextWord = () => {
      if (currentWordIndex < words.length) {
        const displayedContent = words.slice(0, currentWordIndex + 1).join(' ');
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, displayedContent }
              : msg
          )
        );
        
        currentWordIndex++;
        typingIntervalRef.current = setTimeout(typeNextWord, typingSpeed);
      } else {
        // Typing complete
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isTyping: false, displayedContent: fullContent }
              : msg
          )
        );
        if (typingIntervalRef.current) {
          clearTimeout(typingIntervalRef.current);
        }
      }
    };

    typeNextWord();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true,
      displayedContent: '',
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      const selectedModelData = models.find(m => m.id === selectedModel);
      
      console.log('Sending chat request with:', {
        session_id: sessionId,
        question: currentInput,
        provider: selectedModelData?.provider,
        model: selectedModel
      });

      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question', currentInput);
      formData.append('provider', selectedModelData?.provider || 'google');
      formData.append('model', selectedModel);
      formData.append('our_image_processing_algo', 'false');
      formData.append('document_semantic_search', 'false');

      console.log('Making request to /chat endpoint with token...');

      const API_BASE_URL = 'http://localhost:8000';

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.answer) {
        // Update the AI message with content and start typing animation
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: data.answer, isTyping: true }
              : msg
          )
        );
        
        // Start word-by-word typing
        typeMessage(aiMessageId, data.answer);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "Failed to send message. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Unable to connect to server. Please check your connection.";
        } else if (error.message.includes('401')) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message.includes('403')) {
          errorMessage = "Access denied. Please check your permissions.";
        } else if (error.message.includes('404')) {
          errorMessage = "Chat endpoint not found. Please check server configuration.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again later.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Update AI message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                isTyping: false,
                displayedContent: "Sorry, I encountered an error while processing your request. Please try again."
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSettings = () => {
    // Placeholder for settings functionality
    toast({
      title: "Settings",
      description: "Settings page coming soon!",
    });
  };

  // Enhanced Markdown components with syntax highlighting and better styling
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return !inline && language ? (
        <div className="my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{language}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(String(children))}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100 transition-colors"
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="bg-purple-50 text-purple-800 px-2 py-1 rounded-md text-sm font-mono border border-purple-200" 
          {...props}
        >
          {children}
        </code>
      );
    },
    
    pre: ({ children }: any) => (
      <div className="overflow-hidden rounded-lg my-4">
        {children}
      </div>
    ),
    
    p: ({ children }: any) => (
      <p className="mb-4 last:mb-0 leading-relaxed text-gray-800">{children}</p>
    ),
    
    ul: ({ children }: any) => (
      <ul className="list-none mb-4 space-y-2 pl-0">{children}</ul>
    ),
    
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 pl-4 text-gray-800">{children}</ol>
    ),
    
    li: ({ children }: any) => (
      <li className="flex items-start">
        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
        <span className="text-gray-800">{children}</span>
      </li>
    ),
    
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    
    em: ({ children }: any) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">{children}</h1>
    ),
    
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold mb-3 text-gray-900 mt-6">{children}</h2>
    ),
    
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium mb-2 text-gray-900 mt-4">{children}</h3>
    ),
    
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg">
        <div className="text-gray-700 italic">{children}</div>
      </blockquote>
    ),
    
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }: any) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    ),
    
    tr: ({ children }: any) => (
      <tr className="hover:bg-gray-50">{children}</tr>
    ),
    
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-gray-900">{children}</td>
    ),
    
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-default">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">AIHub</span>
            </div>
            
            {/* Model Selector */}
            <div className="flex-1 max-w-md mx-8">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{model.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              model.badge === 'Free & Fast' 
                                ? 'bg-green-100 text-green-700' 
                                : model.badge === 'Fast'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {model.badge}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{model.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                    <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-6">
          <div className="space-y-6 pr-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl max-w-md">
                  <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">
                    Ask me anything! I'm powered by {models.find(m => m.id === selectedModel)?.name}.
                  </p>
                </Card>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-6 py-4 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white shadow-lg border border-gray-100'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap text-white leading-relaxed">
                          {message.content}
                        </p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown 
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.displayedContent || message.content}
                          </ReactMarkdown>
                          {message.isTyping && (
                            <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1 rounded-sm" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`flex items-end ${message.role === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}>
                        {message.role === 'user' ? user?.username?.charAt(0).toUpperCase() : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="border-0 focus-visible:ring-0 text-base resize-none bg-transparent"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
