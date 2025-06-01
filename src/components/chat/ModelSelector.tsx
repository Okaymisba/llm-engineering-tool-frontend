
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const models = [
  { id: 'gemini-2.0-flash', name: 'Google: Gemini 2.0 Flash', badge: 'Free', description: 'Fast responses, great for general tasks', provider: 'google' },
  { id: 'Deepseek-r1-0528:free', name: 'Deepseek: R1 (Reasoning)', badge: 'Free', description: 'Advanced reasoning capabilities', provider: 'deepseek', isReasoning: true },
  { id: 'Deepseek-chat-v3-0324:free', name: 'Deepseek: V3', badge: 'Free', description: 'Powerful conversational AI', provider: 'deepseek' },
  { id: 'gpt-4o', name: 'OpenAI: GPT-4o', badge: 'Paid', description: 'Most capable model for complex tasks', provider: 'openai' },
  { id: 'claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet', badge: 'Paid', description: 'Excellent for analysis and writing', provider: 'anthropic' },
  { id: 'gpt-4o-mini', name: 'OpenAI: GPT-4o Mini', badge: 'Paid', description: 'Balanced speed and capability', provider: 'openai' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
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
                    <Badge variant={model.badge === 'Free' ? 'default' : 'secondary'} className={
                      model.badge === 'Free' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                    }>
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

export { models };
