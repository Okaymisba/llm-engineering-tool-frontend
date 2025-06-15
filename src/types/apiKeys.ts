
export interface ApiKeyInfo {
  id: string;
  api_key: string;
  label: string;
  instructions: string;
  total_tokens: number;
  tokens_used: number;
  tokens_remaining: number;
  token_limit_per_day: number;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiKeyFormData {
  label: string;
  instructions: string;
  token_limit: number;
}
