import { db } from '../db';
import type { Song, Setlist } from '../types';

export interface SupabaseStatus {
  configured: boolean;
  url: string | null;
  message: string;
}

export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  try {
    const res = await fetch('/api/supabase/status');
    const data = await res.json();
    return {
      configured: !!data.configured,
      url: data.url || null,
      message: data.message || '',
    };
  } catch (e: any) {
    return {
      configured: false,
      url: null,
      message: 'Não foi possível verificar status do Supabase.',
    };
  }
}

export async function syncLocalSongsToSupabase(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  const songs = await db.songs.toArray();
  if (songs.length === 0) {
    return { success: false, message: 'Nenhuma música encontrada no acervo local.' };
  }

  try {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs }),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      count: data.syncedCount || songs.length,
      message: data.message || `${songs.length} músicas sincronizadas com sucesso no Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro ao sincronizar com o Supabase.',
    };
  }
}

export async function pullSongsFromSupabase(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const res = await fetch('/api/supabase/songs');
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const remoteSongs: Song[] = data.songs || [];
    if (remoteSongs.length === 0) {
      return { success: true, count: 0, message: 'Nenhuma música encontrada no Supabase.' };
    }

    // Upsert into local Dexie
    await db.songs.bulkPut(remoteSongs);

    return {
      success: true,
      count: remoteSongs.length,
      message: `${remoteSongs.length} músicas baixadas do Supabase para o banco local!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro ao puxar músicas do Supabase.',
    };
  }
}

/**
 * Export full repository formatted for GitHub (.json + .chordpro files)
 */
export async function exportSongsForGitHub(): Promise<void> {
  const songs = await db.songs.toArray();
  const setlists = await db.setlists.toArray();

  const exportPayload = {
    repository: 'CifraViva — Repertório e Cifras',
    exportedAt: new Date().toISOString(),
    totalSongs: songs.length,
    totalSetlists: setlists.length,
    songs: songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      originalKey: s.originalKey,
      bpm: s.bpm,
      timeSignature: s.timeSignature,
      chordProContent: s.chordProContent,
      tags: s.tags,
      type: s.type,
      status: s.status,
    })),
    setlists,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cifraviva-github-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
