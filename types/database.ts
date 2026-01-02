export type UserRole = 'lead' | 'volunteer' | 'climber';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string | null;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  capacity?: number | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      active_sessions: {
        Row: {
          id: string;
          created_at: string;
          code: string;
          guide_id: string | null;
          climber_id: string | null;
          status: 'waiting' | 'active' | 'completed';
        };
        Insert: {
          code: string;
          guide_id?: string | null;
          climber_id?: string | null;
          status?: 'waiting' | 'active' | 'completed';
        };
        Update: Partial<Omit<Database['public']['Tables']['active_sessions']['Row'], 'id' | 'created_at'>>;
      };
    };
  };
}