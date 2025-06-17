
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Settings, LogOut, History, X, ArrowDown, User, UserCheck2Icon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { FileUpload } from '@/components/chat/FileUpload';
import { fetchModels } from '@/components/chat/ModelSelector';
import { Model } from '@/types/model';
import { WebSearchToggle } from '@/components/chat/WebSearchToggle';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatMessages } from '@/hooks/useChatMessages';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  reasoning?: string;
  isReasoningComplete?: boolean;
  webSearchResults?: any[];
  isSearching?: boolean;
  metadata?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface UploadedFile {
  file: File;
  type: 'image' | 'document';
  preview?: string;
}

interface ChatPageProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

// Helper function to parse JSON objects from stream
const parseJSONStream = (buffer: string): { parsed: any[], remaining: string } => {
  const parsed: any[] = [];
  let remaining = buffer;
  let depth = 0;
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < remaining.length; i++) {
    const char = remaining[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      
      if (depth === 0) {
        const jsonStr = remaining.substring(start, i + 1);
        try {
          const obj = JSON.parse(jsonStr);
          parsed.push(obj);
        } catch (e) {
          console.warn('Failed to parse JSON object:', jsonStr);
        }
        start = i + 1;
      }
    }
  }
  
  return {
    parsed,
    remaining: remaining.substring(start)
  };
};

export const ChatPage: React.FC<ChatPageProps> = ({ selectedModel, onModelChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, token, session, logout, refreshSession, isTokenValid } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { createSession, updateSessionLastUsed, updateSessionTitle } = useChatSessions();
  const { messages: historyMessages, loading: historyLoading } = useChatMessages(currentSessionId);

  // Convert history messages to display format
  const convertHistoryToMessages = (historyMessages: any[]): Message[] => {
    const convertedMessages: Message[] = [];
    
    historyMessages.forEach((msg) => {
      // Add user message
      convertedMessages.push({
        id: `${msg.id}_user`,
        content: msg.question,
        role: 'user',
        timestamp: new Date(msg.created_at),
      });
      
      // Add assistant message if answer exists
      if (msg.answer) {
        convertedMessages.push({
          id: `${msg.id}_assistant`,
          content: msg.answer,
          role: 'assistant',
          timestamp: new Date(msg.created_at),
          metadata: {
            prompt_tokens: msg.input_tokens,
            completion_tokens: msg.output_tokens,
            total_tokens: msg.total_tokens,
          },
        });
      }
    });
    
    return convertedMessages;
  };

  // Load history messages when session changes
  useEffect(() => {
    if (currentSessionId && historyMessages.length > 0) {
      const convertedMessages = convertHistoryToMessages(historyMessages);
      setMessages(convertedMessages);
    } else if (!currentSessionId) {
      setMessages([]);
    }
  }, [currentSessionId, historyMessages]);

  // Load models when component mounts
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading models...');
        setModelsLoading(true);
        const models = await fetchModels();
        console.log('Models loaded:', models);
        setAvailableModels(models);
        
        // Set default model if none selected
        if (!selectedModel && models.length > 0) {
          const defaultModel = models.find(m => m.name === 'Gemini 2.0') || models[0];
          console.log('Setting default model:', defaultModel);
          onModelChange(defaultModel.id);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        toast({
          title: "Error",
          description: "Failed to load models. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, [selectedModel, onModelChange, toast]);

  // Session monitoring
  useEffect(() => {
    if (!session) return;

    const checkTokenExpiry = () => {
      if (!isTokenValid()) {
        console.log('Token is about to expire, attempting refresh...');
        refreshSession().then((success) => {
          if (!success) {
            console.log('Session refresh failed, user may need to log in again');
            toast({
              title: "Session Expired",
              description: "Please log in again to continue.",
              variant: "destructive",
            });
          }
        });
      }
    };

    const tokenCheckInterval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(tokenCheckInterval);
  }, [session, isTokenValid, refreshSession, toast]);

  const validateAndRefreshToken = async (): Promise<string | null> => {
    if (!session || !token) return null;

    if (isTokenValid()) return token;

    console.log('Token expired, attempting refresh...');
    const refreshSuccess = await refreshSession();
    
    if (refreshSuccess && session) {
      return session.access_token;
    }

    return null;
  };

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollToBottom(false);
    setIsUserScrolled(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollToBottom(!isNearBottom);
    setIsUserScrolled(scrollTop > 0 && !isNearBottom);
  };

  useEffect(() => {
    if (!isUserScrolled) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isStreaming && !isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.role === 'assistant' && msg.isStreaming
            ? { 
                ...msg, 
                content: msg.content + '\n\n*Response was cancelled*',
                isStreaming: false,
                isReasoningComplete: true
              }
            : msg
        )
      );

      toast({
        title: "Request Cancelled",
        description: "The response generation has been stopped.",
      });
    }
  };

  const handleFileAdded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    updateSessionLastUsed(sessionId);
    setSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading) return;

    const validToken = await validateAndRefreshToken();
    if (!validToken) {
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const selectedModelData = availableModels.find(m => m.id === selectedModel);
    console.log('Selected model ID:', selectedModel);
    console.log('Available models:', availableModels);
    console.log('Selected model data:', selectedModelData);
    
    if (!selectedModelData) {
      toast({
        title: "Model Error",
        description: "Please select a valid model before sending a message.",
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
    const currentFiles = [...uploadedFiles];
    setInputValue('');
    setUploadedFiles([]);
    setIsLoading(true);
    setIsUserScrolled(false);

    const aiMessageId = (Date.now() + 1).toString();
    const isReasoningModel = selectedModelData?.isReasoning || false;
    
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
      reasoning: isReasoningModel ? '' : undefined,
      isReasoningComplete: false,
      isSearching: webSearchEnabled,
      webSearchResults: undefined,
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      const formData = new FormData();
      
      // Only include session_id if we have one from the server
      if (currentSessionId) {
        formData.append('session_id', currentSessionId);
      }
      
      formData.append('question', currentInput);
      formData.append('provider', selectedModelData.provider);
      formData.append('model', selectedModelData.model_id);
      formData.append('web_search', webSearchEnabled.toString());
      formData.append('our_image_processing_algo', 'false');
      formData.append('document_semantic_search', 'false');

      console.log('Sending to backend:', {
        provider: selectedModelData.provider,
        model: selectedModelData.model_id,
        web_search: webSearchEnabled.toString(),
        session_id: currentSessionId,
        tokenValid: isTokenValid()
      });

      currentFiles.forEach((uploadedFile) => {
        if (uploadedFile.type === 'image') {
          formData.append('upload_image', uploadedFile.file);
        } else {
          formData.append('upload_document', uploadedFile.file);
        }
      });

      const API_BASE_URL = 'http://localhost:8000';
      abortControllerRef.current = new AbortController();

      const headers: { [key: string]: string } = {
        'Authorization': `Bearer ${validToken}`,
      };

      // Add refresh token header
      if (session?.refresh_token) {
        headers['x-refresh-token'] = session.refresh_token;
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, attempting token refresh...');
          const refreshedToken = await validateAndRefreshToken();
          
          if (refreshedToken) {
            const retryHeaders = { ...headers, 'Authorization': `Bearer ${refreshedToken}` };
            const retryResponse = await fetch(`${API_BASE_URL}/chat`, {
              method: 'POST',
              headers: retryHeaders,
              body: formData,
              signal: abortControllerRef.current.signal,
            });
            
            if (!retryResponse.ok) {
              const errorText = await retryResponse.text();
              throw new Error(`HTTP error! status: ${retryResponse.status}, message: ${errorText}`);
            }
            
            // Continue with retry response
            await processStreamResponse(retryResponse, aiMessageId, isReasoningModel);
            return;
          } else {
            throw new Error('Authentication failed. Please log in again.');
          }
        }
        
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      await processStreamResponse(response, aiMessageId, isReasoningModel);

    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      let errorMessage = "Failed to send message. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Unable to connect to server. Please check your connection.";
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = "Authentication failed. Please log in again.";
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
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                isStreaming: false,
                isSearching: false
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const processStreamResponse = async (response: Response, aiMessageId: string, isReasoningModel: boolean) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let isReasoningPhase = isReasoningModel;
    let buffer = '';
    let newSessionId = currentSessionId;

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          const { parsed, remaining } = parseJSONStream(buffer);
          buffer = remaining;
          
          for (const parsedChunk of parsed) {
            console.log('Received chunk:', parsedChunk);
            
            if (parsedChunk.type === 'session_id') {
              // Handle server-provided session ID
              newSessionId = parsedChunk.data;
              setCurrentSessionId(newSessionId);
              console.log('Server provided session_id:', newSessionId);
            } else if (parsedChunk.type === 'web_search') {
              console.log('Web search chunk data:', parsedChunk.data);
              
              if (typeof parsedChunk.data === 'string') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, isSearching: true }
                      : msg
                  )
                );
              } else {
                let searchResults = [];
                
                if (Array.isArray(parsedChunk.data) && parsedChunk.data.length > 0) {
                  if (Array.isArray(parsedChunk.data[0])) {
                    searchResults = parsedChunk.data[0];
                  } else {
                    searchResults = parsedChunk.data;
                  }
                }
                
                console.log('Processed search results:', searchResults);
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { 
                          ...msg, 
                          isSearching: false, 
                          webSearchResults: searchResults
                        }
                      : msg
                  )
                );
              }
            } else if (parsedChunk.type === 'reasoning') {
              accumulatedReasoning += parsedChunk.data;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, reasoning: accumulatedReasoning }
                    : msg
                )
              );
            } else if (parsedChunk.type === 'content') {
              if (isReasoningPhase) {
                isReasoningPhase = false;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, isReasoningComplete: true }
                      : msg
                  )
                );
              }
              accumulatedContent += parsedChunk.data;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            } else if (parsedChunk.type === 'metadata') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, metadata: parsedChunk.data }
                    : msg
                )
              );
            } else if (parsedChunk.type === 'error') {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { 
                        ...msg, 
                        content: `Error: ${parsedChunk.data}`,
                        isStreaming: false,
                        isSearching: false
                      }
                    : msg
                )
              );
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    setMessages(prev => 
      prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              isStreaming: false, 
              isReasoningComplete: true,
              isSearching: false
            }
          : msg
      )
    );

    // Create session if we got a new session ID and it's the first message
    if (newSessionId && !currentSessionId && messages.length === 0) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
        await updateSessionTitle(newSessionId, title);
      }
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
    toast({
      title: "Settings",
      description: "Settings page coming soon!",
    });
  };

  const handleChatHistory = () => {
    toast({
      title: "Chat History",
      description: "Chat history feature coming soon!",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <ChatSidebar
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Header with Sidebar Toggle */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {!isMobile && (
              <h1 className="text-xl font-semibold text-gray-900">Syncmind</h1>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChatHistory}>
                  <History className="mr-2 h-4 w-4" />
                  <span>History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 flex flex-col relative">
          {/* Messages Area */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto py-6 space-y-4"
            style={{ minHeight: 0 }}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center max-w-md">
                  <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
                  <p className="text-gray-600">
                    Start a conversation with {availableModels.find(m => m.id === selectedModel)?.name || 'AI'}.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  username={user?.username} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <Button
              onClick={() => scrollToBottom()}
              className="fixed bottom-24 right-8 h-10 w-10 rounded-full bg-white border shadow-lg hover:shadow-xl z-10"
              size="icon"
              variant="outline"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}

          {/* Cancel Button during streaming */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleCancelRequest}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 fixed bottom-32 left-1/2 transform -translate-x-1/2 z-20 bg-white shadow-lg"
              >
                <X className="h-4 w-4" />
                Stop generating
              </Button>
            </div>
          )}

          {/* Input Area */}
          <div className="py-4 sticky bottom-0 bg-gray-50">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <FileUpload 
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    isLoading={isLoading}
                    onFileAdded={handleFileAdded}
                  />
                  
                  <WebSearchToggle
                    enabled={webSearchEnabled}
                    onToggle={setWebSearchEnabled}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex-1 min-w-0 relative">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message Syncmind..."
                    className="min-h-[40px] max-h-32 resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base bg-transparent"
                    disabled={isLoading}
                    rows={1}
                    style={{ 
                      height: 'auto',
                      lineHeight: '1.5'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                  />
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
                  size="icon"
                  className="h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-xl shrink-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
