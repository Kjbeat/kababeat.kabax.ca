/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';


const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      kababeat_user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          is_verified: boolean;
          is_creator: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          is_verified?: boolean;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          is_verified?: boolean;
          is_creator?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      kababeat_user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          permissions: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string;
          permissions?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          permissions?: any;
          created_at?: string;
        };
      };
    };
  };
}

// User profile type
export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  is_verified: boolean;
  is_creator: boolean;
  email: string;
  created_at: string;
  updated_at: string;
}
