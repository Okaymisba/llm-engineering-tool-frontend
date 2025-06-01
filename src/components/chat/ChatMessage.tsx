
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

interface ChatMessageProps {
  message: Message;
  username?: string;
}

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

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, username }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
              {/* Reasoning Section for Reasoning Models */}
              {message.reasoning !== undefined && (
                <Collapsible className="mb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-amber-800">
                        {message.isReasoningComplete ? 'Reasoning Complete' : 'Thinking...'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-amber-600 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="p-4 bg-amber-25 border border-amber-100 rounded-lg">
                      <div className="text-sm text-amber-900 whitespace-pre-wrap font-mono">
                        {message.reasoning}
                        {!message.isReasoningComplete && (
                          <span className="inline-block w-2 h-4 bg-amber-500 animate-pulse ml-1 rounded-sm" />
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {/* Main Content */}
              {message.isStreaming && !message.content ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Generating response...</span>
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
                    <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1 rounded-sm" />
                  )}
                </>
              )}
              
              {/* Metadata */}
              {message.metadata && (
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Tokens: {message.metadata.prompt_tokens} + {message.metadata.completion_tokens} = {message.metadata.total_tokens}
                </div>
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
            {message.role === 'user' ? username?.charAt(0).toUpperCase() : 'AI'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
