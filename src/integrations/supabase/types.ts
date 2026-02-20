export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_executions: {
        Row: {
          id: string
          project_id: string
          agent_number: number
          agent_name: string
          phase: number | null
          status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
          input_payload: Json | null
          output_result: Json | null
          output_markdown: string | null
          started_at: string | null
          completed_at: string | null
          duration_ms: number | null
          tokens_used: number | null
          error_message: string | null
          retry_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          agent_number: number
          agent_name: string
          phase?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
          input_payload?: Json | null
          output_result?: Json | null
          output_markdown?: string | null
          started_at?: string | null
          completed_at?: string | null
          duration_ms?: number | null
          tokens_used?: number | null
          error_message?: string | null
          retry_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          agent_number?: number
          agent_name?: string
          phase?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
          input_payload?: Json | null
          output_result?: Json | null
          output_markdown?: string | null
          started_at?: string | null
          completed_at?: string | null
          duration_ms?: number | null
          tokens_used?: number | null
          error_message?: string | null
          retry_count?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "agent_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_projects: {
        Row: {
          id: string
          title: string
          description: string | null
          research_question: string | null
          phase: 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED'
          current_agent_step: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          research_question?: string | null
          phase?: 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED'
          current_agent_step?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          research_question?: string | null
          phase?: 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED'
          current_agent_step?: number
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          user_role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          user_role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      project_references: {
        Row: {
          abstract: string | null
          authors: string | null
          created_at: string
          doi: string | null
          exclusion_reason: string | null
          id: string
          inclusion_status: string | null
          journal: string | null
          phase_used: number | null
          pmid: string
          project_id: string
          relevance_score: number | null
          row_id: string | null
          title: string
          updated_at: string
          url: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors?: string | null
          created_at?: string
          doi?: string | null
          exclusion_reason?: string | null
          id?: string
          inclusion_status?: string | null
          journal?: string | null
          phase_used?: number | null
          pmid: string
          project_id: string
          relevance_score?: number | null
          row_id?: string | null
          title: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string | null
          created_at?: string
          doi?: string | null
          exclusion_reason?: string | null
          id?: string
          inclusion_status?: string | null
          journal?: string | null
          phase_used?: number | null
          pmid?: string
          project_id?: string
          relevance_score?: number | null
          row_id?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_references_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_lab_progress: {
        Row: {
          created_at: string
          fase_0_1_output: Json | null
          fase_2_3_output: Json | null
          fase_4_5_output: Json | null
          fase_6_7_output: Json | null
          fase_8_9_output: Json | null
          fase_actual: number
          id: string
          project_id: string
          research_question: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fase_0_1_output?: Json | null
          fase_2_3_output?: Json | null
          fase_4_5_output?: Json | null
          fase_6_7_output?: Json | null
          fase_8_9_output?: Json | null
          fase_actual?: number
          id?: string
          project_id: string
          research_question?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fase_0_1_output?: Json | null
          fase_2_3_output?: Json | null
          fase_4_5_output?: Json | null
          fase_6_7_output?: Json | null
          fase_8_9_output?: Json | null
          fase_actual?: number
          id?: string
          project_id?: string
          research_question?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          created_at: string
          current_phase: number
          id: string
          phase_data: Json
          project_id: string
          research_question: string | null
          status: string
          title: string
          updated_at: string
          user_edits: Json
        }
        Insert: {
          created_at?: string
          current_phase?: number
          id?: string
          phase_data?: Json
          project_id?: string
          research_question?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_edits?: Json
        }
        Update: {
          created_at?: string
          current_phase?: number
          id?: string
          phase_data?: Json
          project_id?: string
          research_question?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_edits?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_user_edits_for_phase: {
        Args: {
          p_field: string
          p_phase_key: string
          p_project_id: string
          p_value: Json
        }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
