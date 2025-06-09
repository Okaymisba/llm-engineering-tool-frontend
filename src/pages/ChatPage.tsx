
import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ModelSelectorDropdown } from '@/components/chat/ModelSelectorDropdown';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { FileUpload } from '@/components/chat/FileUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface UploadedFile {
  file: File;
  type: 'image' | 'document';
  preview?: string;
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileAdded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm a simulated response to: "${userMessage.content}". This is where the actual AI model would respond using the selected model.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Model Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            <Bot className="h-6 w-6 text-blue-600" />
            <ModelSelectorDropdown
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Messages Area */}
          <Card className="flex-1 overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
            <div className="h-full overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bot className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to AIHub Chat
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedModel ? 'Start a conversation by typing a message below.' : 'Select a model above to get started.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-md">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </Card>

          {/* Input Area */}
          <div className="mt-4 space-y-4">
            <FileUpload 
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              isLoading={isLoading}
              onFileAdded={handleFileAdded}
            />
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
              <div className="p-4">
                <div className="flex space-x-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedModel ? "Type your message..." : "Please select a model first"}
                    className="flex-1 min-h-[60px] resize-none border-0 focus:ring-0 bg-transparent"
                    disabled={!selectedModel || isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || !selectedModel || isLoading}
                    size="icon"
                    className="h-12 w-12 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
