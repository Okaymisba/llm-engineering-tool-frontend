
import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface WebSearchResultsProps {
  isSearching?: boolean;
  webSearchResults?: any[];
}

export const WebSearchResults: React.FC<WebSearchResultsProps> = ({
  isSearching,
  webSearchResults
}) => {
  if (!isSearching && !webSearchResults) return null;

  return (
    <Collapsible className="mb-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl hover:from-purple-100 hover:to-blue-100 transition-all duration-200 shadow-sm hover:shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isSearching ? 'bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
            {isSearching && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-ping opacity-75"></div>
            )}
          </div>
          <Globe className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {isSearching ? 'Searching the web...' : 'Web Search Results'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-purple-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3">
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {isSearching ? (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-spin">
                  <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Finding relevant information...</span>
              </div>
              
              {/* Skeleton loaders */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : webSearchResults && webSearchResults.length > 0 ? (
            <div className="p-4">
              <div className="grid gap-3">
                {webSearchResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-blue-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                            Source {index + 1}: {result.title || result.url || 'Web result'}
                          </h4>
                        </div>
                        {result.snippet && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                            {result.snippet}
                          </p>
                        )}
                        {result.url && (
                          <div className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-xs">{new URL(result.url).hostname}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 mx-auto mb-3 flex items-center justify-center">
                <Globe className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600">No search results found</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
