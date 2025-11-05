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
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          gst_number: string | null
          id: string
          last_transaction_date: string | null
          name: string
          pending_dues: number | null
          phone: string | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          last_transaction_date?: string | null
          name: string
          pending_dues?: number | null
          phone?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          last_transaction_date?: string | null
          name?: string
          pending_dues?: number | null
          phone?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          discount_percent: number | null
          id: string
          invoice_id: string
          product_id: string | null
          product_name: string
          quantity: number
          tax_percent: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          tax_percent?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          tax_percent?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_mode: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_mode: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_templates: {
        Row: {
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          invoice_language: string | null
          is_active: boolean | null
          show_company_logo: boolean | null
          show_customer_address: boolean | null
          show_customer_email: boolean | null
          show_customer_phone: boolean | null
          show_discount_column: boolean | null
          show_gst_number: boolean | null
          show_invoice_notes: boolean | null
          show_item_description: boolean | null
          show_tax_column: boolean | null
          template_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          invoice_language?: string | null
          is_active?: boolean | null
          show_company_logo?: boolean | null
          show_customer_address?: boolean | null
          show_customer_email?: boolean | null
          show_customer_phone?: boolean | null
          show_discount_column?: boolean | null
          show_gst_number?: boolean | null
          show_invoice_notes?: boolean | null
          show_item_description?: boolean | null
          show_tax_column?: boolean | null
          template_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          invoice_language?: string | null
          is_active?: boolean | null
          show_company_logo?: boolean | null
          show_customer_address?: boolean | null
          show_customer_email?: boolean | null
          show_customer_phone?: boolean | null
          show_discount_column?: boolean | null
          show_gst_number?: boolean | null
          show_invoice_notes?: boolean | null
          show_item_description?: boolean | null
          show_tax_column?: boolean | null
          template_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          discount_percent: number | null
          drive_file_id: string | null
          drive_uploaded: boolean | null
          drive_uploaded_at: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          payment_mode: string
          payment_status: string
          subtotal: number
          tax_amount: number | null
          tax_percent: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          drive_file_id?: string | null
          drive_uploaded?: boolean | null
          drive_uploaded_at?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          payment_mode: string
          payment_status?: string
          subtotal: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          drive_file_id?: string | null
          drive_uploaded?: boolean | null
          drive_uploaded_at?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          payment_mode?: string
          payment_status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      license_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          license_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          license_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          license_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_logs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_by: string | null
          expires_at: string
          id: string
          issued_at: string | null
          license_key: string
          payment_id: string | null
          plan_id: string | null
          revoked: boolean | null
          revoked_reason: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_by?: string | null
          expires_at: string
          id?: string
          issued_at?: string | null
          license_key: string
          payment_id?: string | null
          plan_id?: string | null
          revoked?: boolean | null
          revoked_reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_by?: string | null
          expires_at?: string
          id?: string
          issued_at?: string | null
          license_key?: string
          payment_id?: string | null
          plan_id?: string | null
          revoked?: boolean | null
          revoked_reason?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_analytics: {
        Row: {
          created_at: string | null
          id: string
          month: string
          top_customers: Json | null
          top_products: Json | null
          total_invoices: number | null
          total_profit: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
          worst_products: Json | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          top_customers?: Json | null
          top_products?: Json | null
          total_invoices?: number | null
          total_profit?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
          worst_products?: Json | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          top_customers?: Json | null
          top_products?: Json | null
          total_invoices?: number | null
          total_profit?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
          worst_products?: Json | null
          year?: number
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          is_active: boolean | null
          upi_id: string
          upi_name: string
          upi_qr_url: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          upi_id: string
          upi_name: string
          upi_qr_url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          upi_id?: string
          upi_name?: string
          upi_qr_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          method: string | null
          notes: string | null
          payment_date: string
          payment_mode: string
          plan_id: string | null
          screenshot_url: string | null
          status: string | null
          transaction_note: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          payment_date?: string
          payment_mode: string
          plan_id?: string | null
          screenshot_url?: string | null
          status?: string | null
          transaction_note?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          plan_id?: string | null
          screenshot_url?: string | null
          status?: string | null
          transaction_note?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          price: number
          product_code: string
          product_number: string | null
          reorder_level: number | null
          stock_quantity: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          price: number
          product_code: string
          product_number?: string | null
          reorder_level?: number | null
          stock_quantity?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          product_code?: string
          product_number?: string | null
          reorder_level?: number | null
          stock_quantity?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"] | null
          company_address: string | null
          company_gst: string | null
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_address?: string | null
          company_gst?: string | null
          company_name?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_address?: string | null
          company_gst?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_drive_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          is_connected: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          refresh_token?: string
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      business_type: "general_store" | "apmc_vendor" | "shoe_clothes_retail"
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
      app_role: ["admin", "staff"],
      business_type: ["general_store", "apmc_vendor", "shoe_clothes_retail"],
    },
  },
} as const
