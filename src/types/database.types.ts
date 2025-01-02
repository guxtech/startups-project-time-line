export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          created_at: string;
          project_name: string;
          total_estimated_hours: number;
          total_consumed_hours: number;
          current_phase: string;
          total_tasks: number;
          progress_status: number;
          start_month: string;
          months_to_display: number;
          project_date: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_name: string;
          total_estimated_hours?: number;
          total_consumed_hours?: number;
          current_phase: string;
          total_tasks?: number;
          progress_status?: number;
          start_month: string;
          months_to_display?: number;
          project_date: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          project_name?: string;
          total_estimated_hours?: number;
          total_consumed_hours?: number;
          current_phase?: string;
          total_tasks?: number;
          progress_status?: number;
          start_month?: string;
          months_to_display?: number;
          project_date?: string;
          user_id?: string;
        };
      };
      epics: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          name: string;
          start_date: string;
          end_date: string;
          status: string;
          tag_ids: string[];
          order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          name: string;
          start_date: string;
          end_date: string;
          status: string;
          tag_ids?: string[];
          order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          project_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          tag_ids?: string[];
          order?: number;
        };
      };
      tags: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          name: string;
          color: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          name: string;
          color: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          project_id?: string;
          name?: string;
          color?: string;
        };
      };
    };
  };
}
