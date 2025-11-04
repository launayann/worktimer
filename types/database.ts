export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          category_id: string
          start_time: string
          end_time: string | null
          pause_duration: number
          total_duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          start_time?: string
          end_time?: string | null
          pause_duration?: number
          total_duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          start_time?: string
          end_time?: string | null
          pause_duration?: number
          total_duration?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type NewCategory = Database['public']['Tables']['categories']['Insert']
export type NewSession = Database['public']['Tables']['sessions']['Insert']
