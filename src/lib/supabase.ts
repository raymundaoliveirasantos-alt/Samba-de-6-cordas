import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL as supabaseUrl,
  SUPABASE_ANON_KEY as supabaseAnonKey,
  isSupabaseConfigured,
} from '../config/runtime';

export { isSupabaseConfigured };

// Singleton Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
