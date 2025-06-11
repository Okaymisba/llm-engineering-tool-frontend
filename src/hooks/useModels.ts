
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Model } from '@/types/model';

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_enabled', true)
        .order('name');

      if (error) throw error;

      const formattedModels: Model[] = data.map(model => ({
        id: model.model_id,
        name: model.name,
        provider: model.provider,
        is_enabled: model.is_enabled || false,
        total_tokens_this_month: model.total_tokens_this_month || 0,
        badge: model.badge,
        description: model.description,
        isReasoning: model.is_reasoning || false
      }));

      setModels(formattedModels);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return { models, loading, refetchModels: fetchModels };
};
