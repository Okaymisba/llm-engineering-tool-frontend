import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Settings, LogOut, History, X, ArrowDown, User, UserCheck2Icon } from 'lucide-react';
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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const { user, token, session, logout, refreshSession, isTokenValid } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Add session monitoring
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

    // Check token validity every 5 minutes
    const tokenCheckInterval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [session, isTokenValid, refreshSession, toast]);

  // Validate token before making API calls
  const validateAndRefreshToken = async (): Promise<string | null> => {
    if (!session || !token) {
      return null;
    }

    if (isTokenValid()) {
      return token;
    }

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

  // Cleanup on unmount or page reload
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
      
      // Update the last message to show it was cancelled
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

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Validate token before proceeding
    const validToken = await validateAndRefreshToken();
    if (!validToken) {
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Debug: Log model selection
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
      formData.append('session_id', sessionId);
      formData.append('question', currentInput);
      formData.append('provider', selectedModelData.provider);
      formData.append('model', selectedModelData.model_id); // Use model_id instead of UUID
      formData.append('web_search', webSearchEnabled.toString());
      formData.append('our_image_processing_algo', 'false');
      formData.append('document_semantic_search', 'false');

      // Debug: Log what we're sending
      console.log('Sending to backend:', {
        provider: selectedModelData.provider,
        model: selectedModelData.model_id,
        web_search: webSearchEnabled.toString(),
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

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validToken}`,
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, attempting token refresh...');
          const refreshedToken = await validateAndRefreshToken();
          
          if (refreshedToken) {
            // Retry the request with refreshed token
            const retryResponse = await fetch(`${API_BASE_URL}/chat`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${refreshedToken}`,
              },
              body: formData,
              signal: abortControllerRef.current.signal,
            });
            
            if (!retryResponse.ok) {
              const errorText = await retryResponse.text();
              throw new Error(`HTTP error! status: ${retryResponse.status}, message: ${errorText}`);
            }
            
            // Continue with the retry response
            const reader = retryResponse.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let accumulatedReasoning = '';
            let isReasoningPhase = isReasoningModel;
            let buffer = '';

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
                    
                    if (parsedChunk.type === 'web_search') {
                      console.log('Web search chunk data:', parsedChunk.data);
                      
                      if (typeof parsedChunk.data === 'string') {
                        // Still searching
                        setMessages(prev => 
                          prev.map(msg => 
                            msg.id === aiMessageId 
                              ? { ...msg, isSearching: true }
                              : msg
                          )
                        );
                      } else {
                        // Search results received - extract from nested array structure
                        let searchResults = [];
                        
                        if (Array.isArray(parsedChunk.data) && parsedChunk.data.length > 0) {
                          // Handle nested array structure: data: [[{results}]]
                          if (Array.isArray(parsedChunk.data[0])) {
                            searchResults = parsedChunk.data[0];
                          } else {
                            // Handle flat array structure: data: [{results}]
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

            return;
          } else {
            throw new Error('Authentication failed. Please log in again.');
          }
        }
        
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let isReasoningPhase = isReasoningModel;
      let buffer = '';

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
              
              if (parsedChunk.type === 'web_search') {
                console.log('Web search chunk data:', parsedChunk.data);
                
                if (typeof parsedChunk.data === 'string') {
                  // Still searching
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, isSearching: true }
                        : msg
                    )
                  );
                } else {
                  // Search results received - extract from nested array structure
                  let searchResults = [];
                  
                  if (Array.isArray(parsedChunk.data) && parsedChunk.data.length > 0) {
                    // Handle nested array structure: data: [[{results}]]
                    if (Array.isArray(parsedChunk.data[0])) {
                      searchResults = parsedChunk.data[0];
                    } else {
                      // Handle flat array structure: data: [{results}]
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
          // Optionally redirect to login or trigger re-authentication
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
    <div className="min-h-screen w-full bg-gray-50 flex flex-col font-sans">
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
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
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
  );
};

export default ChatPage;
