export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          bio: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          bio?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          bio?: string | null
          avatar_url?: string | null
        }
      }
      games: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          cover_url: string | null
          platform: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          cover_url?: string | null
          platform?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      events: {
        Row: {
          id: string
          game_id: string
          created_by: string
          title: string
          description: string | null
          event_date: string
          platform: string
          server_info: string | null
          max_participants: number | null
          external_link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          created_by: string
          title: string
          description?: string | null
          event_date: string
          platform?: string
          server_info?: string | null
          max_participants?: number | null
          external_link?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['event_rsvps']['Insert']>
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          game_id: string | null
          invite_code: string
          created_by: string
          announcements: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          game_id?: string | null
          invite_code?: string
          created_by: string
          announcements?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      game_updates: {
        Row: {
          id: string
          game_id: string
          version: string
          release_date: string
          summary: string | null
          added_by: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          version: string
          release_date: string
          summary?: string | null
          added_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['game_updates']['Insert']>
      }
      update_ratings: {
        Row: {
          id: string
          update_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          update_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['update_ratings']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
