
export interface Model {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  is_enabled: boolean;
  total_tokens_this_month?: number;
  created_at?: string;
  updated_at?: string;
  badge?: string;
  description?: string;
  isReasoning?: boolean;
}
