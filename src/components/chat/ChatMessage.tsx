import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Copy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { WebSearchResults } from './WebSearchResults';

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

interface ChatMessageProps {
  message: Message;
  username?: string;
}

const markdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    return !inline && language ? (
      <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-300 font-medium">{language}</span>
          <Button 
            onClick={() => navigator.clipboard.writeText(String(children))}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
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
            background: 'transparent',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code 
        className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" 
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
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside mb-3 space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 pl-4">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic">{children}</em>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-xl font-bold mb-3 text-gray-900 border-b border-gray-200 pb-2">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold mb-2 text-gray-900 mt-4">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-medium mb-2 text-gray-900 mt-3">{children}</h3>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-3 bg-gray-50 rounded-r">
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

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, username }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {!isUser && (
        <div className="shrink-0">
          <Avatar className="h-8 w-8 bg-green-100">
            <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
              AI
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          isUser 
            ? 'bg-gray-900 text-white ml-auto' 
            : 'bg-white border border-gray-200'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-800">
              {/* Web Search Section - Using new component */}
              <WebSearchResults 
                isSearching={message.isSearching}
                webSearchResults={message.webSearchResults}
              />

              {/* Reasoning Section */}
              {message.reasoning !== undefined && (
                <Collapsible defaultOpen={true} className="mb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${message.isReasoningComplete ? 'bg-orange-500' : 'bg-orange-500 animate-pulse'}`}></div>
                      <span className="text-sm font-medium text-orange-800">
                        {message.isReasoningComplete ? 'Reasoning Complete' : 'Thinking...'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-orange-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="p-3 bg-orange-25 border border-orange-100 rounded-lg">
                      <div className="text-sm text-orange-900 whitespace-pre-wrap font-mono leading-relaxed">
                        {message.reasoning}
                        {!message.isReasoningComplete && (
                          <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1 rounded-sm" />
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {/* Main Content */}
              {message.isStreaming && !message.content ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-500 text-sm">Generating response...</span>
                </div>
              ) : (
                <>
                  <ReactMarkdown 
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-5 bg-gray-600 animate-pulse ml-1 rounded-sm" />
                  )}
                </>
              )}
              
              {/* Metadata */}
              {message.metadata && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 border">
                  <span className="font-medium">Tokens:</span> {message.metadata.prompt_tokens} + {message.metadata.completion_tokens} = {message.metadata.total_tokens}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isUser && (
        <div className="shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};
