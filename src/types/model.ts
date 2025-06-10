
export interface Model {
  id: string;
  name: string;
  provider: string;
  is_enabled: boolean;
  total_tokens_this_month?: number;
  created_at?: string;
  updated_at?: string;
}
