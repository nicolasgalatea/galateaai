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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "AGENTE AORTA": {
        Row: {
          "# REINTERVENCIONES": number | null
          "#INTERPRE": string | null
          ACVPREVIO: string | null
          ALBUMINA: number | null
          ANEMIAPRE: string | null
          "AÑO CIRUGIA": number | null
          ANTTIROIDE: string | null
          AORTAACTUAL: string | null
          AORTAPREV: string | null
          ASA: string | null
          AVREACTUAL: string | null
          AVRPREV: string | null
          CATETERISMO: string | null
          CAUREINTER: string | null
          CECCONARRES: string | null
          CECSINARRESTO: string | null
          CIERREDIFER: string | null
          CIRUJANO: string | null
          COMBINADOACTU: string | null
          COMBINADOPREV: string | null
          DIALISIS: string | null
          DISLIPIDE: string | null
          DMII: string | null
          EDAD: number | null
          ELECTIVO: string | null
          ENDOCARDI: string | null
          EPOC: string | null
          ERC: string | null
          ESTANCIAHOS: string | null
          ESTANCIATO: string | null
          ESTANCIAUCI: string | null
          EURO: string | null
          EVENTONEURO: string | null
          FALLACARDIA: string | null
          FAPOP: string | null
          FAPRE: string | null
          FECHACIRUGIA: string | null
          FEVI30: string | null
          HTA: string | null
          IAMPOP: string | null
          ID: number | null
          IMC: number | null
          ISO: string | null
          LESIONRENALA: string | null
          LESIORESTER: string | null
          "MARCA VALVULA AORTICA": string | null
          "MARCA VALVULA MITRAL": string | null
          "MARCA VALVULA TRICÚSPIDE": string | null
          MEDISTINITIS: string | null
          MITRALACT: string | null
          MITRALPREV: string | null
          MOMENTFEMORAL: string | null
          MORTALIDAD: string | null
          MOTIEXAREINTREVENCI: string | null
          MOVNUEVOPRO: string | null
          NAME: string | null
          NEUMONIA: string | null
          NOCEC: string | null
          NOMBREXACTOREINTERVENCION: string | null
          "notas adicionales- COLOCARA ACA SI LE COLOCARON DISPOSITVO":
            | string
            | null
          NYHA: string | null
          OTRAACTUAL: string | null
          OTRAPREV: string | null
          PAROINT: string | null
          PROTTOTALES: string | null
          REDOCABGURGE: string | null
          REINTERVE: string | null
          RVMACTUAL: string | null
          RVMPREV: string | null
          SANGRADOPOP: string | null
          SDRA: string | null
          SEXO: string | null
          SITIOLESIORE: string | null
          STSMORBI: string | null
          STSMORTA: number | null
          TABAQUISMO: string | null
          TACTORAX: string | null
          "TAMAÑO VALVULA AORTICA": string | null
          "TAMAÑO VALVULA MITRAL": string | null
          "TAMAÑO VALVULA TRICÚSPIDE": string | null
          TEP: string | null
          TIEMPARREST: string | null
          TIEMPOCEC: number | null
          TIEMPOCLAMP: number | null
          "TIEMPOENTRE LA ULTIMA INTERVENCION Y LA ACTUAL": number | null
          "TIPO DE VALVULA NUEVA INTERVENIDA": string | null
          TIPOFEMORA: string | null
          TRANFUINTRA: string | null
          TRICUSACTUA: string | null
          TRICUSPREV: string | null
          ZONA: string | null
        }
        Insert: {
          "# REINTERVENCIONES"?: number | null
          "#INTERPRE"?: string | null
          ACVPREVIO?: string | null
          ALBUMINA?: number | null
          ANEMIAPRE?: string | null
          "AÑO CIRUGIA"?: number | null
          ANTTIROIDE?: string | null
          AORTAACTUAL?: string | null
          AORTAPREV?: string | null
          ASA?: string | null
          AVREACTUAL?: string | null
          AVRPREV?: string | null
          CATETERISMO?: string | null
          CAUREINTER?: string | null
          CECCONARRES?: string | null
          CECSINARRESTO?: string | null
          CIERREDIFER?: string | null
          CIRUJANO?: string | null
          COMBINADOACTU?: string | null
          COMBINADOPREV?: string | null
          DIALISIS?: string | null
          DISLIPIDE?: string | null
          DMII?: string | null
          EDAD?: number | null
          ELECTIVO?: string | null
          ENDOCARDI?: string | null
          EPOC?: string | null
          ERC?: string | null
          ESTANCIAHOS?: string | null
          ESTANCIATO?: string | null
          ESTANCIAUCI?: string | null
          EURO?: string | null
          EVENTONEURO?: string | null
          FALLACARDIA?: string | null
          FAPOP?: string | null
          FAPRE?: string | null
          FECHACIRUGIA?: string | null
          FEVI30?: string | null
          HTA?: string | null
          IAMPOP?: string | null
          ID?: number | null
          IMC?: number | null
          ISO?: string | null
          LESIONRENALA?: string | null
          LESIORESTER?: string | null
          "MARCA VALVULA AORTICA"?: string | null
          "MARCA VALVULA MITRAL"?: string | null
          "MARCA VALVULA TRICÚSPIDE"?: string | null
          MEDISTINITIS?: string | null
          MITRALACT?: string | null
          MITRALPREV?: string | null
          MOMENTFEMORAL?: string | null
          MORTALIDAD?: string | null
          MOTIEXAREINTREVENCI?: string | null
          MOVNUEVOPRO?: string | null
          NAME?: string | null
          NEUMONIA?: string | null
          NOCEC?: string | null
          NOMBREXACTOREINTERVENCION?: string | null
          "notas adicionales- COLOCARA ACA SI LE COLOCARON DISPOSITVO"?:
            | string
            | null
          NYHA?: string | null
          OTRAACTUAL?: string | null
          OTRAPREV?: string | null
          PAROINT?: string | null
          PROTTOTALES?: string | null
          REDOCABGURGE?: string | null
          REINTERVE?: string | null
          RVMACTUAL?: string | null
          RVMPREV?: string | null
          SANGRADOPOP?: string | null
          SDRA?: string | null
          SEXO?: string | null
          SITIOLESIORE?: string | null
          STSMORBI?: string | null
          STSMORTA?: number | null
          TABAQUISMO?: string | null
          TACTORAX?: string | null
          "TAMAÑO VALVULA AORTICA"?: string | null
          "TAMAÑO VALVULA MITRAL"?: string | null
          "TAMAÑO VALVULA TRICÚSPIDE"?: string | null
          TEP?: string | null
          TIEMPARREST?: string | null
          TIEMPOCEC?: number | null
          TIEMPOCLAMP?: number | null
          "TIEMPOENTRE LA ULTIMA INTERVENCION Y LA ACTUAL"?: number | null
          "TIPO DE VALVULA NUEVA INTERVENIDA"?: string | null
          TIPOFEMORA?: string | null
          TRANFUINTRA?: string | null
          TRICUSACTUA?: string | null
          TRICUSPREV?: string | null
          ZONA?: string | null
        }
        Update: {
          "# REINTERVENCIONES"?: number | null
          "#INTERPRE"?: string | null
          ACVPREVIO?: string | null
          ALBUMINA?: number | null
          ANEMIAPRE?: string | null
          "AÑO CIRUGIA"?: number | null
          ANTTIROIDE?: string | null
          AORTAACTUAL?: string | null
          AORTAPREV?: string | null
          ASA?: string | null
          AVREACTUAL?: string | null
          AVRPREV?: string | null
          CATETERISMO?: string | null
          CAUREINTER?: string | null
          CECCONARRES?: string | null
          CECSINARRESTO?: string | null
          CIERREDIFER?: string | null
          CIRUJANO?: string | null
          COMBINADOACTU?: string | null
          COMBINADOPREV?: string | null
          DIALISIS?: string | null
          DISLIPIDE?: string | null
          DMII?: string | null
          EDAD?: number | null
          ELECTIVO?: string | null
          ENDOCARDI?: string | null
          EPOC?: string | null
          ERC?: string | null
          ESTANCIAHOS?: string | null
          ESTANCIATO?: string | null
          ESTANCIAUCI?: string | null
          EURO?: string | null
          EVENTONEURO?: string | null
          FALLACARDIA?: string | null
          FAPOP?: string | null
          FAPRE?: string | null
          FECHACIRUGIA?: string | null
          FEVI30?: string | null
          HTA?: string | null
          IAMPOP?: string | null
          ID?: number | null
          IMC?: number | null
          ISO?: string | null
          LESIONRENALA?: string | null
          LESIORESTER?: string | null
          "MARCA VALVULA AORTICA"?: string | null
          "MARCA VALVULA MITRAL"?: string | null
          "MARCA VALVULA TRICÚSPIDE"?: string | null
          MEDISTINITIS?: string | null
          MITRALACT?: string | null
          MITRALPREV?: string | null
          MOMENTFEMORAL?: string | null
          MORTALIDAD?: string | null
          MOTIEXAREINTREVENCI?: string | null
          MOVNUEVOPRO?: string | null
          NAME?: string | null
          NEUMONIA?: string | null
          NOCEC?: string | null
          NOMBREXACTOREINTERVENCION?: string | null
          "notas adicionales- COLOCARA ACA SI LE COLOCARON DISPOSITVO"?:
            | string
            | null
          NYHA?: string | null
          OTRAACTUAL?: string | null
          OTRAPREV?: string | null
          PAROINT?: string | null
          PROTTOTALES?: string | null
          REDOCABGURGE?: string | null
          REINTERVE?: string | null
          RVMACTUAL?: string | null
          RVMPREV?: string | null
          SANGRADOPOP?: string | null
          SDRA?: string | null
          SEXO?: string | null
          SITIOLESIORE?: string | null
          STSMORBI?: string | null
          STSMORTA?: number | null
          TABAQUISMO?: string | null
          TACTORAX?: string | null
          "TAMAÑO VALVULA AORTICA"?: string | null
          "TAMAÑO VALVULA MITRAL"?: string | null
          "TAMAÑO VALVULA TRICÚSPIDE"?: string | null
          TEP?: string | null
          TIEMPARREST?: string | null
          TIEMPOCEC?: number | null
          TIEMPOCLAMP?: number | null
          "TIEMPOENTRE LA ULTIMA INTERVENCION Y LA ACTUAL"?: number | null
          "TIPO DE VALVULA NUEVA INTERVENIDA"?: string | null
          TIPOFEMORA?: string | null
          TRANFUINTRA?: string | null
          TRICUSACTUA?: string | null
          TRICUSPREV?: string | null
          ZONA?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      diagnosticos_aorta: {
        Row: {
          cirugias_previas: string | null
          clasificacion_urgencia: string | null
          colesterol: number | null
          created_at: string
          edad: number | null
          fecha_intervencion: string | null
          id: string
          otros_resultados: string | null
          patient_id: number
          recomendacion: string | null
          sexo: string | null
          sospecha_diagnostica: string | null
          tabaquismo: boolean | null
          tension_arterial: string | null
          updated_at: string
        }
        Insert: {
          cirugias_previas?: string | null
          clasificacion_urgencia?: string | null
          colesterol?: number | null
          created_at?: string
          edad?: number | null
          fecha_intervencion?: string | null
          id?: string
          otros_resultados?: string | null
          patient_id: number
          recomendacion?: string | null
          sexo?: string | null
          sospecha_diagnostica?: string | null
          tabaquismo?: boolean | null
          tension_arterial?: string | null
          updated_at?: string
        }
        Update: {
          cirugias_previas?: string | null
          clasificacion_urgencia?: string | null
          colesterol?: number | null
          created_at?: string
          edad?: number | null
          fecha_intervencion?: string | null
          id?: string
          otros_resultados?: string | null
          patient_id?: number
          recomendacion?: string | null
          sexo?: string | null
          sospecha_diagnostica?: string | null
          tabaquismo?: boolean | null
          tension_arterial?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_cases: {
        Row: {
          conversation_id: string | null
          created_at: string
          current_medications: string | null
          id: string
          medical_history: string | null
          patient_age: number | null
          patient_gender: string | null
          study_files: string[] | null
          symptoms: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          current_medications?: string | null
          id?: string
          medical_history?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          study_files?: string[] | null
          symptoms?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          current_medications?: string | null
          id?: string
          medical_history?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          study_files?: string[] | null
          symptoms?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_cases_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_data_audit: {
        Row: {
          accessed_at: string
          action: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          table_name: string
          user_id: string
          user_role: string | null
        }
        Insert: {
          accessed_at?: string
          action: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          table_name: string
          user_id: string
          user_role?: string | null
        }
        Update: {
          accessed_at?: string
          action?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          table_name?: string
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      medical_diagnoses: {
        Row: {
          ai_analysis: Json | null
          confidence_score: number | null
          conversation_id: string
          created_at: string
          differential_diagnoses: string[] | null
          id: string
          medical_case_id: string
          primary_diagnosis: string
          recommendations: string | null
          urgency_level: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          conversation_id: string
          created_at?: string
          differential_diagnoses?: string[] | null
          id?: string
          medical_case_id: string
          primary_diagnosis: string
          recommendations?: string | null
          urgency_level?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          confidence_score?: number | null
          conversation_id?: string
          created_at?: string
          differential_diagnoses?: string[] | null
          id?: string
          medical_case_id?: string
          primary_diagnosis?: string
          recommendations?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_diagnoses_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_diagnoses_medical_case_id_fkey"
            columns: ["medical_case_id"]
            isOneToOne: false
            referencedRelation: "medical_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          license_expires_at: string | null
          license_verification_notes: string | null
          license_verified: boolean
          license_verified_at: string | null
          medical_license_country: string | null
          medical_license_number: string | null
          organization: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          user_role: Database["public"]["Enums"]["app_role"]
          verification_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          license_expires_at?: string | null
          license_verification_notes?: string | null
          license_verified?: boolean
          license_verified_at?: string | null
          medical_license_country?: string | null
          medical_license_number?: string | null
          organization?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          user_role?: Database["public"]["Enums"]["app_role"]
          verification_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          license_expires_at?: string | null
          license_verification_notes?: string | null
          license_verified?: boolean
          license_verified_at?: string | null
          medical_license_country?: string | null
          medical_license_number?: string | null
          organization?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["app_role"]
          verification_source?: string | null
        }
        Relationships: []
      }
      transacciones: {
        Row: {
          categoria: string
          created_at: string
          cuenta: string
          descripcion: string
          fecha: string
          id: string
          metodo_pago: string
          monto: number
          notas: string | null
          recibo_url: string | null
          tipo_transaccion: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria: string
          created_at?: string
          cuenta: string
          descripcion: string
          fecha?: string
          id?: string
          metodo_pago: string
          monto: number
          notas?: string | null
          recibo_url?: string | null
          tipo_transaccion: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          cuenta?: string
          descripcion?: string
          fecha?: string
          id?: string
          metodo_pago?: string
          monto?: number
          notas?: string | null
          recibo_url?: string | null
          tipo_transaccion?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      pending_license_verifications: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          medical_license_country: string | null
          medical_license_number: string | null
          organization: string | null
          specialty: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          medical_license_country?: string | null
          medical_license_number?: string | null
          organization?: string | null
          specialty?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          medical_license_country?: string | null
          medical_license_number?: string | null
          organization?: string | null
          specialty?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_verify_medical_license: {
        Args: {
          p_expires_at: string
          p_license_country: string
          p_license_number: string
          p_notes?: string
          p_user_id: string
          p_verification_source: string
        }
        Returns: undefined
      }
      can_manage_financial_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_medical_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_verified_medical_professional: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_medical_data_access: {
        Args: { p_action: string; p_table_name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "medico" | "hospital" | "eps" | "investigador" | "paciente"
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
    Enums: {
      app_role: ["medico", "hospital", "eps", "investigador", "paciente"],
    },
  },
} as const
