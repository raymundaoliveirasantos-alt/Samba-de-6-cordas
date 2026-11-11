import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
// Note: In Vite, environment variables must be prefixed with VITE_ to be exposed to the browser,
// or provided via server-side endpoints/injected secrets.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Data synchronization service bridging Dexie (local IndexedDB) with Supabase (remote)
 * for user sessions and multi-device persistence.
 */
import { db } from '../db';
import type { Song, Setlist } from '../types';

export const supabaseSyncService = {
  async getStatus() {
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      return data;
    } catch {
      return { configured: isSupabaseConfigured, message: 'Status verificado localmente' };
    }
  },

  async pushLocalToRemote(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const songs = await db.songs.toArray();
      const setlists = await db.setlists.toArray();

      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs, setlists }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      return {
        success: true,
        count: songs.length,
        message: `Sincronizados ${songs.length} músicas e ${setlists.length} repertórios com o Supabase com sucesso.`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: err.message || 'Erro ao sincronizar com o Supabase.',
      };
    }
  },

  async pullRemoteToLocal(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const res = await fetch('/api/supabase/songs');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const remoteSongs: Song[] = data.songs || [];
      if (remoteSongs.length > 0) {
        await db.songs.bulkPut(remoteSongs);
      }

      return {
        success: true,
        count: remoteSongs.length,
        message: `Importadas ${remoteSongs.length} músicas do Supabase para o banco local Dexie.`,
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        message: err.message || 'Erro ao puxar dados do Supabase.',
      };
    }
  },
};
