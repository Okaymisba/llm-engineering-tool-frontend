
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Model {
  id: string;
  name: string;
  provider: string;
  is_enabled: boolean;
}

interface ModelSelectorDropdownProps {
  selectedModel: string | null;
  onModelChange: (modelId: string) => void;
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  selectedModel,
  onModelChange,
}) => {
  const { data: models, isLoading } = useQuery({
    queryKey: ['chat-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('models')
        .select('id, name, provider, is_enabled')
        .eq('is_enabled', true)
        .order('provider', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching models:', error);
        throw error;
      }

      return data as Model[];
    },
  });

  if (isLoading) {
    return (
      <div className="w-80">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading models..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const selectedModelData = models?.find(m => m.id === selectedModel);

  return (
    <div className="w-80">
      <Select value={selectedModel || ''} onValueChange={onModelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a model">
            {selectedModelData && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedModelData.provider}
                </Badge>
                <span>{selectedModelData.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models?.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {model.provider}
                </Badge>
                <span>{model.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
