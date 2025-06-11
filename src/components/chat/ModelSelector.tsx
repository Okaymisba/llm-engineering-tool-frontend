
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Model } from '@/types/model';

export const fetchModels = async (): Promise<Model[]> => {
  const { data, error } = await supabase.from('models').select('*');
  if (error) {
    console.error('Error fetching models:', error);
    return [];
  }
  return data || [];
};

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      const fetchedModels = await fetchModels();
      setModels(fetchedModels);

      // Set Gemini 2.0 as the default model if none is selected
      if (!selectedModel && fetchedModels.length > 0) {
        const defaultModel = fetchedModels.find((model) => model.name === 'Gemini 2.0') || fetchedModels[0];
        onModelChange(defaultModel.id);
      }
    };

    loadModels();
  }, [selectedModel, onModelChange]);

  return (
    <div className="flex-1 max-w-md mx-8">
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{model.name}</span>
                    <Badge
                      variant={model.badge === 'Free' ? 'default' : 'secondary'}
                      className={
                        model.badge === 'Free'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                      }
                    >
                      {model.badge}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
