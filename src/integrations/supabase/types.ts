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
      student_fee_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          paid_at: string
          period_month: number
          period_year: number
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          period_month: number
          period_year: number
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          period_month?: number
          period_year?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_certificate_no: string | null
          blood_group: string | null
          class: Database["public"]["Enums"]["madrasah_class"]
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          father_mobile: string | null
          father_name_bn: string | null
          father_name_en: string | null
          gender: string | null
          guardian_mobile: string | null
          id: string
          monthly_fee: number
          mother_mobile: string | null
          mother_name_bn: string | null
          mother_name_en: string | null
          name_bn: string
          name_en: string
          nationality: string | null
          permanent_address: string | null
          photo_url: string | null
          present_address: string | null
          religion: string | null
          updated_at: string
        }
        Insert: {
          birth_certificate_no?: string | null
          blood_group?: string | null
          class: Database["public"]["Enums"]["madrasah_class"]
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          father_mobile?: string | null
          father_name_bn?: string | null
          father_name_en?: string | null
          gender?: string | null
          guardian_mobile?: string | null
          id?: string
          monthly_fee?: number
          mother_mobile?: string | null
          mother_name_bn?: string | null
          mother_name_en?: string | null
          name_bn: string
          name_en: string
          nationality?: string | null
          permanent_address?: string | null
          photo_url?: string | null
          present_address?: string | null
          religion?: string | null
          updated_at?: string
        }
        Update: {
          birth_certificate_no?: string | null
          blood_group?: string | null
          class?: Database["public"]["Enums"]["madrasah_class"]
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          father_mobile?: string | null
          father_name_bn?: string | null
          father_name_en?: string | null
          gender?: string | null
          guardian_mobile?: string | null
          id?: string
          monthly_fee?: number
          mother_mobile?: string | null
          mother_name_bn?: string | null
          mother_name_en?: string | null
          name_bn?: string
          name_en?: string
          nationality?: string | null
          permanent_address?: string | null
          photo_url?: string | null
          present_address?: string | null
          religion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teacher_salary_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          paid_at: string
          period_month: number
          period_year: number
          teacher_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          period_month: number
          period_year: number
          teacher_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          paid_at?: string
          period_month?: number
          period_year?: number
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_salary_payments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          designation: string | null
          email: string | null
          father_name: string | null
          id: string
          joining_date: string | null
          mobile: string | null
          monthly_salary: number
          mother_name: string | null
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string | null
          email?: string | null
          father_name?: string | null
          id?: string
          joining_date?: string | null
          mobile?: string | null
          monthly_salary?: number
          mother_name?: string | null
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string | null
          email?: string | null
          father_name?: string | null
          id?: string
          joining_date?: string | null
          mobile?: string | null
          monthly_salary?: number
          mother_name?: string | null
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin"
      madrasah_class:
        | "play"
        | "nursery"
        | "one"
        | "two"
        | "three"
        | "four"
        | "hifz"
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
      app_role: ["admin"],
      madrasah_class: [
        "play",
        "nursery",
        "one",
        "two",
        "three",
        "four",
        "hifz",
      ],
    },
  },
} as const
