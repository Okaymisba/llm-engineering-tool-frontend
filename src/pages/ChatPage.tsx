
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Upload, 
  Brain, 
  User, 
  LogOut, 
  Loader2,
  History,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  images?: string[];
  documents?: string[];
}

interface ChatHistory {
  question: string;
  answer: string;
}

export const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [useImageProcessing, setUseImageProcessing] = useState(false);
  const [useDocumentSearch, setUseDocumentSearch] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedDocuments(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && uploadedImages.length === 0 && uploadedDocuments.length === 0) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      images: uploadedImages.map(file => file.name),
      documents: uploadedDocuments.map(file => file.name)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    // Add AI response placeholder
    const aiMessageId = `ai_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('question', inputMessage);
      formData.append('provider', selectedProvider);
      formData.append('model', selectedModel);
      formData.append('our_image_processing_algo', useImageProcessing.toString());
      formData.append('document_semantic_search', useDocumentSearch.toString());

      // Add context from previous conversations
      if (chatHistory.length > 0) {
        const recentHistory = chatHistory.slice(-2); // Last 2 Q&A pairs
        const contextMessage = recentHistory.map(h => 
          `Previous Q: ${h.question}\nPrevious A: ${h.answer}`
        ).join('\n\n') + `\n\nCurrent Question: ${inputMessage}`;
        formData.set('question', contextMessage);
      }

      uploadedImages.forEach(image => {
        formData.append('upload_image', image);
      });

      uploadedDocuments.forEach(document => {
        formData.append('upload_document', document);
      });

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        fullResponse += chunk;
        
        // Update the AI message in real-time
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
      }

      // Add to chat history for context
      setChatHistory(prev => [...prev, {
        question: inputMessage,
        answer: fullResponse
      }]);

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      // Remove the AI message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
      setUploadedImages([]);
      setUploadedDocuments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Syncmind</span>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Chat History</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Provider</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useImageProcessing}
                      onChange={(e) => setUseImageProcessing(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Image Processing</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useDocumentSearch}
                      onChange={(e) => setUseDocumentSearch(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Document Search</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="bg-white/90 backdrop-blur-sm h-[70vh] flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Syncmind</h3>
                      <p className="text-gray-600">Start a conversation with our AI assistant</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg p-4 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.images && message.images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.images.map((image, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  {image}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {message.documents && message.documents.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.documents.map((doc, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {doc}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-gray-600">Generating response...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* File Uploads */}
                {(uploadedImages.length > 0 || uploadedDocuments.length > 0) && (
                  <div className="space-y-2">
                    {uploadedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((image, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {image.name}
                            <button
                              onClick={() => removeImage(index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {uploadedDocuments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {uploadedDocuments.map((doc, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc.name}
                            <button
                              onClick={() => removeDocument(index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="min-h-[50px] resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => documentInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || (!inputMessage.trim() && uploadedImages.length === 0 && uploadedDocuments.length === 0)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
