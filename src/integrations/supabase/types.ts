export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apis: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          instructions: string | null
          label: string
          last_used_at: string | null
          max_token_limit: number | null
          token_limit_per_day: number | null
          tokens_remaining: number | null
          tokens_used: number | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          api_key?: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          label: string
          last_used_at?: string | null
          max_token_limit?: number | null
          token_limit_per_day?: number | null
          tokens_remaining?: number | null
          tokens_used?: number | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          label?: string
          last_used_at?: string | null
          max_token_limit?: number | null
          token_limit_per_day?: number | null
          tokens_remaining?: number | null
          tokens_used?: number | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          answer: string | null
          belongs_to: string
          created_at: string | null
          document: string | null
          id: string
          image: string | null
          input_tokens: number
          latency_ms: number | null
          model: string
          output_tokens: number
          question: string
          session_id: string | null
          status: number
          total_tokens: number
        }
        Insert: {
          answer?: string | null
          belongs_to: string
          created_at?: string | null
          document?: string | null
          id?: string
          image?: string | null
          input_tokens: number
          latency_ms?: number | null
          model: string
          output_tokens: number
          question: string
          session_id?: string | null
          status: number
          total_tokens: number
        }
        Update: {
          answer?: string | null
          belongs_to?: string
          created_at?: string | null
          document?: string | null
          id?: string
          image?: string | null
          input_tokens?: number
          latency_ms?: number | null
          model?: string
          output_tokens?: number
          question?: string
          session_id?: string | null
          status?: number
          total_tokens?: number
        }
        Relationships: [
          {
            foreignKeyName: "chats_belongs_to_fkey"
            columns: ["belongs_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          api_id: string | null
          created_at: string
          file_url: string
          filename: string
          hits: number | null
          id: string
          last_used: string | null
          size: number
          status: string
        }
        Insert: {
          api_id?: string | null
          created_at?: string
          file_url: string
          filename: string
          hits?: number | null
          id?: string
          last_used?: string | null
          size: number
          status?: string
        }
        Update: {
          api_id?: string | null
          created_at?: string
          file_url?: string
          filename?: string
          hits?: number | null
          id?: string
          last_used?: string | null
          size?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_api_id_fkey"
            columns: ["api_id"]
            isOneToOne: false
            referencedRelation: "apis"
            referencedColumns: ["id"]
          },
        ]
      }
      embeddings: {
        Row: {
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          badge: string | null
          created_at: string
          description: string | null
          id: string
          input_cost_per_token: number | null
          is_enabled: boolean | null
          is_reasoning: boolean | null
          last_updated_month: number | null
          last_updated_year: number | null
          max_tokens: number
          model_id: string
          name: string
          output_cost_per_token: number | null
          provider: string
          total_tokens_this_month: number | null
          total_tokens_this_year: number | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input_cost_per_token?: number | null
          is_enabled?: boolean | null
          is_reasoning?: boolean | null
          last_updated_month?: number | null
          last_updated_year?: number | null
          max_tokens: number
          model_id: string
          name: string
          output_cost_per_token?: number | null
          provider: string
          total_tokens_this_month?: number | null
          total_tokens_this_year?: number | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input_cost_per_token?: number | null
          is_enabled?: boolean | null
          is_reasoning?: boolean | null
          last_updated_month?: number | null
          last_updated_year?: number | null
          max_tokens?: number
          model_id?: string
          name?: string
          output_cost_per_token?: number | null
          provider?: string
          total_tokens_this_month?: number | null
          total_tokens_this_year?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_model: string | null
          first_name: string | null
          id: string
          last_name: string | null
          low_balance_notify: boolean
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_model?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          low_balance_notify?: boolean
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_model?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          low_balance_notify?: boolean
          username?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          avg_latency_ms: number | null
          created_at: string | null
          id: string
          last_used_at: string | null
          total_cost: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          avg_latency_ms?: number | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          avg_latency_ms?: number | null
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
