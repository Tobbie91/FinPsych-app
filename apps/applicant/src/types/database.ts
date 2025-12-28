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
      applicants: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          applicant_id: string
          responses: Json
          current_section: number
          progress_percentage: number
          status: 'in_progress' | 'completed' | 'submitted'
          started_at: string
          completed_at: string | null
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          responses?: Json
          current_section?: number
          progress_percentage?: number
          status?: 'in_progress' | 'completed' | 'submitted'
          started_at?: string
          completed_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          responses?: Json
          current_section?: number
          progress_percentage?: number
          status?: 'in_progress' | 'completed' | 'submitted'
          started_at?: string
          completed_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_scores: {
        Row: {
          id: string
          applicant_id: string
          questionnaire_response_id: string
          character_score: number
          capacity_score: number
          capital_score: number
          conditions_score: number
          collateral_score: number
          total_score: number
          risk_category: 'low' | 'medium' | 'high'
          calculated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          questionnaire_response_id: string
          character_score: number
          capacity_score: number
          capital_score: number
          conditions_score: number
          collateral_score: number
          total_score: number
          risk_category: 'low' | 'medium' | 'high'
          calculated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          questionnaire_response_id?: string
          character_score?: number
          capacity_score?: number
          capital_score?: number
          conditions_score?: number
          collateral_score?: number
          total_score?: number
          risk_category?: 'low' | 'medium' | 'high'
          calculated_at?: string
          created_at?: string
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
  }
}
