
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Sparkles, Zap, Eye, Brain, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Model } from '@/types/model';
import { cn } from '@/lib/utils';

export const fetchModels = async (): Promise<Model[]> => {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('is_enabled', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }
  
  return data?.map(model => ({
    id: model.id,
    name: model.name,
    provider: model.provider,
    model_id: model.model_id,
    is_enabled: model.is_enabled || false,
    total_tokens_this_month: model.total_tokens_this_month || 0,
    badge: model.badge,
    description: model.description,
    isReasoning: model.is_reasoning || false
  })) || [];
};

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return '🤖';
    case 'google':
      return '🔍';
    case 'anthropic':
      return '🧠';
    case 'deepseek':
      return '🔮';
    default:
      return '✨';
  }
};

const getProviderGradient = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'from-green-500 to-emerald-600';
    case 'google':
      return 'from-blue-500 to-indigo-600';
    case 'anthropic':
      return 'from-purple-500 to-violet-600';
    case 'deepseek':
      return 'from-orange-500 to-red-600';
    default:
      return 'from-gray-500 to-slate-600';
  }
};

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  loading?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  loading = false 
}) => {
  const [models, setModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      const fetchedModels = await fetchModels();
      setModels(fetchedModels);

      // Set default model if none selected
      if (!selectedModel && fetchedModels.length > 0) {
        const defaultModel = fetchedModels.find((model) => model.name === 'Gemini 2.0') || fetchedModels[0];
        onModelChange(defaultModel.id);
      }
    };

    loadModels();
  }, [selectedModel, onModelChange]);

  const selectedModelData = models.find(m => m.id === selectedModel);
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full max-w-md mx-auto">
        <div className="flex items-center space-x-2 px-4 py-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Loading models...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full max-w-md justify-between bg-white/60 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl px-4 py-3 h-auto"
          >
            {selectedModelData ? (
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getProviderGradient(selectedModelData.provider)} flex items-center justify-center text-white text-sm font-medium shadow-sm`}>
                  {getProviderIcon(selectedModelData.provider)}
                </div>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {selectedModelData.name}
                    </span>
                    {selectedModelData.isReasoning && (
                      <Brain className="h-3 w-3 text-purple-600" title="Reasoning Model" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {selectedModelData.provider}
                    </span>
                    {selectedModelData.badge && (
                      <Badge
                        variant={selectedModelData.badge === 'Free' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          selectedModelData.badge === 'Free'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                            : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200'
                        )}
                      >
                        {selectedModelData.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Select a model...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 data-[state=open]:rotate-180" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
          <Command className="rounded-2xl">
            <div className="flex items-center border-b border-gray-100 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search models..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No models found</p>
                </div>
              </CommandEmpty>
              
              <CommandGroup>
                {filteredModels.map((model) => (
                  <CommandItem
                    key={model.id}
                    onSelect={() => {
                      onModelChange(model.id);
                      setOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all duration-150 rounded-xl mx-2 my-1"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedModel === model.id ? "opacity-100 text-blue-600" : "opacity-0"
                      )}
                    />
                    
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getProviderGradient(model.provider)} flex items-center justify-center text-white text-sm font-medium shadow-sm flex-shrink-0`}>
                      {getProviderIcon(model.provider)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {model.name}
                        </span>
                        {model.isReasoning && (
                          <Brain className="h-3 w-3 text-purple-600 flex-shrink-0" title="Reasoning Model" />
                        )}
                        {model.badge && (
                          <Badge
                            variant={model.badge === 'Free' ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                              model.badge === 'Free'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                                : 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200'
                            )}
                          >
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize truncate">
                          {model.provider}
                        </span>
                        {model.total_tokens_this_month > 0 && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {(model.total_tokens_this_month / 1000).toFixed(0)}K tokens
                          </span>
                        )}
                      </div>
                      
                      {model.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {model.description}
                        </p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
