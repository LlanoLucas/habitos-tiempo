// Generado con el MCP de Supabase (generate_typescript_types). Regenerar tras cada migración.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.5' }
  public: {
    Tables: {
      activities: {
        Row: { archived: boolean; budget_minutes: number; created_at: string; id: string; kind: string; name: string; user_id: string }
        Insert: { archived?: boolean; budget_minutes: number; created_at?: string; id?: string; kind: string; name: string; user_id?: string }
        Update: { archived?: boolean; budget_minutes?: number; created_at?: string; id?: string; kind?: string; name?: string; user_id?: string }
        Relationships: []
      }
      habit_logs: {
        Row: { count: number; day: string; habit_id: string; user_id: string }
        Insert: { count?: number; day: string; habit_id: string; user_id?: string }
        Update: { count?: number; day?: string; habit_id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: 'habit_logs_habit_id_fkey'; columns: ['habit_id']; isOneToOne: false; referencedRelation: 'habits'; referencedColumns: ['id'] }]
      }
      habits: {
        Row: { archived: boolean; created_at: string; id: string; name: string; times_per_day: number; times_per_week: number | null; user_id: string; weekdays: number[] | null }
        Insert: { archived?: boolean; created_at?: string; id?: string; name: string; times_per_day?: number; times_per_week?: number | null; user_id?: string; weekdays?: number[] | null }
        Update: { archived?: boolean; created_at?: string; id?: string; name?: string; times_per_day?: number; times_per_week?: number | null; user_id?: string; weekdays?: number[] | null }
        Relationships: []
      }
      tasks: {
        Row: { created_at: string; day: string; done: boolean; id: string; is_reminder: boolean; sort_order: number; title: string; user_id: string }
        Insert: { created_at?: string; day: string; done?: boolean; id?: string; is_reminder?: boolean; sort_order?: number; title: string; user_id?: string }
        Update: { created_at?: string; day?: string; done?: boolean; id?: string; is_reminder?: boolean; sort_order?: number; title?: string; user_id?: string }
        Relationships: []
      }
      time_logs: {
        Row: { activity_id: string; day: string; minutes: number; user_id: string }
        Insert: { activity_id: string; day: string; minutes: number; user_id?: string }
        Update: { activity_id?: string; day?: string; minutes?: number; user_id?: string }
        Relationships: [{ foreignKeyName: 'time_logs_activity_id_fkey'; columns: ['activity_id']; isOneToOne: false; referencedRelation: 'activities'; referencedColumns: ['id'] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicTables = Database['public']['Tables']
export type Row<T extends keyof PublicTables> = PublicTables[T]['Row']
export type Insert<T extends keyof PublicTables> = PublicTables[T]['Insert']

export type Habit = Row<'habits'>
export type HabitLog = Row<'habit_logs'>
export type Task = Row<'tasks'>
export type Activity = Row<'activities'>
export type TimeLog = Row<'time_logs'>
