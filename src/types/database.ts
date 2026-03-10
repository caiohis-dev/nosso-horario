export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      email_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      esp_disciplina_serie_escola: {
        Row: {
          ano_letivo: string
          created_at: string
          disciplina_id: string
          escola_id: string
          id: string
          instituicao_id: string
          num_aulas: number
          serie_id: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          disciplina_id: string
          escola_id: string
          id?: string
          instituicao_id: string
          num_aulas: number
          serie_id: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          disciplina_id?: string
          escola_id?: string
          id?: string
          instituicao_id?: string
          num_aulas?: number
          serie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_disciplina_serie_escola_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "ger_disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_disciplina_serie_escola_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "ger_escolas_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_disciplina_serie_escola_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_disciplina_serie_escola_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "ger_series"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_grade_escola_ano: {
        Row: {
          ano_letivo: string
          created_at: string
          dia_semana: string
          escola_id: string
          id: string
          instituicao_id: string
          num_aulas_dia: number
          serie_id: string
          turno: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          dia_semana: string
          escola_id: string
          id?: string
          instituicao_id: string
          num_aulas_dia: number
          serie_id: string
          turno: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          dia_semana?: string
          escola_id?: string
          id?: string
          instituicao_id?: string
          num_aulas_dia?: number
          serie_id?: string
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_grade_escola_ano_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "ger_escolas_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_grade_escola_ano_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_grade_escola_ano_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "ger_series"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_professor_escola_ano: {
        Row: {
          ano_letivo: string
          created_at: string
          escola_id: string
          id: string
          instituicao_id: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          escola_id: string
          id?: string
          instituicao_id: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          escola_id?: string
          id?: string
          instituicao_id?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_professor_escola_ano_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "ger_escolas_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_professor_escola_ano_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_professor_escola_ano_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "ger_professor_diretor"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_series_escolas: {
        Row: {
          ano: string
          created_at: string
          escola_id: string
          id: string
          instituicao_id: string
          serie_id: string
        }
        Insert: {
          ano: string
          created_at?: string
          escola_id: string
          id?: string
          instituicao_id: string
          serie_id: string
        }
        Update: {
          ano?: string
          created_at?: string
          escola_id?: string
          id?: string
          instituicao_id?: string
          serie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_series_escolas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "ger_escolas_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_series_escolas_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_series_escolas_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "ger_series"
            referencedColumns: ["id"]
          },
        ]
      }
      ger_cores_disciplinas: {
        Row: {
          cor_bg: string
          cor_text: string
          created_at: string
          id: string
        }
        Insert: {
          cor_bg: string
          cor_text: string
          created_at?: string
          id?: string
        }
        Update: {
          cor_bg?: string
          cor_text?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      ger_disciplinas: {
        Row: {
          cor_id: string
          created_at: string
          id: string
          instituicao_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor_id: string
          created_at?: string
          id?: string
          instituicao_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor_id?: string
          created_at?: string
          id?: string
          instituicao_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ger_disciplinas_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "ger_cores_disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ger_disciplinas_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
        ]
      }
      ger_escolas_instituicao: {
        Row: {
          created_at: string
          id: string
          instituicao_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instituicao_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instituicao_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ger_escolas_instituicao_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
        ]
      }
      ger_instituicao: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      ger_professor_diretor: {
        Row: {
          created_at: string
          data_admissao: string | null
          data_demissao: string | null
          diretor_escola_id: string | null
          email: string | null
          id: string
          instituicao_id: string
          matricula: string | null
          nome_completo: string
          numero_aulas_semanais: number
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_admissao?: string | null
          data_demissao?: string | null
          diretor_escola_id?: string | null
          email?: string | null
          id?: string
          instituicao_id: string
          matricula?: string | null
          nome_completo: string
          numero_aulas_semanais: number
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_admissao?: string | null
          data_demissao?: string | null
          diretor_escola_id?: string | null
          email?: string | null
          id?: string
          instituicao_id?: string
          matricula?: string | null
          nome_completo?: string
          numero_aulas_semanais?: number
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ger_professor_diretor_diretor_escola_id_fkey"
            columns: ["diretor_escola_id"]
            isOneToOne: false
            referencedRelation: "ger_escolas_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ger_professor_diretor_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
        ]
      }
      ger_professor_disciplinas: {
        Row: {
          created_at: string
          disciplina_id: string
          id: string
          instituicao_id: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          disciplina_id: string
          id?: string
          instituicao_id: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          disciplina_id?: string
          id?: string
          instituicao_id?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ger_professor_disciplinas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "ger_disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ger_professor_disciplinas_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ger_professor_disciplinas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "ger_professor_diretor"
            referencedColumns: ["id"]
          },
        ]
      }
      ger_series: {
        Row: {
          created_at: string
          id: string
          instituicao_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instituicao_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instituicao_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ger_series_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          instituicao_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instituicao_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instituicao_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "ger_instituicao"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "Admin" | "Diretor" | "Professor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["Admin", "Diretor", "Professor"],
    },
  },
} as const

