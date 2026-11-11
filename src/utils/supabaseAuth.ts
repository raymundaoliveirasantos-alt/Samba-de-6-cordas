import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const supabaseAuthService = {
  async getSession() {
    if (!isSupabaseConfigured || !supabase) return { session: null, user: null };
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, user: data.session?.user || null };
    } catch (e) {
      console.warn('Erro ao obter sessão do Supabase:', e);
      return { session: null, user: null };
    }
  },

  async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase não está configurado nas variáveis de ambiente/secrets.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro ao cadastrar usuário no Supabase.' };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase não está configurado nas variáveis de ambiente/secrets.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro ao entrar no Supabase.' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !supabase) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured || !supabase) return { subscription: { unsubscribe: () => {} } };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return data;
  },
};
