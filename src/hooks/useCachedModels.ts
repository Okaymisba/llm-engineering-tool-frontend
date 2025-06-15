
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CachedModelsData {
  models: any[];
  initiatingTime: number;
}

const CACHE_KEY = 'cached_models';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export const useCachedModels = () => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModelsFromSupabase = async () => {
    console.log('Fetching models from Supabase...');
    const { data, error } = await supabase
      .from('models')
      .select('id, name, total_tokens_this_month, provider, is_enabled')
      .eq('is_enabled', true)
      .order('total_tokens_this_month', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching models:', error);
      throw error;
    }

    console.log('Models fetched successfully:', data);
    return data || [];
  };

  const getCachedModels = (): CachedModelsData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached models:', error);
      return null;
    }
  };

  const setCachedModels = (models: any[]) => {
    const cacheData: CachedModelsData = {
      models,
      initiatingTime: Date.now()
    };
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Models cached successfully');
    } catch (error) {
      console.error('Error caching models:', error);
    }
  };

  const isCacheValid = (initiatingTime: number): boolean => {
    const currentTime = Date.now();
    const timeDifference = currentTime - initiatingTime;
    return timeDifference < CACHE_DURATION;
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedData = getCachedModels();
      
      if (cachedData && isCacheValid(cachedData.initiatingTime)) {
        console.log('Using cached models');
        setModels(cachedData.models);
      } else {
        console.log('Cache expired or not found, fetching fresh data');
        const freshModels = await fetchModelsFromSupabase();
        setModels(freshModels);
        setCachedModels(freshModels);
      }
    } catch (err) {
      console.error('Error loading models:', err);
      setError(err as Error);
      
      // Try to use cached data as fallback
      const cachedData = getCachedModels();
      if (cachedData) {
        console.log('Using cached models as fallback');
        setModels(cachedData.models);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return { models, loading, error, refetch: loadModels };
};
