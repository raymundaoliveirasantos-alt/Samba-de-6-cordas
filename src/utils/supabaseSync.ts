import { db } from '../db';
import type { Song, Setlist } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SUPABASE_URL } from '../config/runtime';

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
    if (isSupabaseConfigured) {
      return {
        configured: true,
        url: SUPABASE_URL || null,
        message: 'Supabase configurado no cliente (VITE_SUPABASE_URL).',
      };
    }
    return {
      configured: false,
      url: null,
      message: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
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

  // Try server first; fall back to direct Supabase client.
  try {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return {
      success: true,
      count: data.syncedCount || songs.length,
      message: data.message || `${songs.length} músicas sincronizadas com sucesso no Supabase!`,
    };
  } catch (serverErr: any) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Servidor /api indisponível e Supabase não configurado no cliente (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).',
      };
    }
    try {
      const records = songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: s.artist || '',
        original_key: s.originalKey || 'G',
        current_key: s.currentKey || 'G',
        bpm: s.bpm || 100,
        time_signature: s.timeSignature || '4/4',
        chordpro_content: s.chordProContent || '',
        tags: s.tags || [],
        status: s.status || 'pronto',
        type: s.type || 'repertorio',
        workspace_id: s.workspaceId || 'ws-ss-clarinetes',
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('songs').upsert(records, { onConflict: 'id' });
      if (error) throw new Error(`Erro no Supabase: ${error.message}`);
      return {
        success: true,
        count: records.length,
        message: `${records.length} músicas sincronizadas com sucesso no Supabase (via cliente)!`,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao sincronizar com o Supabase.' };
    }
  }
}

/**
 * Carrega o repertório oficial do Supabase para o banco local.
 *
 * Política de merge (não destrutiva):
 * - música que não existe localmente -> cria;
 * - música local que ainda não tem cifra -> completa com a do Supabase;
 * - música já editada pelo usuário -> **não** é sobrescrita.
 */
export async function mergeSongsFromSupabase(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const res = await fetch('/api/supabase/songs');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const remoteSongs: Song[] = data.songs || [];
    if (!remoteSongs.length) {
      return { success: true, count: 0, message: 'Nenhuma música encontrada no Supabase.' };
    }

    const local = await db.songs.toArray();
    const localById = new Map(local.map((s) => [s.id, s]));
    const toPut: Song[] = [];

    for (const remote of remoteSongs) {
      const mine = localById.get(remote.id);
      if (!mine) {
        toPut.push(remote);
        continue;
      }
      if (!mine.chordProContent && remote.chordProContent) {
        toPut.push({
          ...mine,
          chordProContent: remote.chordProContent,
          bpm: remote.bpm,
          timeSignature: remote.timeSignature,
          status: remote.status === 'pendente' ? mine.status : remote.status,
          artist: mine.artist || remote.artist,
          tags: remote.tags?.length ? remote.tags : mine.tags,
          block: remote.block ?? mine.block,
          orderInBlock: remote.orderInBlock ?? mine.orderInBlock,
          instrument: remote.instrument ?? mine.instrument,
        });
      }
    }

    if (toPut.length) await db.songs.bulkPut(toPut);
    return {
      success: true,
      count: toPut.length,
      message: toPut.length
        ? `${toPut.length} músicas do repertório carregadas do Supabase.`
        : 'Acervo já está atualizado.',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e?.message || 'Não foi possível carregar o repertório do Supabase.',
    };
  }
}

export async function pullSongsFromSupabase(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  // Try server first; fall back to direct Supabase client.
  try {
    const res = await fetch('/api/supabase/songs');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const remoteSongs: Song[] = data.songs || [];
    if (remoteSongs.length === 0) {
      return { success: true, count: 0, message: 'Nenhuma música encontrada no Supabase.' };
    }
    await db.songs.bulkPut(remoteSongs);
    return {
      success: true,
      count: remoteSongs.length,
      message: `${remoteSongs.length} músicas baixadas do Supabase para o banco local!`,
    };
  } catch (serverErr: any) {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Servidor /api indisponível e Supabase não configurado no cliente (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).',
      };
    }
    try {
      const { data, error } = await supabase.from('songs').select('*').order('title', { ascending: true });
      if (error) throw new Error(error.message);
      const remoteSongs: Song[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        originalKey: row.original_key || 'G',
        currentKey: row.current_key || 'G',
        mode: 'major' as const,
        bpm: row.bpm || 100,
        timeSignature: row.time_signature || '4/4',
        capo: 0,
        chordProContent: row.chordpro_content || '',
        tags: row.tags || [],
        origin: 'sugestao_ia' as any,
        type: row.type || 'repertorio',
        status: row.status || 'pronto',
        isFavorite: false,
        workspaceId: row.workspace_id || 'ws-ss-clarinetes',
        createdAt: row.created_at || row.updated_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
      if (remoteSongs.length === 0) {
        return { success: true, count: 0, message: 'Nenhuma música encontrada no Supabase.' };
      }
      await db.songs.bulkPut(remoteSongs);
      return {
        success: true,
        count: remoteSongs.length,
        message: `${remoteSongs.length} músicas baixadas do Supabase para o banco local!`,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao puxar músicas do Supabase.' };
    }
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
