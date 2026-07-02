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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      credit_application_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          id: string
          storage_path: string
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          id?: string
          storage_path: string
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_application_notes: {
        Row: {
          application_id: string
          created_at: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          birth_date: string | null
          cep: string | null
          city: string | null
          company_name: string | null
          company_phone: string | null
          complement: string | null
          consent_lgpd: boolean
          consent_score: boolean
          consent_signed_at: string | null
          cpf: string
          created_at: string
          desired_installment_value: number | null
          down_payment: number | null
          email: string
          employment_type: string | null
          external_sync_status: string
          full_name: string
          gender: string | null
          has_trade_in: boolean
          id: string
          installments: number | null
          marital_status: string | null
          monthly_income: number | null
          mother_name: string | null
          nationality: string | null
          neighborhood: string | null
          notes_internal: string | null
          number: string | null
          occupation: string | null
          other_income: number | null
          phone: string
          protocol: string
          read_at: string | null
          references: Json
          residence_time_months: number | null
          residence_type: string | null
          rg: string | null
          selected_banks: string[]
          seller_id: string | null
          signature_data_url: string | null
          signature_ip: string | null
          signature_user_agent: string | null
          state: string | null
          status: string
          store_slug: string
          street: string | null
          time_at_job_months: number | null
          trade_in_description: string | null
          updated_at: string
          user_id: string
          vehicle_id: string | null
          vendor_notes: string | null
          whatsapp: string | null
        }
        Insert: {
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          company_name?: string | null
          company_phone?: string | null
          complement?: string | null
          consent_lgpd?: boolean
          consent_score?: boolean
          consent_signed_at?: string | null
          cpf: string
          created_at?: string
          desired_installment_value?: number | null
          down_payment?: number | null
          email: string
          employment_type?: string | null
          external_sync_status?: string
          full_name: string
          gender?: string | null
          has_trade_in?: boolean
          id?: string
          installments?: number | null
          marital_status?: string | null
          monthly_income?: number | null
          mother_name?: string | null
          nationality?: string | null
          neighborhood?: string | null
          notes_internal?: string | null
          number?: string | null
          occupation?: string | null
          other_income?: number | null
          phone: string
          protocol?: string
          read_at?: string | null
          references?: Json
          residence_time_months?: number | null
          residence_type?: string | null
          rg?: string | null
          selected_banks?: string[]
          seller_id?: string | null
          signature_data_url?: string | null
          signature_ip?: string | null
          signature_user_agent?: string | null
          state?: string | null
          status?: string
          store_slug: string
          street?: string | null
          time_at_job_months?: number | null
          trade_in_description?: string | null
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
          vendor_notes?: string | null
          whatsapp?: string | null
        }
        Update: {
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          company_name?: string | null
          company_phone?: string | null
          complement?: string | null
          consent_lgpd?: boolean
          consent_score?: boolean
          consent_signed_at?: string | null
          cpf?: string
          created_at?: string
          desired_installment_value?: number | null
          down_payment?: number | null
          email?: string
          employment_type?: string | null
          external_sync_status?: string
          full_name?: string
          gender?: string | null
          has_trade_in?: boolean
          id?: string
          installments?: number | null
          marital_status?: string | null
          monthly_income?: number | null
          mother_name?: string | null
          nationality?: string | null
          neighborhood?: string | null
          notes_internal?: string | null
          number?: string | null
          occupation?: string | null
          other_income?: number | null
          phone?: string
          protocol?: string
          read_at?: string | null
          references?: Json
          residence_time_months?: number | null
          residence_type?: string | null
          rg?: string | null
          selected_banks?: string[]
          seller_id?: string | null
          signature_data_url?: string | null
          signature_ip?: string | null
          signature_user_agent?: string | null
          state?: string | null
          status?: string
          store_slug?: string
          street?: string | null
          time_at_job_months?: number | null
          trade_in_description?: string | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
          vendor_notes?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          art_template: string
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          logo_url: string | null
          store_name: string
          store_slug: string
          store_template: string
          tagline: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          accent_color?: string | null
          art_template?: string
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          logo_url?: string | null
          store_name: string
          store_slug: string
          store_template?: string
          tagline?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          accent_color?: string | null
          art_template?: string
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          logo_url?: string | null
          store_name?: string
          store_slug?: string
          store_template?: string
          tagline?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      vehicle_arts: {
        Row: {
          created_at: string
          format: string
          id: string
          storage_path: string
          template: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          storage_path: string
          template: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          storage_path?: string
          template?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_arts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_views: {
        Row: {
          created_at: string
          id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_views_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string
          description: string | null
          fipe_value: number | null
          fuel: string | null
          id: string
          is_active: boolean
          km: number
          model: string | null
          photos: string[]
          plate: string
          sale_price: number
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          fipe_value?: number | null
          fuel?: string | null
          id?: string
          is_active?: boolean
          km?: number
          model?: string | null
          photos?: string[]
          plate: string
          sale_price: number
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          fipe_value?: number | null
          fuel?: string | null
          id?: string
          is_active?: boolean
          km?: number
          model?: string | null
          photos?: string[]
          plate?: string
          sale_price?: number
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      whatsapp_clicks: {
        Row: {
          created_at: string
          id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_clicks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          accent_color: string | null
          art_template: string | null
          city: string | null
          id: string | null
          logo_url: string | null
          store_name: string | null
          store_slug: string | null
          store_template: string | null
          tagline: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          art_template?: string | null
          city?: string | null
          id?: string | null
          logo_url?: string | null
          store_name?: string | null
          store_slug?: string | null
          store_template?: string | null
          tagline?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          art_template?: string | null
          city?: string | null
          id?: string | null
          logo_url?: string | null
          store_name?: string | null
          store_slug?: string | null
          store_template?: string | null
          tagline?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      public_sellers: {
        Row: {
          id: string | null
          is_active: boolean | null
          name: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
