export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          employee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: string
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string
          content: string
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          title: string
          content: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          title?: string
          content?: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "todo" | "in_progress" | "done"
          priority: "low" | "medium" | "high"
          assigned_to: string | null
          project_id: string | null
          due_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: "todo" | "in_progress" | "done"
          priority?: "low" | "medium" | "high"
          assigned_to?: string | null
          project_id?: string | null
          due_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: "todo" | "in_progress" | "done"
          priority?: "low" | "medium" | "high"
          assigned_to?: string | null
          project_id?: string | null
          due_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      approvals: {
        Row: {
          id: string
          title: string
          category: string
          applicant_id: string
          application_code: string | null
          amount: number | null
          form: Json
          status: string
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          applicant_id: string
          application_code?: string | null
          amount?: number | null
          form?: Json
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          applicant_id?: string
          application_code?: string | null
          amount?: number | null
          form?: Json
          status?: string
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      application_codes: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_recipients: {
        Row: {
          id: string
          name: string
          bank_name: string | null
          account_number: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bank_name?: string | null
          account_number?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bank_name?: string | null
          account_number?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ocr_documents: {
        Row: {
          id: string
          project_id: string
          filename: string
          file_path: string
          status: "uploaded" | "processing" | "completed" | "error"
          ocr_result: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          filename: string
          file_path: string
          status?: "uploaded" | "processing" | "completed" | "error"
          ocr_result?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          filename?: string
          file_path?: string
          status?: "uploaded" | "processing" | "completed" | "error"
          ocr_result?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
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
