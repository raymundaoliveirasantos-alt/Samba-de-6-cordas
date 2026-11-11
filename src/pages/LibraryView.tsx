import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Sparkles,
  Upload,
  Copy,
  Trash2,
  CheckSquare,
  Square,
  Music,
  Star,
  ChevronRight,
  SlidersHorizontal,
  Tag,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { db } from '../db';
import type { Song, SongType, SongStatus } from '../types';
import { useAppStore } from '../store';
import { ALL_KEYS } from '../utils/transposer';

interface LibraryViewProps {
  onSelectSong: (song: Song) => void;
  onOpenImport: () => void;
  onNewSong: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onSelectSong,
  onOpenImport,
  onNewSong,
}) => {
  const { currentWorkspaceId, userPlan } = useAppStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'autoral' | 'repertorio' | 'favorito'>('all');
  const [keyFilter, setKeyFilter] = useState<string>('all');
  const [blockFilter, setBlockFilter] = useState<'all' | 'I' | 'II' | 'III'>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');

  // AI Semantic search
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchIds, setAiMatchIds] = useState<string[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const all = await db.songs.where('workspaceId').equals(currentWorkspaceId).toArray();
      // If none found for workspace, fallback to all songs
      if (all.length === 0) {
        const fallback = await db.songs.toArray();
        setSongs(fallback);
      } else {
        setSongs(all);
      }
    } catch (e) {
      console.warn('Erro ao carregar músicas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [currentWorkspaceId]);

  // Extract unique instruments for filter
  const uniqueInstruments = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.instrument) set.add(s.instrument);
    });
    return Array.from(set);
  }, [songs]);

  // Filtered Songs List
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // AI search match filter if active
      if (aiMatchIds !== null) {
        if (!aiMatchIds.includes(song.id)) return false;
      }

      // Text search filter
      if (searchQuery.trim() && aiMatchIds === null) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchArtist = song.artist?.toLowerCase().includes(q);
        const matchNotes = song.notes?.toLowerCase().includes(q);
        const matchLyrics = song.chordProContent?.toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchNotes && !matchLyrics) return false;
      }

      // Status/Type filter
      if (statusFilter === 'pendente' && song.status !== 'pendente') return false;
      if (statusFilter === 'autoral' && song.type !== 'autoral') return false;
      if (statusFilter === 'repertorio' && song.type !== 'repertorio') return false;
      if (statusFilter === 'favorito' && !song.isFavorite) return false;

      // Key filter
      if (keyFilter !== 'all' && song.originalKey !== keyFilter) return false;

      // Block filter
      if (blockFilter !== 'all' && song.block !== blockFilter) return false;

      // Instrument filter
      if (instrumentFilter !== 'all' && song.instrument !== instrumentFilter) return false;

      return true;
    });
  }, [songs, searchQuery, statusFilter, keyFilter, blockFilter, instrumentFilter, aiMatchIds]);

  // Trigger AI Intelligent search (Requirement 4.1 & 4.7)
  const handleAiSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiExplanation(null);

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          songs: songs.map((s) => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            tags: s.tags,
            notes: s.notes,
            chordProContent: s.chordProContent,
          })),
        }),
      });

      const data = await res.json();
      if (data.matchedSongIds) {
        setAiMatchIds(data.matchedSongIds);
        setAiExplanation(data.explanation || 'Músicas encontradas por contexto harmônico e temático.');
      } else {
        setAiMatchIds([]);
        setAiExplanation('Nenhuma música encontrada no seu acervo pessoal para esta busca contextual.');
      }
    } catch (e) {
      console.warn('Erro ao chamar busca inteligente:', e);
      setAiExplanation('Não foi possível conectar ao assistente de busca inteligente. Mostrando busca por texto local.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiMatchIds(null);
    setAiExplanation(null);
    setSearchQuery('');
  };

  // Toggle Favorite
  const toggleFavorite = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = !song.isFavorite;
    await db.songs.update(song.id, { isFavorite: updated });
    setSongs((prev) => prev.map((s) => (s.id === song.id ? { ...s, isFavorite: updated } : s)));
  };

  // Duplicate song (Requirement 4.1 & 5.6)
  const duplicateSong = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: Song = {
      ...song,
      id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${song.title} (cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.songs.add(copy);
    setSongs((prev) => [copy, ...prev]);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (confirm(`Deseja excluir as ${selectedIds.length} músicas selecionadas?`)) {
      await db.songs.bulkDelete(selectedIds);
      setSongs((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setIsMultiSelectMode(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Biblioteca de Cifras
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
              {songs.length} músicas
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pesquise, transponha e organize o repertório de louvor e apresentações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedIds([]);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isMultiSelectMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isMultiSelectMode ? 'Cancelar Seleção' : 'Selecionar Várias'}
          </button>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow transition"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            Importar Arquivo
          </button>

          {/* New Song Button */}
          <button
            onClick={onNewSong}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Nova Música
          </button>
        </div>
      </div>

      {/* Multi-Select Floating Bar */}
      {isMultiSelectMode && selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-bold text-amber-300">
            {selectedIds.length} {selectedIds.length === 1 ? 'música selecionada' : 'músicas selecionadas'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir Selecionadas
            </button>
          </div>
        </div>
      )}

      {/* 2. SEARCH BAR & AI INTELLIGENT SEARCH (Requirement 4.1) */}
      <div className="space-y-3 mb-6">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (aiMatchIds !== null) setAiMatchIds(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredSongs.length === 0) {
                handleAiSmartSearch();
              }
            }}
            placeholder="Buscar por título, artista, trecho da letra (ex: 'aquela música que fala de mar')..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-32 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner transition"
          />

          {searchQuery && (
            <button
              onClick={clearAiSearch}
              className="absolute right-28 text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}

          {/* AI Search button */}
          <button
            onClick={handleAiSmartSearch}
            disabled={isAiSearching || !searchQuery.trim()}
            className="absolute right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40"
            title="Buscar com IA por contexto semântico"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Buscar com IA</span>
          </button>
        </div>

        {/* AI Search Feedback */}
        {aiExplanation && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{aiExplanation}</span>
            </div>
            <button
              onClick={clearAiSearch}
              className="text-amber-400 font-bold hover:underline ml-2"
            >
              Ver todas
            </button>
          </div>
        )}

        {/* 3. FILTER PILLS & DROPDOWNS */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Status Pills */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todas ({songs.length})
          </button>

          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              statusFilter === 'pendente'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-amber-300/80 hover:text-amber-200 border border-slate-800'
            }`}
          >
            Faltando Cifra ({songs.filter((s) => s.status === 'pendente').length})
          </button>

          <button
            onClick={() => setStatusFilter('autoral')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              statusFilter === 'autoral'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-emerald-300/80 hover:text-emerald-200 border border-slate-800'
            }`}
          >
            Autorais ({songs.filter((s) => s.type === 'autoral').length})
          </button>

          <button
            onClick={() => setStatusFilter('repertorio')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              statusFilter === 'repertorio'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-300 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Repertório ({songs.filter((s) => s.type === 'repertorio').length})
          </button>

          <button
            onClick={() => setStatusFilter('favorito')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              statusFilter === 'favorito'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            ★ Favoritas
          </button>

          {/* Block Selector */}
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Blocos</option>
            <option value="I">Bloco I</option>
            <option value="II">Bloco II</option>
            <option value="III">Bloco III</option>
          </select>

          {/* Key Selector */}
          <select
            value={keyFilter}
            onChange={(e) => setKeyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Tons</option>
            <option value="??">Tom a definir (??)</option>
            {ALL_KEYS.map((k: string) => (
              <option key={k} value={k}>
                Tom {k}
              </option>
            ))}
          </select>

          {/* Instrument Filter */}
          {uniqueInstruments.length > 0 && (
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-cyan-300 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos Instrumentos</option>
              {uniqueInstruments.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 4. SONG LIST / CARDS */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 animate-pulse">
          Carregando acervo de músicas...
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 p-12 text-center my-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            Nenhuma música encontrada para os filtros atuais
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Tente buscar com outros termos, limpar os filtros ou realizar uma busca inteligente com IA.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setKeyFilter('all');
                setBlockFilter('all');
                setInstrumentFilter('all');
                setAiMatchIds(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleAiSmartSearch}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Buscar com IA
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSongs.map((song) => {
            const isSelected = selectedIds.includes(song.id);
            const isAutoral = song.type === 'autoral';
            const isPending = song.status === 'pendente';
            const isIntro = song.title.startsWith('(Intro');

            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isMultiSelectMode) {
                    setSelectedIds((prev) =>
                      isSelected ? prev.filter((id) => id !== song.id) : [...prev, song.id]
                    );
                  } else {
                    onSelectSong(song);
                  }
                }}
                className={`group relative rounded-2xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Checkbox for multiselect */}
                {isMultiSelectMode && (
                  <div className="absolute top-4 right-4">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 pr-6">
                    {/* Block or number indicator */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                      {song.block && (
                        <span className="font-semibold text-slate-400">
                          Bloco {song.block}
                          {song.orderInBlock ? ` #${song.orderInBlock}` : ''}
                        </span>
                      )}
                      {song.block && <span className="text-slate-600">•</span>}
                      {isAutoral && (
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-500/15 px-2 py-0.2 rounded border border-emerald-500/30">
                          Autoral
                        </span>
                      )}
                      {isPending && (
                        <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] bg-amber-500/15 px-2 py-0.2 rounded border border-amber-500/30">
                          Pendente
                        </span>
                      )}
                      {isIntro && (
                        <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] bg-cyan-500/15 px-2 py-0.2 rounded border border-cyan-500/30">
                          Intro
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {song.artist || (isAutoral ? 'Banda SSC' : 'Artista a definir')}
                    </p>
                  </div>

                  {/* Favorite button */}
                  {!isMultiSelectMode && (
                    <button
                      onClick={(e) => toggleFavorite(song, e)}
                      className={`p-1 rounded-lg transition ${
                        song.isFavorite
                          ? 'text-amber-400'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={song.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      aria-label="Favoritar"
                    >
                      <Star className={`w-4 h-4 ${song.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Footer metadata: Key, Instrument, BPM */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        song.originalKey === '??'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-amber-400 border border-slate-800'
                      }`}
                      title={song.originalKey === '??' ? 'Tom a definir' : `Tom ${song.originalKey}`}
                    >
                      {song.originalKey}
                    </span>

                    {song.instrument && (
                      <span className="text-[11px] text-cyan-300 truncate max-w-[120px]">
                        🎷 {song.instrument}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Duplicate button */}
                    <button
                      onClick={(e) => duplicateSong(song, e)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                      title="Duplicar música"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
