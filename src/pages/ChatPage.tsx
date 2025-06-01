
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Settings, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { FileUpload } from '@/components/chat/FileUpload';
import { ModelSelector, models } from '@/components/chat/ModelSelector';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  reasoning?: string;
  isReasoningComplete?: boolean;
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

export const ChatPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isStreaming && !isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  const handleFileAdded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading) return;

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
    const currentFiles = [...uploadedFiles];
    setInputValue('');
    setUploadedFiles([]);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const selectedModelData = models.find(m => m.id === selectedModel);
    const isReasoningModel = selectedModelData?.isReasoning || false;
    
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
      reasoning: isReasoningModel ? '' : undefined,
      isReasoningComplete: false,
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      console.log('Sending chat request with:', {
        session_id: sessionId,
        question: currentInput,
        provider: selectedModelData?.provider,
        model: selectedModel,
        files: currentFiles.map(f => ({ name: f.file.name, type: f.type }))
      });

      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question', currentInput);
      formData.append('provider', selectedModelData?.provider || 'google');
      formData.append('model', selectedModel);
      formData.append('our_image_processing_algo', 'false');
      formData.append('document_semantic_search', 'false');

      currentFiles.forEach((uploadedFile) => {
        if (uploadedFile.type === 'image') {
          formData.append('upload_image', uploadedFile.file);
        } else {
          formData.append('upload_document', uploadedFile.file);
        }
      });

      console.log('Making streaming request to /chat endpoint...');

      const API_BASE_URL = 'http://localhost:8000';
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let isReasoningPhase = isReasoningModel;
      let buffer = '';

      console.log('Starting to read stream...');

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('Stream finished');
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk:', chunk);
            buffer += chunk;
            
            // Process complete JSON objects
            let lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line);
                  console.log('Parsed JSON:', parsed);
                  
                  if (parsed.type === 'reasoning') {
                    accumulatedReasoning += parsed.data;
                    console.log('Adding reasoning:', parsed.data);
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, reasoning: accumulatedReasoning }
                          : msg
                      )
                    );
                  } else if (parsed.type === 'content') {
                    if (isReasoningPhase) {
                      isReasoningPhase = false;
                      console.log('Reasoning phase complete');
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { ...msg, isReasoningComplete: true }
                            : msg
                        )
                      );
                    }
                    accumulatedContent += parsed.data;
                    console.log('Adding content:', parsed.data);
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    );
                  } else if (parsed.type === 'metadata') {
                    console.log('Received metadata:', parsed.data);
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, metadata: parsed.data }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  console.warn('Failed to parse JSON:', line, e);
                  // If not JSON, treat as plain text content
                  accumulatedContent += line;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      console.log('Setting final message state');
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false, isReasoningComplete: true }
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
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                isStreaming: false
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 cursor-default">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Syncmind</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChatHistory}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <History className="h-4 w-4" />
                <span>Chat History</span>
              </Button>
            </div>
            
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

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
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  username={user?.username} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-end space-x-3">
            <FileUpload 
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              isLoading={isLoading}
              onFileAdded={handleFileAdded}
            />
            
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
              disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
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
